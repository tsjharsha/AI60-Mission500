// Small test-only TypeScript loader; no build artifacts are written into src.
const ts = require("typescript");
const fs = require("node:fs");
const Module = require("node:module");
const path = require("node:path");
const resolve = Module._resolveFilename;
Module._resolveFilename = function (request, parent, ...args) {
  if (request.startsWith("@/"))
    request = path.join(__dirname, "..", "src", request.slice(2));
  return resolve.call(this, request, parent, ...args);
};
require.extensions[".ts"] = function (module, filename) {
  const source = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  });
  module._compile(source.outputText, filename);
};
