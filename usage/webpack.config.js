const path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');

// ----------------------------------------------------------------------------
// Usage listing
// ----------------------------------------------------------------------------

const entry = {
  PolyDataViewer: './Geometry/PolyDataViewer.js',
  PolyDataWithData: './Geometry/PolyDataWithData.js',
  SourceViewer: './Geometry/SourceViewer.js',
  ProcessingPipeline: './Geometry/ProcessingPipeline.js',
  OBJViewer: './Geometry/OBJViewer.js',
  PointCloud: './Geometry/PointCloud.js',
};

function toHtmlPlugin() {
  return Object
    .keys(entry)
    .map((name) => new HtmlWebpackPlugin({
        chunks: [name],
        title: name,
        filename: `${name}.html`,
        template: 'template.html',
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
          test: require.resolve('react'),
          loader: 'expose-loader',
          options: {
            exposes: ['React'],
          },
        },
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
    devServer: {
      contentBase: path.join(__dirname, 'build-usage'),
      compress: true,
      port: 9000
    }
  };
};
