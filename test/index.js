import path from "node:path";
import { test, describe } from "node:test";
import babel from "@babel/core";
import esmBabelPluginTransformCssModules from "../src/index.js";
import cjsBabelPluginTransformCssModules from "../cjs/index.cjs";

const snapshotOptions = { serializers: [(value) => value] };

const transformExampleFile = (pluginRunner, pluginOptions) => {
  const exampleFilePath = path.resolve(
    import.meta.dirname,
    `./example/Component.jsx`
  );
  return babel.transformFileSync(exampleFilePath, {
    root: import.meta.dirname,
    configFile: false,
    presets: [
      ["@babel/preset-env", { modules: false, targets: { esmodules: true } }],
      "@babel/preset-react",
    ],
    plugins: [
      [
        pluginRunner,
        {
          generateScopedName: (name) => `lib${name}`,
          ...pluginOptions,
        },
      ],
    ],
  });
};

describe("[esm] babel-plugin-transform-css-modules", async () => {
  test("default", async (t) => {
    const output = transformExampleFile(esmBabelPluginTransformCssModules);
    t.assert.snapshot(output.code, snapshotOptions);
  });

  test("with `keep` option", async (t) => {
    const output = transformExampleFile(esmBabelPluginTransformCssModules, {
      keep: true,
    });
    t.assert.snapshot(output.code, snapshotOptions);
  });
});

describe("[cjs] babel-plugin-transform-css-modules", async () => {
  test("default", async (t) => {
    const output = transformExampleFile(cjsBabelPluginTransformCssModules);
    t.assert.snapshot(output.code, snapshotOptions);
  });

  test("with `keep` option", async (t) => {
    const output = transformExampleFile(cjsBabelPluginTransformCssModules, {
      keep: true,
    });
    t.assert.snapshot(output.code, snapshotOptions);
  });
});
