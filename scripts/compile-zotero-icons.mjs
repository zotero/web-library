import fs from 'fs-extra';
import { dirname, join } from 'path';
import util from 'util';
import child_process from 'child_process';
import { fileURLToPath } from 'url';

const exec = util.promisify(child_process.exec);

const zoteroRepoURL = 'https://github.com/zotero/zotero.git';
const iconsPath = 'chrome/skin/default/zotero/';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const tmpDir = join(ROOT, 'tmp', 'builds', 'zotero');
const defaultSymbolColor = 'light';

const types = ['collection-tree', 'item-type'];
const colors = ['light', 'dark', 'white'];
const resolutions = ['16', '28'];
const regex = /<svg(?:[^>]*)>([\S\s]*?)<\/svg>/i;

const extractIcon = xml => {
    let content = xml.match(regex)?.[1].replace(/^\s+|\s+$/g, '');
    if(!content) {
        throw new Error('No content found in SVG');
    }
    return content;
}

const makeIcon = (name, resolution, colorsMap) => {
    let content = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">\n';
    for (let [color, iconBody] of colorsMap) {
        content += `<symbol id="${name}-${color}" viewBox="0 0 ${resolution} ${resolution}">\n`;
        content += iconBody;
        content += `\n</symbol>\n`;
    }
    content += `<use xlink:href="#${name}-${defaultSymbolColor}" viewBox="0 0 ${resolution} ${resolution}"/>\n`
    content += '</svg>';
    return content;
}

(async () => {
    await fs.ensureDir(tmpDir);
    await fs.remove(join(tmpDir, 'zotero'));

    await exec(
        `cd ${tmpDir}`
        + ` && git clone --filter=blob:none --no-checkout --depth 1 --sparse ${zoteroRepoURL}`
        + ` && cd zotero`
        + `&&` + types.map(t => `git sparse-checkout add ${join(iconsPath, t)}`).join(' && ')
        + ` && git checkout`
    );
    let counter = 0;
    for(let iconType of types) {
        for(let resolution of resolutions) {
            if(iconType === 'collection-tree' && resolution != '16') {
                continue; // In Zotero, only 16px icons are available for collection-tree
            }
            const srcIconDir = join(tmpDir, 'zotero', iconsPath, iconType, resolution);
            const targetIconDir = join(ROOT, 'src', 'static', 'icons', resolution, iconType);
            let map = new Map();
            await fs.ensureDir(targetIconDir);
            for(let color of colors) {
                const iconFiles = await fs.readdir(join(srcIconDir, color));
                for(let file of iconFiles) {
                    const srcIconPath = join(srcIconDir, color, file);
                    const xml = await fs.readFile(srcIconPath, 'utf8');
                    try {
                        const pixelRatio = (resolution === '16' && iconType !== 'collection-tree') ? file.includes('@2x') ? '2x' : '1x' : '';
                        const iconName = file.replace(/\.svg$/, '').replace(/@2x/g, '');
                        const iconBody = extractIcon(xml);
                        if (!map.has(iconName)) {
                            map.set(iconName, new Map());
                        }
                        if (!map.get(iconName).has(pixelRatio)) {
                            map.get(iconName).set(pixelRatio, new Map());
                        }
                        map.get(iconName).get(pixelRatio).set(color, iconBody);
                    } catch(e) {
                        console.error(`Error extracting icon from ${srcIconPath}: ${e.message}`);
                    }
                }
            }

            for (let [iconName, pixelRatioMap] of map) {
                for (let [pixelRatio, colorsMap] of pixelRatioMap) {
                    const targetIconPath = join(targetIconDir, `${iconName}${pixelRatio ? '@' + pixelRatio : ''}.svg`);
                    const svg = makeIcon(iconName, resolution, colorsMap);
                    await fs.writeFile(targetIconPath, svg);
                    counter++;
                }
            }
        }
    }
    console.log(`Generated ${counter} icons`);
})();
