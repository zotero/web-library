import schema from 'zotero-schema/schema.json';
import { configureZotero } from '../src/js/utils';

const setNavigatorLanguage = value => {
	Object.defineProperty(navigator, 'language', { value, configurable: true });
};

describe('configureZotero', () => {
	afterEach(() => {
		delete navigator.language;
	});

	test('does not throw when navigator.language is a malformed locale tag', () => {
		setNavigatorLanguage('en_US.UTF-8.invalid');
		expect(() => configureZotero(schema)).not.toThrow();
	});
});
