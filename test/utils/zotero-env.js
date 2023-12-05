import EnvWithFetch from './env-with-fetch.js';

class ZoteroCssEnvironment extends EnvWithFetch {
	constructor(config, context) {
		const html = `<!DOCTYPE html>
 		 	<html lang="en">
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
