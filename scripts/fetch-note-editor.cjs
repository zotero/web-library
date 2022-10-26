const fs = require('fs-extra');
const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const buildsURL = 'https://zotero-download.s3.amazonaws.com/ci/';

(async () => {
	const noteEditorPath = path.join(__dirname, '..', 'modules', 'note-editor');
	const modulesFilePath = path.join(__dirname, '..', 'data', 'modules.json');
	let modulesData = {};
	try {
		modulesData = await fs.readJson(modulesFilePath);
	} catch (_) {
		// modules data file is missing or invalid json, ignore.
	}

	const { noteEditor: storedHash } = modulesData;
	const { stdout } = await exec('git rev-parse HEAD', { cwd: noteEditorPath });
	const actualHash = stdout.trim();

	if (!storedHash || storedHash !== actualHash) {
		const targetDir = path.join(__dirname, '..', 'src', 'static', 'note-editor');
		try {
			const filename = actualHash + '.zip';
			const tmpDir = path.join(__dirname, '..', 'tmp', 'builds', 'note-editor');
			const url = buildsURL + 'client-note-editor/' + filename;

			await fs.remove(targetDir);
			await fs.ensureDir(targetDir);
			await fs.ensureDir(tmpDir);

			await exec(
				`cd ${tmpDir}`
				+ ` && (test -f ${filename} || curl -f ${url} -o ${filename})`
				+ ` && unzip ${filename} zotero/* -d ${targetDir}`
				+ ` && mv ${path.join(targetDir, 'zotero', '*')} ${targetDir}`
			);
			console.log(`Obtained note-reader from ${url}`);
			await fs.remove(tmpDir);
		}
		catch (e) {
			console.log(`Unable to fetch note-editor, will build instead...`);
			await exec('npm ci', { cwd: noteEditorPath });
			await exec('npm run build', { cwd: noteEditorPath });
			await fs.copy(path.join(noteEditorPath, 'build', 'web'), targetDir);
			console.log(`note-editor build complete`);
		}
		await fs.writeJson(modulesFilePath, { ...modulesData, noteEditor: actualHash });
	}
})();