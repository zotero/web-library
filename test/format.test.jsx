import { dateLocalized } from '../src/js/common/format';

const setNavigatorLanguage = value => {
	Object.defineProperty(navigator, 'language', { value, configurable: true });
};

describe('dateLocalized', () => {
	const date = new Date('2020-01-15T12:34:56Z');

	afterEach(() => {
		delete navigator.language;
	});

	test('does not throw and falls back to en-US when navigator.language is a malformed locale tag', () => {
		// Some browsers report the POSIX "C" locale as "c", which is not a valid BCP-47 tag
		setNavigatorLanguage('c');
		expect(() => dateLocalized(date)).not.toThrow();
		expect(dateLocalized(date)).toBe(date.toLocaleString('en-US'));
	});

	test('normalizes a POSIX-style locale before formatting', () => {
		setNavigatorLanguage('en_US.UTF-8');
		expect(() => dateLocalized(date)).not.toThrow();
		expect(dateLocalized(date)).toBe(date.toLocaleString('en-US'));
	});

	test('uses a valid navigator.language unchanged', () => {
		setNavigatorLanguage('fr-FR');
		expect(dateLocalized(date)).toBe(date.toLocaleString('fr-FR'));
	});

	test('returns an empty string for an invalid date', () => {
		setNavigatorLanguage('c');
		expect(dateLocalized(new Date('not-a-date'))).toBe('');
	});

	test('returns an empty string for a non-Date value', () => {
		setNavigatorLanguage('en-US');
		expect(dateLocalized('2020-01-15')).toBe('');
	});
});
