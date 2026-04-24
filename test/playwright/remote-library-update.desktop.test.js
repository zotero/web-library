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

	test('5 events arriving within a few ms should coalesce to at most one initial + one trailing sync per endpoint', async ({ page, serverPort }) => {
		const gate = makeGate();
		server = await loadFixtureState('desktop-test-user-library-view', serverPort, page, makeSinceHandlers(gate));
		const captured = captureSinceRequests(page);

		// Fire five events. 395+396 synchronously in the same tick; 397 a few ms later;
		// 398+399 synchronously together. Baseline sync.version is 394, so oldVersion=394
		// for the first event and climbs as STREAMING_REMOTE_LIBRARY_UPDATE lands.
		// The gate keeps the initial fan-out in flight across all dispatches so
		// isCatchingUp stays true and 396-399 coalesce via pendingTarget.
		await page.evaluate(async () => {
			const { WebLibStore, WebLibActions } = window;
			const wait = ms => new Promise(r => setTimeout(r, ms));
			const libraryKey = 'u1';

			WebLibStore.dispatch(WebLibActions.remoteLibraryUpdate(libraryKey, 395));
			WebLibStore.dispatch(WebLibActions.remoteLibraryUpdate(libraryKey, 396));

			await wait(3);
			WebLibStore.dispatch(WebLibActions.remoteLibraryUpdate(libraryKey, 397));

			await wait(5);
			WebLibStore.dispatch(WebLibActions.remoteLibraryUpdate(libraryKey, 398));
			WebLibStore.dispatch(WebLibActions.remoteLibraryUpdate(libraryKey, 399));
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
		// per endpoint. Pre-fix produces 5 collections + 5 deleted, so this fails.
		expect(countByPath['/api/users/1/collections']).toBeLessThanOrEqual(EXPECTED_MAX_PER_ENDPOINT);
		expect(countByPath['/api/users/1/deleted']).toBeLessThanOrEqual(EXPECTED_MAX_PER_ENDPOINT);
		expect(countByPath['/api/users/1/items']).toBeLessThanOrEqual(EXPECTED_MAX_PER_ENDPOINT);

		// Earliest since must be the fixture baseline 394.
		const allSinceValues = captured.map(r => Number(r.since));
		expect(Math.min(...allSinceValues)).toBe(394);
	});

	test('events arriving while the first sync is in flight should coalesce', async ({ page, serverPort }) => {
		const gate = makeGate();
		server = await loadFixtureState('desktop-test-user-library-view', serverPort, page, makeSinceHandlers(gate));
		const captured = captureSinceRequests(page);

		// Arm a listener *before* dispatching so we catch the first outbound /collections
		// request. Then dispatch event #1; once that request is actually in flight,
		// dispatch two more events. This explicitly exercises the "in-flight guard"
		// path (as opposed to the synchronous-burst path covered by the other test).
		// Gated handlers keep the request open -- it reaches the server but the
		// response is held until gate.release().
		const firstCollectionsInFlight = page.waitForRequest(/\/api\/users\/1\/collections\?.*since=394/);

		await page.evaluate(() => {
			window.WebLibStore.dispatch(
				window.WebLibActions.remoteLibraryUpdate('u1', 395)
			);
		});

		await firstCollectionsInFlight;

		// Two separate page.evaluate calls deliberately. Each resumes on a fresh JS
		// tick, which mirrors how WS messages actually arrive (each onmessage gets its
		// own task) -- and avoids a Firefox-specific quirk where two synchronous
		// dispatches inside one page.evaluate don't both surface as network requests.
		await page.evaluate(() => window.WebLibStore.dispatch(
			window.WebLibActions.remoteLibraryUpdate('u1', 396)
		));
		await page.evaluate(() => window.WebLibStore.dispatch(
			window.WebLibActions.remoteLibraryUpdate('u1', 397)
		));

		gate.release();
		// Wait until the sync state has caught up to the highest dispatched
		// version *and* no further requests are pending, which also covers
		// the trailing fan-out if one fires. See note in the other test.
		await page.waitForFunction(() => {
			const sync = window.WebLibStore.getState().libraries?.u1?.sync;
			return sync && !sync.isCatchingUp && sync.requestsPending === 0 && sync.version >= 397;
		});

		const { countByPath } = summarize(captured);

		expect(countByPath['/api/users/1/collections']).toBeGreaterThan(0);
		expect(countByPath['/api/users/1/deleted']).toBeGreaterThan(0);
		expect(countByPath['/api/users/1/items']).toBeGreaterThan(0);

		// Post-fix: the first wave (since=394) plus at most one trailing-edge wave
		// to chase any pendingTarget not covered by the response's Last-Modified-
		// Version. Pre-fix: each of the 3 events fans out independently.
		expect(countByPath['/api/users/1/collections']).toBeLessThanOrEqual(EXPECTED_MAX_PER_ENDPOINT);
		expect(countByPath['/api/users/1/deleted']).toBeLessThanOrEqual(EXPECTED_MAX_PER_ENDPOINT);
		expect(countByPath['/api/users/1/items']).toBeLessThanOrEqual(EXPECTED_MAX_PER_ENDPOINT);

		const allSinceValues = captured.map(r => Number(r.since));
		expect(Math.min(...allSinceValues)).toBe(394);
	});
});
