Generate Index Files:

Automatically populate _index.ts files based on the configuration.
Configurable via indexify.conf.json:

supportedExtensions: Array of file extensions to include. Default: ['.ts'].
rootPath: Path to the source root directory. Default: "src".
indexFileName: Name of the index file. Default: "_index.ts".
watch: Boolean flag to enable/disable file watcher. Default: false.
Watch Mode (Optional):

Uses chokidar to monitor the rootPath for changes and regenerate index files dynamically.
CLI Installation:

Users can run the package with a CLI command (e.g., npx indexify or yarn indexify).
Optionally, create a postinstall script to generate the default indexify.conf.json.
Error Handling:

Validate the indexify.conf.json (e.g., invalid extensions or root paths).
Provide clear error messages for misconfigurations.
