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

beforeAll(() => {
  // Create example structure
  const dir1 = path.join(SRC_DIR, "dir1");
  const dir2 = path.join(SRC_DIR, "dir2");
  fs.mkdirSync(dir1, { recursive: true });
  fs.mkdirSync(dir2, { recursive: true });

  // Mock files
  fs.writeFileSync(path.join(dir1, "file1.ts"), "");
  fs.writeFileSync(path.join(dir1, "file2.js"), "");
  fs.writeFileSync(path.join(dir2, "file3.tsx"), "");
  fs.writeFileSync(path.join(dir2, "file4.ts"), "");
});

beforeEach(() => {
  // Remove all index files
  removeIndexFiles(SRC_DIR, "_index.ts");
});

afterEach(() => {
  jest.clearAllMocks();
  removeIndexFiles(SRC_DIR, "_index.ts");
});

/**
 * Recursively removes all index files with a given name from a directory.
 */
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

test("indexify generates correct index files based on initial config", () => {
  // Mock the initial config
  loadConfig.mockReturnValue({
    supportedExtensions: [".ts", ".tsx"],
    rootPath: "src",
    indexFileName: "_index.ts",
    watch: false,
  });

  // Run the indexify command
  console.log(`Running indexify in: ${EXAMPLE_DIR}`);
  execSync(`node ../../bin/indexify.js`, { cwd: EXAMPLE_DIR });

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
