import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';
import apiLib from 'zotero-api-client'; //TODO improt api from 'zotero-api-client' should work

const api = apiLib.default;

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const targetJSONPath = join(ROOT, 'data', 'item-types-with-icons.json');

const ignoredItemTypes = ['annotation', 'attachment'];

const iconsPaths = {
	desktop1x: join(ROOT, 'src', 'static', 'icons', '16', 'item-types', 'light', '1x'),
	desktop2x: join(ROOT, 'src', 'static', 'icons', '16', 'item-types', 'light', '2x'),
	mobile: join(ROOT, 'src', 'static', 'icons', '28', 'item-types', 'light'),
};

const knownItemTypes = await api().schema().get()
	.then(response => response
		.getData()
		.itemTypes
		.map(({ itemType }) => itemType)
	);

for(let [name, iconDir] of Object.entries(iconsPaths)) {
	const foundItemTypes = (await fs.readdir(iconDir, { withFileTypes: true }))
		.filter(dirent => !dirent.isDirectory())
		.map(dirent => dirent.name)
		.filter(name => name.endsWith('.svg'))
		.map(name => name.slice(0, -4))
		.map(name => name.replace(/-([a-z])/g, (match, p1) => p1.toUpperCase()));

	if(name === 'desktop1x') {
		// for simplicity, only desktop1x icons are considered (i.e. if there is no desktop1x icon for item type, all devices will use a fallback icon)
		await fs.writeJSON(targetJSONPath, { itemTypesWithIcons: foundItemTypes });
	}

	const missingItemTypeIcons = knownItemTypes.filter(it => !ignoredItemTypes.includes(it) && !foundItemTypes.includes(it));
	console.log(`WARNING: ${missingItemTypeIcons.length} missing item type icons for "${name}": ${missingItemTypeIcons.join(', ')}`);
}


