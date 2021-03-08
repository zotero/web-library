const presets = [
	["@babel/preset-env", {
		"debug": !!process.env.DEBUG || false,
		"corejs": { version: 3, proposals: true },
		"useBuiltIns": "usage",
		"ignoreBrowserslistConfig": true,
		"targets": "firefox >= 68, chrome >=67, edge >= 15, safari >= 10, last 2 versions, not dead, not ie 11, not ie 10"
	}],
	"@babel/preset-react"
];

const plugins = [
	["@babel/plugin-proposal-class-properties", { "loose" : true }]
];

module.exports = { presets, plugins };