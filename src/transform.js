/**
 * Transforms input directory of templates and data
 * to static html files in output directory
 */

const buildFileMap = require('./buildFileMap');

async function transform(opts) {
    const fileMap = await buildFileMap(opts);
};

module.exports = transform;
