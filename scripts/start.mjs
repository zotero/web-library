#!/usr/bin/env node

import { runBatch, runInteractive, BOLD, RED, RESET } from './task-runner.mjs';

const PREPARE_TASKS = [
	{ label: 'Version', cmd: 'npm', args: ['run', 'build:version'] },
	{ label: 'Locale', cmd: 'npm', args: ['run', 'build:locale'] },
	{ label: 'Modules', cmd: 'npm', args: ['run', 'build:fetch-or-build-modules'] },
	{ label: 'Fonts', cmd: 'npm', args: ['run', 'build:fonts'] },
	{ label: 'Styles JSON', cmd: 'npm', args: ['run', 'build:styles-json'] },
	{ label: 'Check Icons', cmd: 'npm', args: ['run', 'build:check-icons'] },
	{ label: 'Citeproc', cmd: 'npm', args: ['run', 'build:citeproc-js'] },
];

const DEV_TASKS = [
	{ label: 'Server', cmd: 'node', args: ['scripts/server.mjs'] },
	{ label: 'JS', cmd: 'npx', args: ['rollup', '-c', '-w'] },
	{ label: 'SCSS', cmd: 'npx', args: ['nodemon', '-q', '-w', 'src/scss', '--ext', 'scss', '--exec', 'npm run devbuild:scss'] },
	{ label: 'HTML', cmd: 'npx', args: ['nodemon', '-q', '-w', 'src/html', '-w', 'config', '--ext', '.', '--exec', 'npm run build:html'] },
	{ label: 'Static', cmd: 'npx', args: ['nodemon', '-q', '-w', 'src/static', '--ext', '.', '--exec', 'npm run build:static'] },
];

async function main() {
	try {
		await runBatch('Preparing...', PREPARE_TASKS);
	} catch {
		process.stdout.write(`${RED}${BOLD}Prepare step failed. Aborting.${RESET}\n`);
		process.exit(1);
	}

	runInteractive('Zotero Web Library', 'http://localhost:8001', DEV_TASKS);
}

main();
