/*
* @jest-environment ./test/utils/zotero-env.js
*/

import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { getPatchedState, JSONtoState } from './utils/state';
import { setupStore } from '../src/js/store';
import { currentCopyToLibrary } from '../src/js/actions/current';
import { setupMSWLifecycle } from './utils/msw-lifecycle';
import stateRaw from './fixtures/state/desktop-test-user-item-view.json';

// HHVQTHFT is loaded and has a child. The other selected item isn't loaded and has no children.
const unfetchedItem = {
	key: 'UNFCH001',
	version: 1000,
	library: { type: 'user', id: 1, name: 'testuser', links: {} },
	links: {},
	meta: { numChildren: 0 },
	data: {
		key: 'UNFCH001', version: 1000, itemType: 'book', title: 'Unfetched Item', creators: [], tags: [],
		collections: [], relations: {}
	},
};

const makeWriteResponse = objects => ({
	successful: Object.fromEntries(objects.map((object, index) => {
		const key = object.key ?? `NEWITEM${index}`;
		return [index, { key, version: 20, data: { ...object, key, version: 20 } }];
	})),
	success: Object.fromEntries(objects.map((object, index) => [index, object.key ?? `NEWITEM${index}`])),
	unchanged: {},
	failed: {},
});

describe('Copy to another library', () => {
	const server = setupServer();
	setupMSWLifecycle(server);

	let fetchedKeys, copiedItems, childrenRequestedFor;

	const setupCopy = respondToSelectedItemsFetch => {
		fetchedKeys = [];
		copiedItems = [];
		childrenRequestedFor = [];
		server.use(
			http.get('https://api.zotero.org/users/1/items', ({ request }) => {
				fetchedKeys.push(...new URL(request.url).searchParams.get('itemKey').split(','));
				return respondToSelectedItemsFetch();
			}),
			http.get('https://api.zotero.org/users/1/items/:itemKey/children', ({ params }) => {
				childrenRequestedFor.push(params.itemKey);
				return HttpResponse.json([], { headers: { 'Total-Results': '0' } });
			}),
			http.get('https://api.zotero.org/groups/5119976/settings/tagColors', () => HttpResponse.json({})),
			http.post('https://api.zotero.org/groups/5119976/items', async ({ request }) => {
				const items = await request.json();
				copiedItems.push(...items);
				return HttpResponse.json(makeWriteResponse(items), { headers: { 'Last-Modified-Version': '20' } });
			}),
			// stores the relation to the copies on the source items
			http.post('https://api.zotero.org/users/1/items', async ({ request }) => {
				return HttpResponse.json(makeWriteResponse(await request.json()), { headers: { 'Last-Modified-Version': '420' } });
			}),
		);
		return setupStore(getPatchedState(JSONtoState(stateRaw), 'current', { itemKeys: ['HHVQTHFT', 'UNFCH001'] }));
	};

	test('Loads unfetched selected items, then fetches children only of items that have some', async () => {
		const store = setupCopy(() => HttpResponse.json([unfetchedItem], { headers: { 'Total-Results': '1' } }));

		await store.dispatch(currentCopyToLibrary('g5119976'));

		expect(fetchedKeys).toEqual(['UNFCH001']);
		expect(copiedItems.map(i => i.title)).toEqual([
			'Breed differences in social cognition, inhibitory control, and spatial problem-solving ability in the domestic dog (Canis familiaris) | Scientific Reports',
			'Unfetched Item',
		]);
		expect(childrenRequestedFor).toEqual(['HHVQTHFT']);
	});

	const unloadableCases = [
		['the request fails', () => new HttpResponse('Test failure', { status: 400 })],
		['the item no longer exists', () => HttpResponse.json([], { headers: { 'Total-Results': '0' } })],
	];

	test.each(unloadableCases)('Copies nothing when an unfetched selected item can\'t be loaded because %s', async (_, respond) => {
		const store = setupCopy(respond);

		await store.dispatch(currentCopyToLibrary('g5119976'));

		expect(fetchedKeys).toEqual(['UNFCH001']);
		expect(copiedItems).toEqual([]);
		const { errors, libraries } = store.getState();
		expect(errors[0].message).toBe('Some of the selected items could not be loaded.');
		expect(libraries.u1.sync.requestsPending).toBe(0);
	});
});
