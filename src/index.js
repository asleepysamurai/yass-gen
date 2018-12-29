/**
 * Yass-Gen Entry Point
 */

const minimist = require('minimist');
const path = require('path');

const buildFileMap = require('./buildFileMap');
const transform = require('./transform');

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

        const fileMap = await buildFileMap({
            inDir,
            outDir,
            templateName
        });

        await transform(fileMap);
        console.log(`Yass-Gen Success! \nNew static site at ${path.resolve(outDir)} generated in ${Date.now()-startTime}ms. \nHave a good day!`);
    } catch (err) {
        console.log('Yass-Gen Failed! \n', err);
    }
};

if (require.main == module)
    yass();

module.exports = yass;
