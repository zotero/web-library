import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const schemaPath = join(ROOT, 'modules', 'zotero-schema', 'schema.json');
const targetJSONPath = join(ROOT, 'data', 'item-types-with-icons.json');
const ignoredItemTypes = ['annotation', 'attachment'];

const iconsPaths = {
	desktop: join(ROOT, 'src', 'static', 'icons', '16', 'item-type'),
	mobile: join(ROOT, 'src', 'static', 'icons', '28', 'item-type'),
};

const knownItemTypes = (await fs.readJson(schemaPath)).itemTypes.map(({ itemType }) => itemType);

for(let [iconTypeName, iconDir] of Object.entries(iconsPaths)) {
	const foundItemTypes = (await fs.readdir(iconDir, { withFileTypes: true }))
		.filter(dirent => !dirent.isDirectory())
		.map(dirent => dirent.name)
		.filter(name => name.endsWith(iconTypeName === 'desktop' ? '@1x.svg' : '.svg'))
		.map(name => iconTypeName === 'desktop' ? name.slice(0, -7) : name.slice(0, -4))
		.map(name => name.replace(/-([a-z])/g, (match, p1) => p1.toUpperCase()));

	if(iconTypeName === 'desktop') {
		// for simplicity, only desktop icons are considered for fallback icons
		// i.e. if there is no desktop 1x icon for item type, all devices will use a fallback icon
		// but warning (below) will be shown for 2x and mobile missing icons as well
		await fs.writeJSON(targetJSONPath, { itemTypesWithIcons: foundItemTypes });
	}

	const missingItemTypeIcons = knownItemTypes.filter(it => !ignoredItemTypes.includes(it) && !foundItemTypes.includes(it));
	if(missingItemTypeIcons.length > 0) {
		console.log(`WARNING: ${missingItemTypeIcons.length} missing item type icons for "${iconTypeName}": ${missingItemTypeIcons.join(', ')}`);
	}
}
