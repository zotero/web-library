const presets = [
	["@babel/preset-env", {
		"debug": !!process.env.DEBUG || false,
	}],
	['@babel/preset-react', {
		'runtime': 'automatic',
		'development': process.env.NODE_ENV === 'development',
		'importSource': process.env.NODE_ENV === 'development' ? '@welldone-software/why-did-you-render' : undefined,
	}],
];

const plugins = [
	// Babel 8 removed preset-env's `useBuiltIns`/`corejs` options; core-js
	// usage-based polyfilling now lives in babel-plugin-polyfill-corejs3.
	["babel-plugin-polyfill-corejs3", {
		"method": "usage-global",
		"version": "3.49",
	}],
	"babel-plugin-transform-import-meta",
	"@babel/plugin-syntax-import-attributes"
];

module.exports = { presets, plugins };