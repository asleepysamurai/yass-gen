/**
 * Compiles the given template file, with given data file
 *
 * Attempts to decode data file as
 *     -> YAML front matter
 *     -> Markdown with full HTML whitelisting
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

async function transformFile(templateFile, dataFile, outFile) {
    const data = await parseFile(dataFile);

    const templateString = (await readFile(templateFile, { encoding: 'utf8' })).toString();
    const template = Handlebars.compile(templateString);

    const body = markdownToHTML(data.body);

    const templateData = Object.assign({}, data.attributes || {}, { '_page_content_': body });
    const outData = template(templateData);

    await mkdirp(path.dirname(outFile));
    await writeFile(outFile, outData, { encoding: 'utf8' });
};

module.exports = transformFile;
