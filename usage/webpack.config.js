const path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');

// ----------------------------------------------------------------------------
// Usage listing
// ----------------------------------------------------------------------------

const entry = {
  PolyDataViewer: './Geometry/PolyDataViewer.js',
};

function toHtmlPlugin() {
  return Object
    .keys(entry)
    .map((name) => new HtmlWebpackPlugin({
        chunks: [name],
        filename: `${name}.html`
      })
    );
}

// ----------------------------------------------------------------------------

module.exports = function(_env, argv) {
  return {
    mode: 'development',
    devtool: 'cheap-module-source-map',
    entry,
    output: {
      path: path.resolve(__dirname, 'build-usage'),
      filename: 'js/[name].js',
    },
    plugins: toHtmlPlugin(),
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              cacheCompression: false,
              envName: 'development'
            }
          }
        },
      ]
    },
    resolve: {
      fallback: {
        stream: false,
        buffer: false,
      },
    },
  };
};
