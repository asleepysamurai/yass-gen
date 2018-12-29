/**
 * Copies the list of provided files to provided destinations
 */

const { promisify } = require('util');
const copyFile = promisify(require('fs').copyFile);
const mkdirp = promisify(require('mkdirp'));
const path = require('path');

const batchSize = 10;

async function copyAll(fileList) {
    while (fileList.length) {
        const batch = fileList.splice(0, batchSize);
        await Promise.all(batch.map(async (fileInfo) => {
            await mkdirp(path.dirname(fileInfo.dest));
            return copyFile(fileInfo.src, fileInfo.dest);
        }));
    }
};

module.exports = copyAll;
