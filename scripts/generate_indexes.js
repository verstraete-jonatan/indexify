const fs = require("fs");
const path = require("path");

const dateToday = new Date().toDateString();
const indexFileMessage =
  "/** Auto generated with `indexify` @link.. \n" +
  `Last updated: ${dateToday} */\n\n`;

/**
 * Recursively find all index files in a directory
 * @param {string} dir - Root directory
 * @param {string} indexFileName - Name of the index file
 * @returns {string[]} - Array of index file paths
 */
function findIndexFiles(dir, indexFileName) {
  const results = [];
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      results.push(...findIndexFiles(filePath, indexFileName));
    } else if (file === indexFileName) {
      results.push(filePath);
    }
  });

  return results;
}

function getAllDirPaths(dir = "src") {
  const allPaths = [];
  const items = fs.readdirSync(dir);

  allPaths.push(dir);

  items.forEach((item) => {
    const filePath = path.join(dir, item);
    const _path = fs.statSync(filePath);

    if (_path.isDirectory()) {
      allPaths.push(...getAllDirPaths(filePath));
    }
  });

  return [...new Set(allPaths)];
}

/**
 * Generate index file content
 * @param {string} dir - Directory of the index file
 * @param {string[]} supportedExtensions - Supported file extensions
 * @param {string} indexFileName - Name of the index file
 * @returns {string} - Generated content
 */
function generateIndexFileContent(dir, supportedExtensions, indexFileName) {
  const files = fs.readdirSync(dir);
  const exports = files
    .filter((file) => {
      const ext = path.extname(file);
      return supportedExtensions.includes(ext) && file !== indexFileName;
    })
    .map((file) => {
      const fileNameWithoutExt = path.basename(file, path.extname(file));
      return `export * from './${fileNameWithoutExt}';`;
    });

  return exports.join("\n") + "\n";
}

function removeIndexFiles(dir, indexFileName) {
  fs.readdirSync(dir).forEach((file) => {
    const filePath = path.join(dir, file);
    fs.unlinkSync(filePath);
    if (fs.statSync(filePath).isDirectory()) {
      removeIndexFiles(filePath, indexFileName);
    } else if (file === indexFileName) {
      fs.unlinkSync(filePath);
    }
  });
}

/**
 * Populate index files
 * @param {string} rootPath - Root directory to process
 * @param {string[]} supportedExtensions - Supported file extensions
 * @param {string} indexFileName - Name of the index file
 */
function generateIndexFiles(rootPath, supportedExtensions, indexFileName) {
  return;
  if (!indexFileName) {
    console.log("no indexFileName");
    process.exit(1);
  }
  try {
    const allDirs = getAllDirPaths(rootPath, indexFileName);
    const indexFiles = allDirs.map((_dir) => `${_dir}/${indexFileName}`);

    console.log(indexFiles);
    indexFiles.forEach((indexFile) => {
      const dir = path.dirname(indexFile);
      let content = indexFileMessage;
      content += generateIndexFileContent(
        dir,
        supportedExtensions,
        indexFileName
      );
      console.log(indexFile);
      // if (!fs.existsSync(indexFile)) {

      fs.writeFileSync(indexFile, content, "utf8");

      console.log(`Populated: ${indexFile}`);
    });
  } catch (e) {
    console.log("Error", e);
    process.exit(1);
  }
}

module.exports = {
  generateIndexFiles,
};
