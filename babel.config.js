export default {
  presets: [["@babel/preset-env", { targets: "node 14" }]],
  plugins: [
    [
      "transform-import-meta",
      {
        moduleFilename: "fileURLToPath(import.meta.url)",
      },
    ],
    [
      "module-resolver",
      {
        extensions: [".js", ".cjs"],
        resolvePath: function (sourcePath) {
          return sourcePath.replace(/\.js$/, ".cjs");
        },
      },
    ],
  ],
};
