import * as fs from 'fs/promises';
import { dirname, resolve, join } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

(async () => {
    // First generate the supported locales file which includes the language names, sorted by label
    const inPath = join(ROOT, 'modules', 'locales', 'locales.json');
    const outputPath = join(ROOT, 'data', 'supported-locales.json');
    const locale = JSON.parse(await fs.readFile(inPath, 'utf-8'));
    const languageNames = Object.entries(locale['language-names'])
        .reduce((aggr, [key, names]) => {
            const value = key;
            const label = names[1]; // names[1] for english, names[0] for native
            aggr.push({ value, label });
            return aggr;
        }, []);
    
    languageNames.sort(({ label: l1 }, { label: l2 }) => l1 < l2 ? -1 : l1 > l2);
    await fs.mkdir(resolve(dirname(outputPath)), { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(languageNames));
    console.log(`Supported locales written to ${outputPath}`);

    // Ensure each locale is linked in src/static/locales
    const localeIDs = languageNames.map(({ value }) => value);
    const localesDir = join(ROOT, 'src', 'static', 'locales');
    await fs.mkdir(localesDir, { recursive: true });
    let counter = 0;
    for (const localeID of localeIDs) {
        const srcPath = join(ROOT, 'modules', 'locales', `locales-${localeID}.xml`);
        const destPath = join(localesDir, `locales-${localeID}.xml`);
        try {
            await fs.symlink(srcPath, destPath);
            counter++;
        } catch (err) {
            if (err.code !== 'EEXIST') {
                console.error(`Failed to link ${srcPath} to ${destPath}:`, err);
            } else {
                counter++; // Already exists, count it as linked
            }
        }
    }
    console.log(`Successfully linked ${counter} locale files.`);
})();