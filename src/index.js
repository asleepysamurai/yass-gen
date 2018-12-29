/**
 * Yass-Gen Entry Point
 */

const minimist = require('minimist');

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

    await transform({
        inDir,
        outDir,
        templateName
    });
};

if (require.main == module)
    yass();

module.exports = yass;
