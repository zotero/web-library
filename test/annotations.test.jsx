import { annotationItemToJSON } from '../src/js/common/annotations';

describe('annotationItemToJSON', () => {
	test('lists coloured tags first, by colour position, then the other tags by name', () => {
		const item = {
			key: 'ABCD2345',
			annotationType: 'highlight',
			annotationPosition: '{"pageIndex":0,"rects":[[0,0,1,1]]}',
			dateModified: '2026-11-27T12:00:00Z',
			tags: [{ tag: 'apple' }, { tag: 'blue' }, { tag: 'red' }, { tag: 'zebra' }],
		};
		const tagColors = new Map([
			['red', { tag: 'red', color: '#ff6666', position: 0 }],
			['blue', { tag: 'blue', color: '#2ea8e5', position: 1 }],
		]);

		expect(annotationItemToJSON(item, { tagColors }).tags).toEqual([
			{ name: 'red', color: '#ff6666' },
			{ name: 'blue', color: '#2ea8e5' },
			{ name: 'apple' },
			{ name: 'zebra' },
		]);
	});
});
