const presets = [
	["@babel/preset-env", { "debug": !!process.env.DEBUG || false, "corejs": 3, "useBuiltIns": "usage" }],
	"@babel/preset-react"
];

const plugins = [
	["@babel/plugin-proposal-class-properties", { "loose" : true }]
];

module.exports = { presets, plugins };
