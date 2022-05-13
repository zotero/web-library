const presets = [
	["@babel/preset-env", {
		"debug": !!process.env.DEBUG || false,
		"corejs": { version: 3 },
		"useBuiltIns": "usage"
	}],
	"@babel/preset-react"
];

module.exports = { presets };