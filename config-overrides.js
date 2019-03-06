/* config-overrides.js */
const {
  override,
  addLessLoader,
  fixBabelImports,
  addDecoratorsLegacy,
  addBabelPlugin,
  addPostcssPlugins
} = require("customize-cra");
const fs = require("fs");
const Dotenv = require("dotenv-webpack");
const path = require("path");
const paths = require("react-scripts/config/paths");
const rewireEntry = require("./react-app-rewire-entry");

const MOD_PATH = path.resolve(__dirname, "./src");
const files = fs.readdirSync(MOD_PATH);
files.forEach(file => {
  if (file.indexOf(".") !== 0 && file.endsWith("page.tsx")) {
    const fileStr = file.split("");
    fileStr[0] = fileStr[0].toLocaleUpperCase();
    paths[`app${fileStr.join("")}Js`] = `${paths.appSrc}/${file}`;
  }
});
// paths.servedPath = './';

const { rewireWebpackEntryConfig, rewireDevServerkEntryConfig } = rewireEntry(
  Object.keys(paths)
    .filter(item => item.endsWith("Js"))
    .map(item => paths[item])
);

const overrideDevServer = () => configFunction => (proxy, allowedHost) => {
  const config = configFunction(proxy, allowedHost);
  return rewireDevServerkEntryConfig(config);
};

const addWebpackPlugin = () => config => {
  config.plugins.push(
    new Dotenv({
      path: path.join(__dirname, `${process.env.ENV}.env`),
      systemvars: true
    })
  );
  return config;
};
const overrideEntry = () => config => {
  config = rewireWebpackEntryConfig(config, process.env.NODE_ENV);
  return config;
};

module.exports = {
  webpack: override(
    overrideEntry(),
    addBabelPlugin([
      "module-resolver",
      {
        root: ["./src"],
        alias: {
          "@utils": "./src/utils",
          "@components": "./src/components/",
          "@contanier": "./src/contanier/",
          "@styles": "./src/styles/",
          src: "./src/"
        }
      }
    ]),
    addDecoratorsLegacy(),
    fixBabelImports("import", {
      libraryName: "antd-mobile",
      style: true // change importing css to less
    }),
    addWebpackPlugin(),
    addLessLoader({
      javascriptEnabled: true
    }),
    addPostcssPlugins([
      require("postcss-import")({}),
      require("postcss-url")({}),
      require("postcss-aspect-ratio-mini")({}),
      require("postcss-write-svg")({ utf8: false }),
      // require("postcss-cssnext")({}),
      require("postcss-viewport-units")({
        // vw适配中使用伪类选择器遇到的问题 https://blog.csdn.net/perryliu6/article/details/80965734
        filterRule: rule =>
          rule.selector.indexOf("::after") === -1 &&
          rule.selector.indexOf("::before") === -1 &&
          rule.selector.indexOf(":after") === -1 &&
          rule.selector.indexOf(":before") === -1
      }),
      require("cssnano")({
        preset: "advanced",
        autoprefixer: false,
        "postcss-zindex": false,
        // 解决了 animation-name 被重写的 bug  https://github.com/cssnano/cssnano/issues/247
        reduceIdents: false
      }),
      require("postcss-px-to-viewport")({
        viewportWidth: 750 / 2, // 视窗的宽度，对应的是我们设计稿的宽度，一般是750
        viewportHeight: 1334 / 2, // 视窗的高度，根据750设备的宽度来指定，一般指定1334，也可以不配置
        unitPrecision: 3, // 指定`px`转换为视窗单位值的小数位数（很多时候无法整除）
        viewportUnit: "vw", // 指定需要转换成的视窗单位，建议使用vw
        selectorBlackList: [".ignore", ".hairlines"], // 指定不转换为视窗单位的类，可以自定义，可以无限添加,建议定义一至两个通用的类名
        minPixelValue: 1, // 小于或等于`1px`不转换为视窗单位，你也可以设置为你想要的值
        mediaQuery: false // 允许在媒体查询中转换`px`
      })
    ])
  ),
  devServer: overrideDevServer()
};
