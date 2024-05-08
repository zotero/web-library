const fs = require('fs-extra');
const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const buildsURL = 'https://zotero-download.s3.amazonaws.com/ci/';
const modulesFilePath = path.join(__dirname, '..', 'data', 'modules.json');

const modulesConfig = [
    {
        name: 'pdf-reader',
        key: 'pdfReader',
        URLpath: 'client-pdf-reader',
        buildPath: ['build', 'web'],
        exec: (url, filename, tmpDir, targetDir) => `cd ${tmpDir}`
            + ` && (test -f ${filename} || curl -f ${url} -o ${filename})`
            + ` && mkdir -p ${targetDir}`
            + ` && unzip ${filename} web/* -d ${targetDir}`
            + ` && mv ${targetDir}/web/* ${targetDir}/`
            + ` && rm -r ${targetDir}/web`
    },
    {
        name: 'pdf-worker',
        key: 'pdfWorker',
        URLpath: 'client-pdf-worker',
        buildPath: ['build'],
        exec: (url, filename, tmpDir, targetDir) => `cd ${tmpDir}`
            + ` && (test -f ${filename} || curl -f ${url} -o ${filename})`
            + ` && mkdir -p ${targetDir}`
            + ` && unzip -o ${filename} -d ${targetDir}`
    },
    {
        name: 'note-editor',
        key: 'noteEditor',
        URLpath: 'client-note-editor',
        buildPath: ['build', 'web'],
        exec: (url, filename, tmpDir, targetDir) => `cd ${tmpDir}`
            + ` && (test -f ${filename} || curl -f ${url} -o ${filename})`
            + ` && unzip ${filename} zotero/* -d ${targetDir}`
            + ` && mv ${path.join(targetDir, 'zotero', '*')} ${targetDir}`
    }
];

(async () => {
    let modulesData = {};
    try {
        modulesData = await fs.readJson(modulesFilePath);
    } catch (_) {
        // modules data file is missing or invalid json, ignore.
    }

    const promises = modulesConfig.map(async moduleConfig => {
        const srcPath = path.join(__dirname, '..', 'modules', moduleConfig.name);
        const storedHash = modulesData[moduleConfig.key];
        const { stdout } = await exec('git rev-parse HEAD', { cwd: srcPath });
        const actualHash = stdout.trim();
        const targetDir = path.join(__dirname, '..', 'src', 'static', moduleConfig.name);
        const targetDirExists = await fs.pathExists(targetDir);
        const tmpDir = path.join(__dirname, '..', 'tmp', 'builds', moduleConfig.name);
        if (!targetDirExists || !storedHash || storedHash !== actualHash) {    
            try {
                const filename = actualHash + '.zip';
                const url = buildsURL + moduleConfig.URLpath + '/' + filename;

                await fs.remove(targetDir);
                await fs.ensureDir(targetDir);
                await fs.ensureDir(tmpDir);

                await exec(moduleConfig.exec(url, filename, tmpDir, targetDir));
                console.log(`Obtained ${moduleConfig.name} from ${url}`);
            } catch (e) {
                console.log(`Unable to fetch ${moduleConfig.name}, will build instead...`);
                await exec('npm ci', { cwd: srcPath });
                await exec('npm run build', { cwd: srcPath });
                await fs.copy(path.join(srcPath, ...moduleConfig.buildPath), targetDir);
                console.log(`${moduleConfig.name} build complete`);
            } finally {
                await fs.remove(tmpDir);
            }
            modulesData[moduleConfig.key] = actualHash;
        } else {
            console.log(`Skipping ${moduleConfig.name} fetch/build, already up to date`);
        }
    });

    await Promise.all(promises);
    await fs.ensureDir(path.dirname(modulesFilePath));
    await fs.writeJson(modulesFilePath, modulesData);
})();


