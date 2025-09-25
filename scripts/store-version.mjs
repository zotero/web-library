import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pkgPath = path.join(__dirname, '..', 'package.json');
const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf8'));
const { version } = pkg;

const versionFilePath = path.join(__dirname, '..', 'data', 'version.json');
await fs.outputJson(versionFilePath, { version });
