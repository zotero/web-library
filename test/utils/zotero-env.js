import { TestEnvironment } from 'jest-environment-jsdom';

class ZoteroCssEnvironment extends TestEnvironment {
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
