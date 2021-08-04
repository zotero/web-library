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

const isProduction = process.env.NODE_ENV?.startsWith('prod');

const config = {
	input: './src/js/main.js',
	external: [
		'cross-fetch/polyfill'
	],
	output: {
		file: './build/static/zotero-web-library.js',
		format: 'iife',
		sourcemap: !isProduction,
		compact: isProduction
	},
	treeshake: {
		moduleSideEffects: 'no-external',
	},
	plugins: [
		alias({ entries: [
			// workaround for https://github.com/react-dnd/react-dnd/issues/2772
			{ find: '@react-dnd/asap', replacement: '@react-dnd/asap/dist/esm/browser/asap.js' },
        ]}),
		resolve({
			preferBuiltins: false,
			mainFields: ['browser', 'main'],
			extensions: ['.js', '.jsx'],
		}),
		json(),
		webWorkerLoader({
			targetPlatform: 'browser',
			skipPlugins: ['resolve', 'json', 'commonjs', 'replace', 'babel', 'sizes', 'filesize']
		}),
		commonjs(),
		replace({
			preventAssignment: true,
			'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'development'),
		}),
		babel({
			include: ['src/js/**'],
			extensions: ['.js', '.jsx'],
			babelHelpers: 'runtime'
		}),
		filesize({ showMinifiedSize: false, showGzippedSize: !!process.env.DEBUG }),
	]
};

if(process.env.DEBUG) {
	config.plugins.splice(-1, 0, sizes());
}

if(isProduction) {
	config.plugins.push(terser());
	config.external.push('./wdyr'); //exclude why-did-you-render from production
}

export default config;
