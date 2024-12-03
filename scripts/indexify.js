const fs = require("fs");
const path = require("path");

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

/**
 * Populate index files
 * @param {string} rootPath - Root directory to process
 * @param {string[]} supportedExtensions - Supported file extensions
 * @param {string} indexFileName - Name of the index file
 */
function generateIndexFiles(rootPath, supportedExtensions, indexFileName) {
  const indexFiles = findIndexFiles(rootPath, indexFileName);

  indexFiles.forEach((indexFile) => {
    const dir = path.dirname(indexFile);
    const content = generateIndexFileContent(
      dir,
      supportedExtensions,
      indexFileName
    );

    fs.writeFileSync(indexFile, content, "utf8");
    console.log(`Populated: ${indexFile}`);
  });
}

module.exports = {
  generateIndexFiles,
};
