import { test, expect } from "../utils/playwright-fixtures.js";
import { closeServer, loadFixtureState, makeCustomHandler, makeGate, makeGatedHandler } from "../utils/fixed-state-server.js";

// Regression test for `remoteLibraryUpdate` fan-out: a burst of `topicUpdated`
// messages from the streaming server must result in only 1-2 requests per
// endpoint.

const EXPECTED_MAX_PER_ENDPOINT = 2;

// The since=* endpoints are gated so the initial fan-out stays in flight
// until the test calls gate.release(). Without gating, localhost responses
// can land between dispatches and reset isCatchingUp, defeating coalescing
// and turning the test into a race. The /api/ catch-all (tagColors etc.)
// responds immediately -- it is fire-and-forget from remoteLibraryUpdate.
function makeSinceHandlers(gate) {
	return [
		makeGatedHandler('/api/users/1/collections', [], gate, { totalResults: 0, version: 1 }),
		makeGatedHandler('/api/users/1/deleted', {
			items: [], collections: [], tags: [], settings: [], searches: []
		}, gate, { version: 1 }),
		makeGatedHandler('/api/users/1/items', [], gate, { totalResults: 0, version: 1 }),
		makeCustomHandler('/api/', [], { totalResults: 0, version: 1 }),
	];
}

function captureSinceRequests(page) {
	const captured = [];
	let baselineTs = null;
	page.on('request', req => {
		const url = req.url();
		if (!/\/api\/users\/1\/.*[?&]since=/.test(url)) {
			return;
		}
		const now = Date.now();
		if (baselineTs === null) {
			baselineTs = now;
		}
		const parsed = new URL(url);
		captured.push({
			path: parsed.pathname,
			since: parsed.searchParams.get('since'),
			start: parsed.searchParams.get('start'),
			offsetMs: now - baselineTs,
		});
	});
	return captured;
}

function captureAllApiRequests(page) {
	const captured = [];
	page.on('request', req => {
		const url = req.url();
		if (!/\/api\/users\/1\//.test(url)) {
			return;
		}
		const parsed = new URL(url);
		captured.push({
			path: parsed.pathname,
			since: parsed.searchParams.get('since'),
		});
	});
	return captured;
}

function summarize(captured) {
	const countByPath = {};
	const sinceByPath = {};
	for (const r of captured) {
		countByPath[r.path] = (countByPath[r.path] || 0) + 1;
		(sinceByPath[r.path] = sinceByPath[r.path] || []).push(r.since);
	}
	return { countByPath, sinceByPath };
}

test.describe('Remote library update fan-out', () => {
	let server;

	test.afterEach(async () => {
		await closeServer(server);
	});

	test('a burst of events while a sync is in flight should coalesce to at most one initial + one trailing sync per endpoint', async ({ page, serverPort }) => {
		const gate = makeGate();
		server = await loadFixtureState('desktop-test-user-library-view', serverPort, page, makeSinceHandlers(gate));
		const captured = captureSinceRequests(page);

		// Each dispatch runs in its own page.evaluate so each resumes on a fresh JS
		// tick, mirroring how WS messages actually arrive (each onmessage gets its
		// own task) and avoiding a Firefox quirk where multiple synchronous fetches
		// in one evaluate don't all surface as observable requests. Baseline
		// sync.version is 394, so oldVersion=394 for event 1 and climbs as
		// STREAMING_REMOTE_LIBRARY_UPDATE lands. The gate holds the since-fetches in
		// flight so isCatchingUp stays true and events 2-5 coalesce via pendingTarget.
		const firstCollectionsInFlight = page.waitForRequest(/\/api\/users\/1\/collections\?.*since=394/);

		await page.evaluate(() => {
			window.WebLibStore.dispatch(window.WebLibActions.remoteLibraryUpdate('u1', 395));
		});

		// Confirm event 1's /collections fetch is physically on the wire before the
		// remaining events dispatch -- makes the "events arrive while a sync is in
		// flight" coalescing path explicit rather than implied by the gate.
		await firstCollectionsInFlight;

		await page.evaluate(() => {
			window.WebLibStore.dispatch(window.WebLibActions.remoteLibraryUpdate('u1', 396));
		});
		await page.evaluate(() => {
			window.WebLibStore.dispatch(window.WebLibActions.remoteLibraryUpdate('u1', 397));
		});
		await page.evaluate(() => {
			window.WebLibStore.dispatch(window.WebLibActions.remoteLibraryUpdate('u1', 398));
		});
		await page.evaluate(() => {
			window.WebLibStore.dispatch(window.WebLibActions.remoteLibraryUpdate('u1', 399));
		});

		gate.release();
		// Wait until the sync state has caught up to the highest dispatched
		// version *and* no further requests are pending, which also covers
		// the trailing fan-out if one fires. networkidle alone is not enough:
		// it can resolve in the microtask gap between the initial responses
		// arriving and the trailing fetches being sent.
		await page.waitForFunction(() => {
			const sync = window.WebLibStore.getState().libraries?.u1?.sync;
			return sync && !sync.isCatchingUp && sync.requestsPending === 0 && sync.version >= 399;
		});

		const { countByPath } = summarize(captured);

		// At least one full fan-out (initial wave) must have happened.
		expect(countByPath['/api/users/1/collections']).toBeGreaterThan(0);
		expect(countByPath['/api/users/1/deleted']).toBeGreaterThan(0);
		expect(countByPath['/api/users/1/items']).toBeGreaterThan(0);

		// Post-fix ceiling: one initial sync + at most one trailing-edge chase
		// per endpoint. Pre-fix produces 5 waves per endpoint, so this fails.
		expect(countByPath['/api/users/1/collections']).toBeLessThanOrEqual(EXPECTED_MAX_PER_ENDPOINT);
		expect(countByPath['/api/users/1/deleted']).toBeLessThanOrEqual(EXPECTED_MAX_PER_ENDPOINT);
		expect(countByPath['/api/users/1/items']).toBeLessThanOrEqual(EXPECTED_MAX_PER_ENDPOINT);

		// Earliest since must be the fixture baseline 394.
		const allSinceValues = captured.map(r => Number(r.since));
		expect(Math.min(...allSinceValues)).toBe(394);
	});

	test('reader view fetches only reader-specific settings and coalesces a burst to at most one initial + one trailing wave per setting', async ({ page, serverPort }) => {
		// Two-phase handler setup: the reader fixture fetches readerCustomThemes
		// and the page-index setting on mount, so initial load needs immediate
		// responses. After load completes we prepend gated handlers for those
		// two URLs so the catch-up burst is held in flight. Handlers are checked
		// in array order, so the prepended gated handlers take precedence over
		// the /api/users/1/settings/ catch-all.
		const handlers = [
			makeCustomHandler('/api/users/1/settings/', { value: null, version: 1 }, { version: 1 }),
			makeCustomHandler('/api/', [], { totalResults: 0, version: 1 }),
		];
		server = await loadFixtureState('desktop-test-user-reader-view', serverPort, page, handlers);

		const gate = makeGate();
		handlers.unshift(
			makeGatedHandler('/api/users/1/settings/lastPageIndex_u_N2PJUHD6', { value: null, version: 1 }, gate, { version: 1 }),
			makeGatedHandler('/api/users/1/settings/readerCustomThemes', { value: null, version: 1 }, gate, { version: 1 }),
		);

		const captured = captureAllApiRequests(page);

		// Baseline sync.version is 394. STREAMING_REMOTE_LIBRARY_UPDATE bumps it
		// synchronously inside event 1's thunk, so events 2-5 hit isCatchingUp and
		// only bump pendingTarget. The gate holds the reader settings in flight
		// across all dispatches to keep isCatchingUp true.
		const firstThemesInFlight = page.waitForRequest(/\/api\/users\/1\/settings\/readerCustomThemes/);

		await page.evaluate(() => {
			window.WebLibStore.dispatch(window.WebLibActions.remoteLibraryUpdate('u1', 395));
		});

		await firstThemesInFlight;

		await page.evaluate(() => {
			window.WebLibStore.dispatch(window.WebLibActions.remoteLibraryUpdate('u1', 396));
		});
		await page.evaluate(() => {
			window.WebLibStore.dispatch(window.WebLibActions.remoteLibraryUpdate('u1', 397));
		});
		await page.evaluate(() => {
			window.WebLibStore.dispatch(window.WebLibActions.remoteLibraryUpdate('u1', 398));
		});
		await page.evaluate(() => {
			window.WebLibStore.dispatch(window.WebLibActions.remoteLibraryUpdate('u1', 399));
		});

		gate.release();
		await page.waitForFunction(() => {
			const sync = window.WebLibStore.getState().libraries?.u1?.sync;
			return sync && !sync.isCatchingUp && sync.requestsPending === 0 && sync.version >= 399;
		});

		const { countByPath } = summarize(captured);

		// Reader view must NOT fire the library-wide since-fetches.
		expect(captured.filter(r => r.since !== null)).toHaveLength(0);
		expect(countByPath['/api/users/1/items']).toBeUndefined();
		expect(countByPath['/api/users/1/collections']).toBeUndefined();
		expect(countByPath['/api/users/1/deleted']).toBeUndefined();

		// Each reader-specific setting must fire and be coalesced across the burst.
		// Pre-fix would produce 5 waves per setting; post-fix caps at one initial
		// + one trailing wave.
		expect(countByPath['/api/users/1/settings/readerCustomThemes']).toBeGreaterThan(0);
		expect(countByPath['/api/users/1/settings/readerCustomThemes']).toBeLessThanOrEqual(EXPECTED_MAX_PER_ENDPOINT);

		expect(countByPath['/api/users/1/settings/lastPageIndex_u_N2PJUHD6']).toBeGreaterThan(0);
		expect(countByPath['/api/users/1/settings/lastPageIndex_u_N2PJUHD6']).toBeLessThanOrEqual(EXPECTED_MAX_PER_ENDPOINT);

		// tagColors is fire-and-forget but still gated by isCatchingUp, so events
		// 2-5 do not re-dispatch it either.
		expect(countByPath['/api/users/1/settings/tagColors']).toBeGreaterThan(0);
		expect(countByPath['/api/users/1/settings/tagColors']).toBeLessThanOrEqual(EXPECTED_MAX_PER_ENDPOINT);
	});
});
