import globals from "globals";
import js from "@eslint/js";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jestDom from "eslint-plugin-jest-dom";

const languageOptions = {
	globals: {
		...globals.browser,
		...globals.node,
	},
	ecmaVersion: "latest",
	sourceType: "module",
	parserOptions: {
		ecmaFeatures: { jsx: true },
	},
};

const reactSettings = {
	react: { version: "detect" },
};

const reactRules = {
	// React recommended + JSX runtime presets
	...(reactPlugin.configs?.recommended?.rules ?? {}),
	...(reactPlugin.configs?.["jsx-runtime"]?.rules ?? {}),

	"react/prop-types": "off",
};

export default [
	// Only lint scripts, application sources, tests and root config files
	{
		ignores: ["*", "!scripts/", "!src/", "src/*", "!src/js/", "!test/", "!*.config.{js,mjs,cjs}"],
	},

	// ESLint core recommended rules
	js.configs.recommended,

	// Project rules and plugin configs
	{
		files: ["src/js/**/*.{js,jsx}"],
		languageOptions,
		settings: reactSettings,
		plugins: {
			react: reactPlugin,
			"react-hooks": reactHooks,
		},
		rules: {
			...reactRules,

			// React Hooks recommended
			"react-hooks/rules-of-hooks": "error",
			"react-hooks/exhaustive-deps": "warn",
		},
	},
	// Jest and Playwright tests, test utilities and mocks
	{
		files: ["test/**/*.{js,jsx}"],
		languageOptions: {
			...languageOptions,
			globals: {
				...languageOptions.globals,
				...globals.jest,
			},
		},
		settings: reactSettings,
		plugins: {
			react: reactPlugin,
			"jest-dom": jestDom,
			"react-hooks": reactHooks,
		},
		rules: {
			...reactRules,
			...(jestDom.configs?.recommended?.rules ?? {}),
		},
	},
	// Build tools and config files
	{
		files: ["scripts/**/*.mjs", "*.config.{js,mjs,cjs}"],
		languageOptions: {
			globals: {
				...globals.node,
			},
		},
	},
];
