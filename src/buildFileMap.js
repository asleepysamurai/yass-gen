/**
 * Builds a mapping of files to the templates they should use
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const walkDir = require('./walkDir');

const fsstat = promisify(fs.stat);

const defaultDirs = {
    templateDir: path.resolve(__dirname, '../templates/')
};
const yassFileExtension = 'yass';
const templateFileExtension = 'hbs';
const templateFileName = '_template_';

async function getTemplateDir(templateDir, templateName = 'default', throwCustomError) {
    try {
        const stat = await fsstat(templateDir);

        if (!stat.isDirectory())
            throw new Error(`${templateDir} is not a directory`);

        return templateDir;
    } catch (err) {
        if (err.code === 'ENOENT') {
            if (templateName)
                return getTemplateDir(path.resolve(defaultDirs.templateDir, templateName));
            else if (throwCustomError)
                throw new Error(`${templateDir} is not a directory, and template name (-t or --template) not specified`)
        }

        throw err;
    }
};

async function fileExists(filePath) {
    const stat = await fsstat(filePath);

    if (!stat.isFile())
        throw new Error(`${filePath} is not a file`);

    return filePath;
};

async function getTemplateFileForPath(fileName, relativePath, templateDir) {
    /*
    Template Strategy
        -> Same dir/same name.hbs
        -> Same dir/_template_.hbs
        -> Previous dir/_template_.hbs
     */
    relativePath = `./${relativePath}`;
    let filePaths = [
        path.resolve(templateDir, relativePath, fileName.replace(new RegExp(`${yassFileExtension}$`), templateFileExtension)),
        path.resolve(templateDir, relativePath, `${templateFileName}.${templateFileExtension}`)
    ];

    let templateFile;
    for (let i = 0; i < filePaths.length; ++i) {
        try {
            templateFile = await fileExists(filePaths[i]);
            break;
        } catch (err) {
            if ((filePaths.length - 1) === i) {
                const index = relativePath.indexOf(path.sep);
                if (index == -1)
                    break;

                relativePath = relativePath.substring(0, index);
                filePaths.push(path.resolve(templateDir, relativePath, `${templateFileName}.${templateFileExtension}`));
            }
        }
    };

    return templateFile;
};

async function buildFileMap(opts) {
    const { inDir, outDir, templateName } = opts;

    const dataDir = path.resolve(inDir, './data');
    const templateDir = await getTemplateDir(path.resolve(inDir, './templates'), templateName, true);

    let fileMap = {};

    await walkDir(dataDir, async (item, relativePath, isDir) => {
        if (!isDir) {
            const extension = (item.match(/\.([^.]*)$/) || [])[1];
            if (extension !== yassFileExtension)
                return;

            const templateFile = await getTemplateFileForPath(item, relativePath, templateDir);
            const filePath = path.resolve(dataDir, relativePath, item);

            if (!templateFile)
                throw new Error(`No matching template found for ${filePath}`);

            fileMap[filePath] = templateFile;
        }
    });

    return fileMap;
};

module.exports = buildFileMap;
