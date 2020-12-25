let path = require("path")
let glob = require("glob")

let entry = __dirname + "/src/Template.js"
let outputPath = __dirname + "/dist/"
let devtool = ""

if (process.env.TESTBUILD) {
  entry = glob.sync(__dirname + "/test/**/*.test.js")
  outputPath = __dirname + "/test-dist/"
  devtool = "source-map"
}

module.exports = {
  target: "web",
  entry: entry,
  output: {
    path: outputPath,
    filename: "Template.js",
    library: "Template",
    libraryTarget: "this",
    globalObject: "this",
    umdNamedDefine: true,
  },
  devtool: devtool,
  module: {
    rules: [
      {
        test: /\.pegjs$/,
        loader: "pegjs-loader"
      }
    ]
  },
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    watchContentBase: true
  },
}
