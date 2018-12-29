/**
 * Yass-Gen Entry Point
 */

const minimist = require('minimist');

const buildFileMap = require('./buildFileMap');
const transform = require('./transform');

async function yass() {
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

    await transform(fileMap, outDir);
};

if (require.main == module)
    yass();

module.exports = yass;
