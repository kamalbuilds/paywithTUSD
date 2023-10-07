const webpack = require("webpack");
module.exports = function override(config, env) {

  let loaders = config.resolve
  loaders.fallback = {
    "fs": false,
    // "tls": false,
    // "net": false,
    "http": require.resolve("stream-http"),
    "https": false,
    "zlib": require.resolve("browserify-zlib"),
    "path": require.resolve("path-browserify"),
    "stream": require.resolve("stream-browserify"),
    "url": require.resolve("url/"),
    os: require.resolve("os-browserify"),
    "crypto": require.resolve("crypto-browserify")
  }

  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: "process/browser",
      Buffer: ["buffer", "Buffer"],
    }),
  ]);

  config.resolve = { fallback: { 'process/browser': require.resolve('process/browser'), } }


  return config
}