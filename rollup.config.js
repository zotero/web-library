import * as path from 'path';

import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import filesize from 'rollup-plugin-filesize';
import json from '@rollup/plugin-json';
import replace from '@rollup/plugin-replace';
import resolve from '@rollup/plugin-node-resolve';
import sizes from 'rollup-plugin-sizes';
import webWorkerLoader from 'rollup-plugin-web-worker-loader';
import alias from '@rollup/plugin-alias';
import terser from '@rollup/plugin-terser';
import virtual from '@rollup/plugin-virtual';
import { visualizer } from "rollup-plugin-visualizer";

// Embedded doesn't need drag and drop so implementation below is used instead to reduce few KBs
// while re-using the same code for both targets.
const stubdnd = `
	const useDrag = () => [{}, (a) => a, () => null];
	const useDrop = useDrag;
	export { useDrag, useDrop };
`;


const isProduction = process.env.NODE_ENV?.startsWith('prod');
const isTesting = process.env.NODE_ENV?.startsWith('test');

const config = {
	input: './src/js/main.js',
	external: [
		'cross-fetch/polyfill'
	],
	output: {
		file: `./build/static/zotero-web-library.js` ,
		format: 'iife',
		sourcemap: !isProduction,
		compact: isProduction
	},
	treeshake: {
		preset: 'smallest',
		moduleSideEffects: (id) => {
			if(id.includes('core-js/')) {
				return true;
			}
			if(!isProduction && id.includes('wdyr')) {
				return true;
			}
			return false;
		}
	},
	plugins: [
		webWorkerLoader({
			targetPlatform: 'browser',
			skipPlugins: ['resolve', 'json', 'commonjs', 'babel', 'sizes', 'filesize']
		}),
		resolve({
			modulePaths: [path.join(process.cwd(), 'src', 'js'), path.join(process.cwd(), 'modules')],
			preferBuiltins: false,
			mainFields: ['browser', 'main'],
			extensions: ['.js', '.jsx'],
		}),
		replace({
			preventAssignment: true,
			objectGuards: true,
			delimiters: ['', ''],
			values: {
				'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'development'),
				"process.env['NODE_ENV']": JSON.stringify(process.env.NODE_ENV ?? 'development'),
				'process.env.TARGET': JSON.stringify(process.env.TARGET ?? 'default')
			}
		}),
		json(),
		commonjs(),
		babel({
			babelrc: false,
			include: [
				'src/js/**',
				'modules/web-common/**',
				'test/utils/**', // required for playwright tests
				// modules below need re-transpiled for compatibility with Safari 11
				'node_modules/@floating-ui/**',
				'node_modules/react-dnd*/**',
				'node_modules/dnd-multi-backend/**',
				'node_modules/react-redux/**',
				'node_modules/@reduxjs/**',
				'node_modules/immer/**',
				'node_modules/reselect/**',
			],
			babelHelpers: 'bundled'
		}),
		filesize({ showMinifiedSize: false, showGzippedSize: !!process.env.DEBUG }),
	]
};

const commonAliases = [
	{ find: /^core-js-pure\/(.*)/, replacement: 'core-js/$1' },
];

// alias either library and few unused components to a stub to reduce weight in embedded build
const libraryAliases = [
	{ find: 'component/library', replacement: 'component/stub' },
	{ find: 'component/items/toolbar', replacement: 'component/stub' },
	{ find: 'component/item/actions/new-item', replacement: 'component/stub' },
	{ find: 'component/item/actions/export', replacement: 'component/stub' },
	{ find: 'component/item/actions/add-by-identifier', replacement: 'component/stub' },
	{ find: 'spark-md5', replacement: 'component/stub' },
];

// alias embedded library to a stub in Zotero build
const embeddedAliases = [
	{ find: 'component/embedded-library', replacement: 'component/stub' },
];

if(process.env.DEBUG) {
	config.plugins.splice(-1, 0, sizes());
	config.plugins.splice(-1, 0, visualizer({ filename: `visualizer/${new Date().toJSON().slice(0, 10)}.html` }));
}

if(isProduction) {
	config.plugins.push(terser({ safari10: true }));
	config.external.push('./wdyr'); //exclude why-did-you-render from production
}

const embeddedTargetConfig = {
	...config,
	input: './src/js/embedded.jsx',
	output: { ...config.output, file: './build/static/zotero-web-library-embedded.js' },
	plugins: [
		alias({ entries: [...commonAliases, ...libraryAliases] }),
		virtual({ 'react-dnd': stubdnd }),
		...config.plugins
	]
};

const zoteroTargetConfig = {
	...config,
	plugins: [alias({ entries: [...commonAliases, ...embeddedAliases] }), ...config.plugins]
};

// testing produces a bundle with main components in a global scope
const testingTargetConfig = {
	...config,
	input: './test/utils/main-with-state.jsx',
	output: {
		...config.output,
		file: './build/static/zotero-web-library-testing.js',
		exports: 'named',
		name: 'window',
		extend: true,
	},
};

const targets = {
	'testing': testingTargetConfig,
	'embedded': embeddedTargetConfig,
	'zotero': zoteroTargetConfig,
	'all': [zoteroTargetConfig, embeddedTargetConfig],
	'default': zoteroTargetConfig
};

let target = process.env.TARGET ?? (isTesting ? 'testing' : 'default');

if(!(target in targets)) {
	console.warn(`Unrecognized target "${target}". Falling back to "default"`);
	target = 'default';
}

export default targets[target];
