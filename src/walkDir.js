/**
 * Walks a directory and calls an action for each file or dir inside it
 */

const { promisify } = require('util');
const fs = require('fs');
const path = require('path');

const fsstat = promisify(fs.stat);
const readdir = promisify(fs.readdir);

async function walkDir(dir, onItem, rootDir) {
    rootDir = rootDir || dir;

    const stat = await fsstat(dir);

    if (!stat.isDirectory())
        throw new Error(`${dir} is not a directory`);

    const items = await readdir(dir);

    await Promise.all(items.map(async (item) => {
        const filePath = path.resolve(dir, item);
        const stat = await fsstat(filePath);

        const isDir = stat.isDirectory();
        const pathRelativeToRoot = path.relative(rootDir, dir);
        await Promise.resolve(onItem(item, pathRelativeToRoot, isDir));

        if (isDir)
            await walkDir(filePath, onItem, rootDir || dir);
    }));
};

module.exports = walkDir;
