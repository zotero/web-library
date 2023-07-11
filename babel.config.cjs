const presets = [
	["@babel/preset-env", {
		"debug": !!process.env.DEBUG || false,
		"corejs": { version: 3 },
		"useBuiltIns": "usage",
	}],
	['@babel/preset-react', { 'runtime': 'automatic' }],
];

module.exports = { presets };