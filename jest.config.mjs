/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

export default {
	coverageProvider: "v8",
	projects: [{
		displayName: "components",
		maxWorkers: "50%",
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
			//   "**/__tests__/**/*.[jt]s?(x)",
			//   "**/?(*.)+(spec|test).[tj]s?(x)"
		],
		transformIgnorePatterns: [
			"/node_modules/(?!react-dnd|dnd-core|@react-dnd|dnd-multi-backend|rdndmb-html5-to-touch)",
			"\\.pnp\\.[^\\/]+$"
		],
	}, {
		displayName: "snapshots",
		maxWorkers: "50%",
		globalSetup: "./test/utils/browserstack-global-setup.js",
		globalTeardown: "./test/utils/browserstack-global-teardown.js",
		setupFiles: ['./test/utils/jest-snapshots-setup.js'],
		testMatch: [
			"<rootDir>/test/playwright/*.test.js?(x)",
		],
	}],
};
