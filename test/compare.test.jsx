import { compare } from '../src/js/utils';

describe('compare', () => {
	test('orders numbers numerically', () => {
		expect([10, 2, 1].sort(compare)).toEqual([1, 2, 10]);
	});

	test('treats strings differing only in case as equal but not those differing in accents', () => {
		expect(compare('apple', 'Apple')).toBe(0);
		expect(compare('resume', 'résumé')).not.toBe(0);
	});

	test('places empty values after actual values', () => {
		expect(['b', null, 'a', undefined].sort(compare)).toEqual(['a', 'b', null, undefined]);
	});
});
