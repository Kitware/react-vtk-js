const path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');

// ----------------------------------------------------------------------------
// Usage listing
// ----------------------------------------------------------------------------

const entry = {
  // PolyDataViewer: './Geometry/PolyDataViewer.js',
  // PolyDataWithData: './Geometry/PolyDataWithData.js',
  // SourceViewer: './Geometry/SourceViewer.js',
  // ProcessingPipeline: './Geometry/ProcessingPipeline.js',
  // OBJViewer: './Geometry/OBJViewer.js',
  Picking: './Geometry/Picking.js',
  // Glyph: './Geometry/Glyph.js',
  // PointCloud: './Geometry/PointCloud.js',
  // VolumeRendering: './Volume/VolumeRendering.js',
  // SyntheticVolumeRendering: './Volume/SyntheticVolumeRendering.js',
  // SliceRendering: './Volume/SliceRendering.js',
  // DynamicUpdate: './Volume/DynamicUpdate.js',
  // DynamicRepUpdate: './Volume/DynamicRepUpdate.js',
};

function toHtmlPlugin() {
  return Object.keys(entry).map(
    (name) =>
      new HtmlWebpackPlugin({
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
    mode: 'production',
    devtool: 'source-map',
    entry,
    output: {
      path: path.resolve(__dirname, 'www'),
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
              envName: 'development',
            },
          },
        },
      ],
    },
    devServer: {
      contentBase: path.join(__dirname, 'www'),
      compress: true,
      port: 9000,
    },
  };
};
