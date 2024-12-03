#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { generateIndexFiles } = require("../src/indexify"); // Import the core functionality

// Path to the configuration file
const configPath = path.resolve(process.cwd(), "indexify.conf.json");

// Check if the configuration exists
if (!fs.existsSync(configPath)) {
  console.error(
    "Error: indexify.conf.json not found. Please create one in the root of your project."
  );
  process.exit(1);
}

console.log("oooi");
// Parse configuration
let config;
try {
  config = JSON.parse(fs.readFileSync(configPath, "utf8"));
} catch (err) {
  console.error(
    "Error parsing indexify.conf.json. Ensure it contains valid JSON."
  );
  process.exit(1);
}

// Validate configuration
const { supportedExtensions, rootPath, indexFileName, watch } = config;
if (
  !Array.isArray(supportedExtensions) ||
  typeof rootPath !== "string" ||
  typeof indexFileName !== "string" ||
  typeof watch !== "boolean"
) {
  console.error(
    "Error: Invalid configuration in indexify.conf.json. Please check the required properties: " +
      "supportedExtensions (array), rootPath (string), indexFileName (string), watch (boolean)."
  );
  process.exit(1);
}

// Main execution of generating index files or watching for changes
if (watch) {
  const chokidar = require("chokidar");
  chokidar.watch(rootPath, { ignoreInitial: false }).on("all", () => {
    generateIndexFiles(rootPath, supportedExtensions, indexFileName);
  });
  console.log(`Watching ${rootPath} for changes...`);
} else {
  generateIndexFiles(rootPath, supportedExtensions, indexFileName);
  console.log("Index files generated.");
}
