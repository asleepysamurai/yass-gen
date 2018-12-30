/**
 * Processes template files by directory
 *     -> For each directory,
 *         -> reads all file contents
 *         -> parses front matter
 *         -> makes front matter available in $refs.dirList
 */

const Handlebars = require('handlebars');
const fs = require('fs');
const frontmatter = require('front-matter');
const { promisify } = require('util');
const mkdirp = promisify(require('mkdirp'));
const path = require('path');
const Showdown = require('showdown');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

const maxParallelFiles = 10;

async function parseFile(dataFile) {
    const data = (await readFile(dataFile, { encoding: 'utf8' })).toString();
    return frontmatter(data);
};

function markdownToHTML(markdown) {
    const converter = new Showdown.Converter({
        ghCompatibleHeaderId: true,
        parseImgDimensions: true,
        literalMidWordUnderscores: true,
        tables: true,
        ghCodeBlocks: true,
        emoji: true
    });

    return converter.makeHtml(markdown);
};

function isOfType(item, type) {
    return Object.prototype.toString.call(item) === `[object ${type}]`;
};

function getFileRefs(filePath, rootDir) {
    const ext = path.extname(filePath);
    const name = path.basename(filePath, ext);
    filePath = '/' + path.join(path.relative(rootDir, path.dirname(filePath)), name);

    return { path: filePath, ext, name };
};

async function getDateRefs(filePath) {
    const fileStat = await stat(filePath);

    return {
        updatedAt: fileStat.mtime.valueOf(),
        compiledAt: Date.now()
    };
};

/**
 * Reads content of files in directory
 *     -> Ignores any files starting with _
 *     -> Not recursive
 */
async function readDirItems(dataDir, rootDir) {
    const files = await readdir(dataDir);

    let dirItems = [];

    for (let file of files) {
        if (file[0] == '_')
            break;

        const filePath = path.resolve(dataDir, file);

        const fileStat = await stat(filePath);
        if (!fileStat.isFile())
            break;

        const { attributes = {}, body } = await parseFile(filePath);

        dirItems.push(Object.assign({ $file: getFileRefs(filePath, rootDir) }, { $date: await getDateRefs(filePath) }, attributes));
    }

    return dirItems;
};

async function getRefs(dataFile, globalRefs, rootDir) {
    return Object.assign({}, globalRefs, { $file: getFileRefs(dataFile, rootDir) }, { $date: await getDateRefs(dataFile) });
};

async function transformFile(templateFile, dataFile, outFile, globalRefs, rootDir) {
    const data = await parseFile(dataFile);

    const templateString = (await readFile(templateFile, { encoding: 'utf8' })).toString();
    const template = Handlebars.compile(templateString);

    const body = markdownToHTML(data.body);
    const refs = await getRefs(dataFile, globalRefs, rootDir);

    const templateData = Object.assign({}, refs, data.attributes || {}, { '_page_content_': body });
    const outData = template(templateData);

    await mkdirp(path.dirname(outFile));
    await writeFile(outFile, outData, { encoding: 'utf8' });
};

async function readRefs(dataDir, rootDir) {
    let refs = {
        '$dirList': await readDirItems(dataDir, rootDir)
    };

    return refs;
};

async function compileDirTemplates(dataDir, fileList, rootDir) {
    const refItems = await readRefs(dataDir, rootDir);

    while (fileList.length) {
        const parallelFileList = fileList.splice(0, maxParallelFiles);
        await Promise.all(parallelFileList.map(async (fileInfo) => {
            return transformFile(fileInfo.template, fileInfo.src, fileInfo.dest, refItems, rootDir);
        }));
    }
};

module.exports = compileDirTemplates;
