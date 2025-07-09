import path from "node:path";
import fs from "fs";
import childProcess from "node:child_process";
import * as JSONfn from "./JSONfn.js";

const nodeExecutable = process.argv[0];
const postcssExecutableModule = path.resolve(
  import.meta.dirname,
  // For resolve extension between ESM and CommonJS
  fs
    .readdirSync(import.meta.dirname)
    .find((i) => i.includes("postcss-executable"))
);

/**
 * Returns CSS selectors as an object.
 *
 * > Not all PostCSS plugins run synchronously, so we use `execFileSync` to block further
 * execution until PostCSS finishes processing.
 *
 * @param {{ from: string }} postcssOptions
 * @param {{ generateScopedName: string } | Object | undefined} cssModulesPluginOptions
 * @returns {Object}
 */
function getCSSModulesTokens(postcssOptions, cssModulesPluginOptions = {}) {
  const resultRaw = childProcess.execFileSync(
    nodeExecutable,
    [
      postcssExecutableModule,
      JSONfn.stringify(postcssOptions),
      JSONfn.stringify(cssModulesPluginOptions),
    ],
    {
      env: process.env,
    }
  );
  return JSON.parse(resultRaw.toString());
}

export { getCSSModulesTokens };
