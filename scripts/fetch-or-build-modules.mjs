import fs from "fs-extra";
import { dirname, join } from "path";
import util from "util";
import child_process from "child_process";
import { fileURLToPath } from "url";

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
    exec: (url, filename, tmpDir, targetDir) =>
      `cd ${tmpDir}` +
      ` && (test -f ${filename} || curl -f ${url} -o ${filename})` +
      ` && mkdir -p ${targetDir}` +
      ` && unzip ${filename} web/* -d ${targetDir}` +
      ` && mv ${targetDir}/web/* ${targetDir}/` +
      ` && rm -r ${targetDir}/web`,
  },
  {
    forceBuild: false,
    name: "pdf-worker",
    key: "pdfWorker",
    URLpath: "document-worker",
    buildPath: ["build"],
    exec: (url, filename, tmpDir, targetDir) =>
      `cd ${tmpDir}` +
      ` && (test -f ${filename} || curl -f ${url} -o ${filename})` +
      ` && mkdir -p ${targetDir}` +
      ` && unzip -o ${filename} -d ${targetDir}`,
  },
  {
    forceBuild: false,
    name: "note-editor",
    key: "noteEditor",
    URLpath: "note-editor",
    buildPath: ["build", "web"],
    exec: (url, filename, tmpDir, targetDir) =>
      `cd ${tmpDir}` +
      ` && (test -f ${filename} || curl -f ${url} -o ${filename})` +
      ` && unzip ${filename} web/* -d ${targetDir}` +
      ` && mv ${join(targetDir, "web", "*")} ${targetDir}`,
  },
];

async function fetchModule({ actualHash, moduleConfig, tmpDir, targetDir }) {
  const filename = actualHash + ".zip";
  const url = buildsURL + moduleConfig.URLpath + "/" + filename;
  console.log(`Fetching ${moduleConfig.name} from ${url}`);

  await fs.remove(targetDir);
  await fs.ensureDir(targetDir);
  await fs.ensureDir(tmpDir);

  await exec(moduleConfig.exec(url, filename, tmpDir, targetDir));
  console.log(`Obtained ${moduleConfig.name} from ${url}`);
}

async function buildModule({ moduleConfig, srcPath, targetDir }) {
  await exec("npm ci", { cwd: srcPath });
  await exec("npm run build", { cwd: srcPath });
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
    const { stdout } = await exec("git rev-parse HEAD", { cwd: srcPath });
    const actualHash = stdout.trim();
    const targetDir = join(ROOT, "src", "static", moduleConfig.name);
    const targetDirExists = await fs.pathExists(targetDir);
    const tmpDir = join(ROOT, "tmp", "builds", moduleConfig.name);
    if (!targetDirExists || !storedHash || storedHash !== actualHash) {
      if (moduleConfig.forceBuild) {
        try {
          await buildModule({ moduleConfig, srcPath, targetDir, browserslist });
          modulesData[moduleConfig.key] = actualHash;
        } catch (e) {
          console.error(`Error building ${moduleConfig.name}: ${e.message}`);
        }
      } else {
        // OK to fetch, but if it fails, build instead
        try {
          await fetchModule({ actualHash, moduleConfig, tmpDir, targetDir });
          modulesData[moduleConfig.key] = actualHash;
        } catch {
          console.log(
            `Unable to fetch ${moduleConfig.name}, will build instead...`,
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
          }
        } finally {
          await fs.remove(tmpDir);
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
