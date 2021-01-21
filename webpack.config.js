const path = require('path');
const TerserWebpackPlugin = require("terser-webpack-plugin");

module.exports = function(_env, argv) {
  const isProduction = !!_env.production;
  const isDevelopment = !isProduction;
  return {
    mode: isProduction ? 'production' : 'development',
    devtool: isDevelopment && "cheap-module-source-map",
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'ReactVtkJs.js',
      library: 'ReactVtkJs',
      libraryTarget: 'umd',
    },
    externals: {
      react: {
        commonjs: 'react',
        commonjs2: 'react',
        amd: 'react',
        root: 'React',
      },
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              cacheDirectory: true,
              cacheCompression: false,
              envName: isProduction ? "production" : "development"
            }
          }
        },
      ]
    },
    resolve: {
      alias: {
        'react-vtk-js': __dirname,
      },
      fallback: {
        stream: false,
        buffer: false,
      },
    },
    plugins: [
    ],
    optimization: {
      minimize: isProduction,
      minimizer: [
        new TerserWebpackPlugin({
          terserOptions: {
            compress: {
              comparisons: false
            },
            mangle: {
              safari10: true
            },
            output: {
              comments: false,
              ascii_only: true
            },
            warnings: false
          }
        }),
      ]
    }
  };
};
