const path = require('path');
const htmlWebpackPlugin = require('html-webpack-plugin'); // html模板插件
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // css提取插件
const { VueLoaderPlugin } = require('vue-loader'); // vue解析插件
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
    rules: [
      {
        test: /\.(png|svg|jpg|gif)$/i, // 解析图片
        use: [{
          loader: 'url-loader'
        }]
      }
      ,{
        test: /\.s?css$/i, // 解析css, scss
        use: [
          // MiniCssExtractPlugin.loader,
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                config: path.resolve(__dirname, "./.postcssrc"),
              }
            }
          },
          'sass-loader',
          // 'vue-style-loader'
        ] // 解析順序,從右到左
      },
      {
        test: /\.m?js$/, // js文件解析
        exclude: /node_modules/, // 排除符合条件的模块
        use: {
          loader: 'babel-loader',
          options: {
            configFile: path.resolve(__dirname,'./.babelrc') // 修改配置文件位置， 默认根目录
          }
        }
      }, {
        test: /\.vue$/i,
        use: [{
          loader: 'vue-loader'
        }]
      }]
  },
  plugins:[ // 插件
    // new MiniCssExtractPlugin(),
    new VueLoaderPlugin(),
    new htmlWebpackPlugin({ // html模板插件
      filename: `${output}/index.html`, // 文件名
      chunks: ['index'], // 导入js文件
      inject: 'body', // 插入js位置
      template: `${projPath}/index.html`, // 模板文件位置
    })
  ],
}