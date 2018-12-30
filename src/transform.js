/**
 * Transforms input directory of templates and data
 * to static html files in output directory
 */

const path = require('path');

const compileDirTemplates = require('./compileDirTemplates');
const copyAllFiles = require('./copyFiles');

function sortTemplateFilesByDir(templateFiles) {
    let templateFilesByDir = {};

    templateFiles.forEach(item => {
        const dirName = path.dirname(item.src);
        templateFilesByDir[dirName] = templateFilesByDir[dirName] || [];
        templateFilesByDir[dirName].push(item);
    });

    return templateFilesByDir;
};

async function processTemplateFiles(templateFiles, dataDir) {
    const templateFilesByDir = sortTemplateFilesByDir(templateFiles);

    for (let dir in templateFilesByDir) {
        await compileDirTemplates(dir, templateFilesByDir[dir], dataDir);
    }
};

async function transform(fileMap, dataDir) {
    const { copyFiles, templateFiles } = fileMap;

    await processTemplateFiles(templateFiles, dataDir);
    await copyAllFiles(copyFiles);
};

module.exports = transform;
