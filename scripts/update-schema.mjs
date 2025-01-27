import fs from "fs-extra";
import { dirname, join } from "path";
import util from "util";
import child_process from "child_process";
import { fileURLToPath } from "url";


const exec = util.promisify(child_process.exec);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const modulePath = join(ROOT, "modules", "zotero-schema");
const schemaPath = join(modulePath, "schema.json");
let currentVersion = 0;

try {
    const schema = await fs.readJson(schemaPath);
    currentVersion = parseInt(schema.version);
} catch (e) {
    // ignore
}

(async () => {
    if (process.env.NODE_ENV !== 'production' || process.env.SKIP_SCHEMA_UPDATE) {
        console.log(`Skipping schema update check (using version ${currentVersion})`);
        return
    }
    try {
        await exec("git pull origin master --ff-only", { cwd: modulePath });
        const schema = await fs.readJson(schemaPath);
        if (parseInt(schema.version) > currentVersion) {
            console.log(`Updated schema repository (${currentVersion} -> ${schema.version})`);
        }
        console.log(`Using latest schema version ${schema.version}`);
    } catch (e) {
        console.error("Failed to pull zotero-schema repository");
        console.error(e);
        process.exit(1);
    }
})();