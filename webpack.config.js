let path = require('path')

module.exports = {
  module: {
    rules: [
      {
        test: /\.pegjs$/,
        loader: 'pegjs-loader'
      }
    ]
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    watchContentBase: true
  }
}
