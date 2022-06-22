const fs = require('fs-extra');
const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const buildsURL = 'https://zotero-download.s3.amazonaws.com/ci/';

(async () => {
	const pdfReaderPath = path.join(__dirname, '..', 'modules', 'pdf-reader');
	const modulesFilePath = path.join(__dirname, '..', 'data', 'modules.json');
	let modulesData = {};
	try {
		modulesData = await fs.readJson(modulesFilePath);
	} catch(_) {
		// modules data file is missing or invalid json, ignore.
	}

	const { pdfReader: storedHash } = modulesData;
	const { stdout } = await exec('git rev-parse HEAD', { cwd: pdfReaderPath });
	const actualHash = stdout.trim();

	if (!storedHash || storedHash !== actualHash) {
		const targetDir = path.join(__dirname, '..', 'src', 'static', 'pdf-reader');
		try {
			const filename = actualHash + '.zip';
			const tmpDir = path.join(__dirname, '..', 'tmp', 'builds', 'pdf-reader');
			const url = buildsURL + 'client-pdf-reader/' + filename;
			
			await fs.remove(targetDir);
			await fs.ensureDir(targetDir);
			await fs.ensureDir(tmpDir);

			await exec(
				`cd ${tmpDir}`
				+ ` && (test -f ${filename} || curl -f ${url} -o ${filename})`
				+ ` && mkdir -p ${targetDir}`
				+ ` && unzip ${filename} web/* -d ${targetDir}`
				+ ` && mv ${targetDir}/web/* ${targetDir}/`
				+ ` && rm -r ${targetDir}/web`
			);
			console.log(`Obtained pdf-reader from ${url}`);
			await fs.remove(tmpDir);
		} catch (e) {
			console.log(`Unable to fetch pdf-reader, will build instead...`);
			await exec('npm ci', { cwd: pdfReaderPath });
			await exec('npm run build', { cwd: pdfReaderPath });
			await fs.copy(path.join(pdfReaderPath, 'build', 'web'), targetDir);
			console.log(`pdf-reader build complete`);
		}
		await fs.writeJson(modulesFilePath, { ...modulesData, pdfReader: actualHash })
	}
})();