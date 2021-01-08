const path = require('path');
const htmlWebpackPlugin = require('html-webpack-plugin'); // html模板插件
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // css提取插件
const projPath = path.resolve(__dirname, `../src/${global.env.proj}/`);
const output = path.resolve(__dirname, `../dist/${global.env.proj}/`);
module.exports = {
  entry: {
    index: `${projPath}/index.js`
  }, // 入口文件
  output: {
    path: output, // 輸出路徑
    filename: 'js/[name].js', // 文件夹名 [name]就可以将出口文件名和入口文件名一一对应
    publicPath: './' // 导入文件的根路径
  },
  module: {
    rules: [{
        test: /\.s?css$/i, // 解析css, scss
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'] // 解析順序,從右到左
      },
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', { targets: "defaults" }]
            ]
          }
        }
      }]
  },
  plugins:[ // 插件
    new MiniCssExtractPlugin(),
    new htmlWebpackPlugin({ // html模板插件
      filename: `${output}/index.html`, // 文件名
      chunks: ['index'], // 导入js文件
      inject: 'body', // 插入js位置
      template: `${projPath}/index.html`, // 模板文件位置
    })
  ]
}