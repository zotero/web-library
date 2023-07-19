const licenseString ='<!-- This file is part of Zotero. It is distributed under the GNU Affero General Public License version 3. -->';

const fs = require('fs-extra');
const { glob } = require('glob');
const path = require('path');

var filesChanged = 0;

const addLicense = async file => {
	const content = await fs.readFile(file, 'utf8');
	if(content.includes(licenseString)) {
		return;
	}
	await fs.writeFile(file, licenseString + '\n' + content);

	filesChanged++;
}

(async () => {
	const files = await glob(`${path.join(__dirname, '..', 'src', 'static', 'icons')}/**/*.svg`);
	const promises = files.map(f => addLicense(f));
	await Promise.all(promises);
	console.log(`Injected license into ${filesChanged}/${files.length} files.`);
})();
