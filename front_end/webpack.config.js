/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");


module.exports = {
  entry: './src/index.ts',
  module: {
    rules: [{
      test: /\.ts?$/,
      use: 'ts-loader',
      exclude: /node_modules/,
    }, {
      test: /\.css$/,
      use: [MiniCssExtractPlugin.loader, "css-loader"]
    },   {
      test: /\.(scss)$/,
      use: [
        {
          // Adds CSS to the DOM by injecting a `<style>` tag
          loader: 'style-loader'
        },
        {
          // Interprets `@import` and `url()` like `import/require()` and will resolve them
          loader: 'css-loader'
        },
        {
          // Loader for webpack to process CSS with PostCSS
          loader: 'postcss-loader',
          options: {
            postcssOptions: {
              plugins: () => [
                autoprefixer
              ]
            }
          }
        },
        {
          // Loads a SASS/SCSS file and compiles it to CSS
          loader: 'sass-loader'
        }
      ]
    }],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'vk_grp_info',
      template: 'src/index.html'
    }), new MiniCssExtractPlugin({
      filename: "bundle.css"
    })
  ],
  devServer: {
    static: path.join(__dirname, "dist"),
    compress: true,
    port: 4000,
  },
};