import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';
import EnvWithFetch from './env-with-fetch.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const scssPath = join(__dirname, '..', '..', 'data', 'layout-only.css');
const css = readFileSync(scssPath, 'utf8');

class ZoteroCssEnvironment extends EnvWithFetch {
	constructor(config, context) {
		const html = `<!DOCTYPE html>
 		 	<html lang="en">
 		 	<head>
 		 		<style>${css}</style>
 		 	</head>
 		 	<body class="zotero-wl">
 		 	</body>
 		 	</html>`;
		config = {
			...config,
			projectConfig: {
				...config.projectConfig,
				testEnvironmentOptions: { html, customExportConditions: [''] },
			}
		};
		super(config, context);
	}
}

export default ZoteroCssEnvironment;
