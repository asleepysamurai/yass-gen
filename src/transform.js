/**
 * Transforms input directory of templates and data
 * to static html files in output directory
 */

const compileTemplate = require('./compileTemplate');
const copyAllFiles = require('./copyFiles');

async function processTemplateFiles(templateFiles) {
    await Promise.all(templateFiles.map(async (templateFile) => {
        return compileTemplate(templateFile.template, templateFile.src, templateFile.dest);
    }));
};

async function transform(fileMap) {
    const { copyFiles, templateFiles } = fileMap;

    await processTemplateFiles(templateFiles);
    await copyAllFiles(copyFiles);
};

module.exports = transform;
