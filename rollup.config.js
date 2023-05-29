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
import { terser } from 'rollup-plugin-terser';
import virtual from '@rollup/plugin-virtual';

// Embedded doesn't need drag and drop so implementation below is used instead to reduce few KBs
// while re-using the same code for both targets.
const stubdnd = `
	const useDrag = () => [{}, (a) => a, () => null];
	const useDrop = useDrag;
	export { useDrag, useDrop };
`;


const isProduction = process.env.NODE_ENV?.startsWith('prod');

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
			skipPlugins: ['resolve', 'json', 'commonjs', 'replace', 'babel', 'sizes', 'filesize']
		}),
		resolve({
			modulePaths: [path.join(process.cwd(), 'src', 'js')],
			preferBuiltins: false,
			mainFields: ['browser', 'main'],
			extensions: ['.js', '.jsx'],
		}),
		json(),
		commonjs(),
		replace({
			preventAssignment: true,
			'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'development'),
			'process.env.TARGET': JSON.stringify(process.env.TARGET ?? 'default'),
		}),
		babel({
			babelrc: false,
			include: [
				'src/js/**',
				// modules below need re-transpiled for compatibility with Safari 10
				'node_modules/@floating-ui/**',
				'node_modules/react-dnd*/**',
				'node_modules/dnd-multi-backend/**',
				'node_modules/react-virtualized-auto-sizer/**'
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
}

if(isProduction) {
	config.plugins.push(terser());
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
}

const targets = {
	'embedded': embeddedTargetConfig,
	'zotero': zoteroTargetConfig,
	'default': [zoteroTargetConfig, embeddedTargetConfig],
};

let target = process.env.TARGET ?? 'default';

if(!(target in targets)) {
	console.warn(`Unrecognized target "${target}". Falling back to "default"`);
	target = 'default';
}

export default targets[target];
