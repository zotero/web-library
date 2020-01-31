const fs = require('fs-extra');
const path = require('path');
const { version } = require('../package.json');

(async () => {
	const versionFilePath = path.join(__dirname, '..', 'data', 'version.json');
	await fs.outputJson(versionFilePath, { version });
})();