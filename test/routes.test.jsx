import { getParamsFromPath } from '../src/js/common/state';

describe('Router', () => {
	test('should extract parameters from path', async () => {
		expect(getParamsFromPath('/testuser/collections/AUWS6PZR/tags/To%20Read/search/foobar/titleCreatorYear/items/AC5THFQR/note/U887KVH4/item-details')).toMatchObject({
			userslug: 'testuser',
			source: 'collections',
			collection: 'AUWS6PZR',
			tags: 'To Read',
			search: 'foobar',
			items: 'AC5THFQR',
			note: 'U887KVH4',
			view: 'item-details',
		});
		expect(getParamsFromPath('/groups/2320750/some_group_name/collections/VGAF94PF/item-list')).toMatchObject({
			groupid: '2320750',
			groupslug: 'some_group_name',
			source: 'collections',
			collection: 'VGAF94PF',
			view: 'item-list',
		});
		expect(getParamsFromPath('/someuser/collections/AUWS6PZR/items/GDICEITX/attachment/JVWK7W2K/reader')).toMatchObject({
			userslug: 'someuser',
			source: 'collections',
			collection: 'AUWS6PZR',
			items: 'GDICEITX',
			attachment: 'JVWK7W2K',
			view: 'reader',
		});
		expect(getParamsFromPath('/someuser/trash/items/MDKIEJRT')).toMatchObject({
			userslug: 'someuser',
			source: 'trash',
			items: 'MDKIEJRT',
		});
		expect(getParamsFromPath('/someuser/publications/items/MDKIEJRT')).toMatchObject({
			userslug: 'someuser',
			source: 'publications',
			items: 'MDKIEJRT',
		});
	});
	test('should not match invalid paths', () => {
		expect(getParamsFromPath('/someuser/invalidsource/items/MDKIEJRT')).toBeNull();
		expect(getParamsFromPath('/someuser/trash/AUWS6PZR/items/GDICEITX/attachment/JVWK7W2K/reader')).toBeNull(); // collection id must not be specified if source is trash
	});
	// Groups with unicode characters produce empty slugs (see #552)
	test('should accept empty groupslug', () => {
		expect(getParamsFromPath('/groups/2320750//collections/VGAF94PF/item-list')).toMatchObject({
			groupid: '2320750',
			groupslug: '',
			source: 'collections',
			collection: 'VGAF94PF',
			view: 'item-list',
		});
	});
});
