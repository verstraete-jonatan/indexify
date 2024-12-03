const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
jest.mock("../scripts/createConfig", () => {
  return {
    loadConfig: jest.fn(),
  };
});
const { loadConfig } = require("../scripts/createConfig");

const EXAMPLE_DIR = path.resolve(__dirname, "example");
const SRC_DIR = path.join(EXAMPLE_DIR, "src");

beforeEach(() => {
  // Remove all index files to reset the environment
  removeIndexFiles(SRC_DIR, "_index.ts"); // Default cleanup
});

afterEach(() => {
  // Clean up after the tests
  jest.clearAllMocks();
  removeIndexFiles(SRC_DIR, "_index.ts");
});

/**
 * Recursively removes all index files with a given name from a directory.
 * @param {string} dir - The directory to clean.
 * @param {string} indexFileName - The name of the index file to remove.
 */
function removeIndexFiles(dir, indexFileName) {
  fs.readdirSync(dir).forEach((file) => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      removeIndexFiles(filePath, indexFileName);
    } else if (file === indexFileName) {
      fs.unlinkSync(filePath);
    }
  });
}

test("indexify generates correct index files based on initial config", () => {
  // Mock the initial config
  loadConfig.mockReturnValue({
    supportedExtensions: [".ts", ".tsx"],
    rootPath: "src",
    indexFileName: "_index.ts",
    watch: false,
  });

  // Run the indexify command
  execSync(`node ../../bin/indexify.js`, { cwd: EXAMPLE_DIR });

  // Check the contents of the generated index files
  const dir1IndexPath = path.join(SRC_DIR, "dir1", "_index.ts");
  const dir2IndexPath = path.join(SRC_DIR, "dir2", "_index.ts");

  expect(fs.existsSync(dir1IndexPath)).toBe(true);
  expect(fs.existsSync(dir2IndexPath)).toBe(true);

  const dir1Content = fs.readFileSync(dir1IndexPath, "utf8");
  const dir2Content = fs.readFileSync(dir2IndexPath, "utf8");

  expect(dir1Content).toBe(`export * from './file1';\n`);
  expect(dir2Content).toBe(
    `export * from './file3';\nexport * from './file4';\n`
  );
});

test("indexify respects updated config options (dynamic mock)", () => {
  // Mock updated config with a different index file name and supported extensions
  loadConfig.mockReturnValue({
    supportedExtensions: [".ts", ".tsx", ".js"],
    rootPath: "src",
    indexFileName: "index.ts", // Change from '_index.ts'
    watch: false,
  });

  // Run the indexify command
  execSync(`node ../../bin/indexify.js`, { cwd: EXAMPLE_DIR });

  // Check the contents of the generated index files
  const dir1IndexPath = path.join(SRC_DIR, "dir1", "index.ts");
  const dir2IndexPath = path.join(SRC_DIR, "dir2", "index.ts");

  expect(fs.existsSync(dir1IndexPath)).toBe(true);
  expect(fs.existsSync(dir2IndexPath)).toBe(true);

  const dir1Content = fs.readFileSync(dir1IndexPath, "utf8");
  const dir2Content = fs.readFileSync(dir2IndexPath, "utf8");

  expect(dir1Content).toBe(
    `export * from './file1';\nexport * from './file2';\n`
  );
  expect(dir2Content).toBe(
    `export * from './file3';\nexport * from './file4';\n`
  );
});
