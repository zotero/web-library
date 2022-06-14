const fs = require('fs-extra');
const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const buildsURL = 'https://zotero-download.s3.amazonaws.com/ci/';

(async () => {
	const pdfWorkerPath = path.join(__dirname, '..', 'modules', 'pdf-worker');
	const modulesFilePath = path.join(__dirname, '..', 'data', 'modules.json');
	let modulesData = {};
	try {
		modulesData = await fs.readJson(modulesFilePath);
	} catch(_) {
		// modules data file is missing or invalid json, ignore.
	}

	const { storedHash } = modulesData;
	const { stdout } = await exec('git rev-parse HEAD', { cwd: pdfWorkerPath });
	const actualHash = stdout.trim();

	if (!storedHash || storedHash !== actualHash) {
		const targetDir = path.join(__dirname, '..', 'src', 'static', 'pdf-worker');
		try {
			const filename = actualHash + '.zip';
			const tmpDir = path.join(__dirname, '..', 'tmp', 'builds', 'pdf-worker');
			const url = buildsURL + 'client-pdf-worker/' + filename;
			
			await fs.remove(targetDir);
			await fs.ensureDir(targetDir);
			await fs.ensureDir(tmpDir);

			await exec(
				`cd ${tmpDir}`
				+ ` && (test -f ${filename} || curl -f ${url} -o ${filename})`
				+ ` && mkdir -p ${targetDir}`
				+ ` && unzip -o ${filename} -d ${targetDir}`
			);
			console.log(`Obtained pdf-worker from ${url}`);
			await fs.remove(tmpDir);
		} catch (e) {
			console.log(`Unable to fetch pdf-worker, will build instead...`);
			await exec('npm ci', { cwd: pdfWorkerPath });
			await exec('npm run build', { cwd: pdfWorkerPath });
			await fs.copy(path.join(pdfWorkerPath, 'build', targetDir));
			console.log(`pdf-worker build complete`);
		}
		await fs.writeJson(modulesFilePath, { ...modulesData, storedHash: actualHash })
	}
})();