import fs from "fs-extra";
import {dirname, join, resolve, sep} from "path";
import util from "util";
import child_process from "child_process";
import {fileURLToPath} from "url";
import {unzipSync} from "fflate";

const exec = util.promisify(child_process.exec);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const buildsURL = "https://zotero-download.s3.amazonaws.com/ci/";
const modulesFilePath = join(ROOT, "data", "modules.json");
const modulesConfig = [
	{
		forceBuild: false,
		name: "reader",
		key: "pdfReader",
		URLpath: "reader",
		buildPath: ["build", "web"],
		zipPrefix: "web/",
	},
	{
		forceBuild: false,
		name: "pdf-worker",
		key: "pdfWorker",
		URLpath: "document-worker",
		buildPath: ["build"],
		zipPrefix: "",
	},
	{
		forceBuild: false,
		name: "note-editor",
		key: "noteEditor",
		URLpath: "note-editor",
		buildPath: ["build", "web"],
		zipPrefix: "web/",
	},
];

async function fetchModule({actualHash, moduleConfig, targetDir}) {
	const url = buildsURL + moduleConfig.URLpath + "/" + actualHash + ".zip";
	console.log(`Fetching ${moduleConfig.name} from ${url}`);

	await fs.remove(targetDir);
	await fs.ensureDir(targetDir);

	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`HTTP ${response.status} for ${url}`);
	}
	const {zipPrefix} = moduleConfig;
	const files = unzipSync(new Uint8Array(await response.arrayBuffer()), {
		filter: (file) => file.name.startsWith(zipPrefix) && !file.name.endsWith("/"),
	});
	for (const [name, data] of Object.entries(files)) {
		const filePath = resolve(targetDir, name.slice(zipPrefix.length));
		if (!filePath.startsWith(targetDir + sep)) {
			throw new Error(`Refusing to extract ${name} outside ${targetDir}`);
		}
		await fs.outputFile(filePath, data);
	}
	console.log(`Obtained ${moduleConfig.name} from ${url}`);
}

async function buildModule({moduleConfig, srcPath, targetDir}) {
	await exec("npm ci", {cwd: srcPath});
	await exec("npm run build", {cwd: srcPath});
	await fs.copy(join(srcPath, ...moduleConfig.buildPath), targetDir);
	console.log(`${moduleConfig.name} build complete`);
}

(async () => {
	const browserslist = JSON.parse(
		await fs.readFile(join(ROOT, "package.json"), "utf8"),
	).browserslist;

	let modulesData = {};
	try {
		modulesData = await fs.readJson(modulesFilePath);
	} catch {
		// modules data file is missing or invalid json, ignore.
	}

	const promises = modulesConfig.map(async (moduleConfig) => {
		const srcPath = join(ROOT, "modules", moduleConfig.name);
		const storedHash = modulesData[moduleConfig.key];
		const {stdout} = await exec("git rev-parse HEAD", {cwd: srcPath});
		const actualHash = stdout.trim();
		const targetDir = join(ROOT, "src", "static", moduleConfig.name);
		const targetDirExists = await fs.pathExists(targetDir);
		const envVar = `FORCE_BUILD_${moduleConfig.name.toUpperCase().replace(/-/g, "_")}`;
		const forceBuild = moduleConfig.forceBuild || !!process.env[envVar];
		if (forceBuild) {
			console.log(`Force building ${moduleConfig.name} (${envVar}=${process.env[envVar]})`);
		}
		if (forceBuild || !targetDirExists || !storedHash || storedHash !== actualHash) {
			if (forceBuild) {
				try {
					await buildModule({moduleConfig, srcPath, targetDir, browserslist});
					modulesData[moduleConfig.key] = actualHash;
				} catch (e) {
					console.error(`Error building ${moduleConfig.name}: ${e.message}`);
					process.exitCode = 1;
				}
			} else {
				// OK to fetch, but if it fails, build instead
				try {
					await fetchModule({actualHash, moduleConfig, targetDir});
					modulesData[moduleConfig.key] = actualHash;
				} catch (e) {
					console.log(
						`Unable to fetch ${moduleConfig.name} (${e.message}), will build instead...`,
					);
					try {
						await buildModule({
							moduleConfig,
							srcPath,
							targetDir,
							browserslist,
						});
						modulesData[moduleConfig.key] = actualHash;
					} catch (e) {
						console.error(`Error building ${moduleConfig.name}: ${e.message}`);
						process.exitCode = 1;
					}
				}
			}
		} else {
			console.log(
				`Skipping ${moduleConfig.name} fetch/build, already up to date`,
			);
		}
	});

	await Promise.all(promises);
	await fs.ensureDir(dirname(modulesFilePath));
	await fs.writeJson(modulesFilePath, modulesData);
})();
