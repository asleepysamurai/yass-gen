#!/usr/bin/env node

/**
 * Yass-Gen Entry Point
 */

const minimist = require('minimist');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const Handlebars = require('handlebars');

const buildFileMap = require('./buildFileMap');
const transform = require('./transform');

const fsstat = promisify(fs.stat);

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

async function getTemplateHandlebars(templateDir) {
    try {
        const templateHelpers = require(path.resolve(templateDir, '_configure'));
        await templateHelpers(Handlebars);
    } catch (err) {
        if (err.code !== 'MODULE_NOT_FOUND') {
            console.log('Template Error Occurred. Please fix your template.');
            throw err;
        }
    }

    return Handlebars;
};

async function yass() {
    try {
        const startTime = Date.now();
        const opts = minimist(process.argv.slice(2));

        const inDir = (opts.in || opts.i);
        if (!inDir)
            throw new Error('Missing option: input directory. Please specify -i or --in');

        const outDir = (opts.out || opts.o);
        if (!outDir)
            throw new Error('Missing option: output directory. Please specify -o or --out');

        const templateName = (opts.template || opts.t);
        const dataDir = path.resolve(inDir, './data');
        const templateDir = await getTemplateDir(path.resolve(inDir, './templates'), templateName, true);

        const fileMap = await buildFileMap({
            dataDir,
            templateDir,
            outDir
        });

        const templateHandlebars = await getTemplateHandlebars(templateDir);
        await transform(fileMap, path.resolve(inDir, 'data'), templateHandlebars);

        console.log(`Yass-Gen Success! \nNew static site at ${path.resolve(outDir)} generated in ${Date.now()-startTime}ms. \nHave a good day!`);
    } catch (err) {
        console.log('Yass-Gen Failed! \n', err);
    }
};

if (require.main == module)
    yass();

module.exports = yass;
