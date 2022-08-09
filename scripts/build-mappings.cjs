const util = require('node:util');
const exec = util.promisify(require('node:child_process').exec);

const fs = require('fs-extra');
const path = require('path');

const dstFile = path.join(__dirname, '..', 'data', 'mappings.js');
const schemaModulePath = path.join(__dirname, '..', 'modules', 'zotero-schema');

(async () => {
	try {
		const { stdout } = await exec('git fetch && git rev-list --count HEAD..origin/master', { cwd: schemaModulePath });
		const commitsBehind = parseInt(stdout);
		if (commitsBehind > 0) {
			console.warn(`Zotero Schema submodule is ${commitsBehind} commits behind!`);
		}
	} catch (e) {
		console.error("Failed to check for Zotero Schema updates!\n\n\t" + e.stderr);
	}

	const schema = require(path.join(schemaModulePath, 'schema.json'));

	console.log(`Using Zotero Schema version ${schema.version}`);

	const mappings = schema.itemTypes.reduce((acc, data) => {
		const itemTypeMappings = data.fields.reduce((fieldsAcc, fieldData) => {
			if ('baseField' in fieldData) {
				fieldsAcc[fieldData.baseField] = fieldData.field;
			}
			return fieldsAcc;
		}, {});
		if (Object.keys(itemTypeMappings).length > 0) {
			acc[data.itemType] = itemTypeMappings
		}
		return acc;
	}, {});


	const output = `module.exports = Object.freeze(${JSON.stringify(mappings)});`;
	await fs.writeFile(dstFile, output);
	console.info(`${Object.keys(mappings).length} base mappings have been saved to ${dstFile}`);
})();
