let path = require("path")
let glob = require("glob")

let entry = __dirname + "/src/index.js"
let outputPath = __dirname + "/dist/"

if (process.env.TESTBUILD) {
  entry = glob.sync(__dirname + "/test/**/*.test.js")
  outputPath = __dirname + "/test-dist/"
}

module.exports = {
  entry: entry,
  output: {
    path: outputPath,
  },
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
  }
}
