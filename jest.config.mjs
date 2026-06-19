/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

export default {
	coverageProvider: "v8",
	maxWorkers: process.env.CI ? '50%' : '100%',
	moduleDirectories: [
		"src/js/",
		"modules",
		"node_modules",
	],
	moduleNameMapper: {
		'^web-worker:(?:..?/)+(.*)$': '<rootDir>/test/mocks/$1',
		'^(?:.*?)/zotero-streaming-client$': '<rootDir>/test/mocks/noop.js',
		'^react-virtualized-auto-sizer$': '<rootDir>/test/mocks/react-virtualized-auto-sizer.js',
	},
	restoreMocks: true,
	setupFiles: ['./test/utils/jest-setup.js'],
	testEnvironment: "./test/utils/env-with-fetch.js",
	testEnvironmentOptions: {
		customExportConditions: [''],
	},
	testMatch: [
		"<rootDir>/test/*.test.js?(x)",
	],
	transform: {
		// Same as Jest's default, but also routes `.mjs` through babel-jest so that
		// ESM-only dependencies (e.g. `rettime`, pulled in by msw) can be transpiled.
		"^.+\\.m?[jt]sx?$": "babel-jest",
	},
	transformIgnorePatterns: [
		"/node_modules/(?!until-async|balanced-match|react-dnd|dnd-core|@react-dnd|dnd-multi-backend|rdndmb-html5-to-touch|rettime|@open-draft/deferred-promise)",
		"\\.pnp\\.[^\\/]+$"
	],
};
