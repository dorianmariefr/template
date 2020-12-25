let path = require("path")
let glob = require("glob")

if (process.env.TESTBUILD) {
  module.exports = {
    entry: glob.sync(__dirname + "/test/**/*.test.js")
    output: {
      path: __dirname + "/test-dist/"
    },
    devtool: "source-map"
    module: {
      rules: [
        {
          test: /\.pegjs$/,
          loader: "pegjs-loader",
        }
      ]
    },
    devServer: {
      contentBase: path.join(__dirname, "dist"),
      watchContentBase: true,
    },
  }
} else {
  module.exports = {
    entry: __dirname + "/src/Template.js"
    output: {
      path: __dirname + "/dist/"
      filename: "Template.js",
      library: "Template",
      libraryTarget: 'umd',
    },
    module: {
      rules: [
        {
          test: /\.pegjs$/,
          loader: "pegjs-loader",
        }
      ]
    },
    devServer: {
      contentBase: path.join(__dirname, "dist"),
      watchContentBase: true,
    },
  }
}
