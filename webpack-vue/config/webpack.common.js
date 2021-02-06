const path = require('path');
const fs = require('fs');
const htmlWebpackPlugin = require('html-webpack-plugin'); // html模板插件
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // css提取插件
const CopyWebpackPlugin = require('copy-webpack-plugin'); // 文件複製插件
const { VueLoaderPlugin } = require('vue-loader'); // vue解析插件
const entryPath = path.resolve(__dirname, `../src/${global.proj}/`);
const outputPath = path.resolve(__dirname, `../dist/${global.proj}/`);
module.exports = {
  entry: {
    index: `${entryPath}/index.js`
  }, // 入口文件
  output: {
    path: outputPath, // 輸出項目路徑
    filename: 'js/[name].js', // 文件夹名 [name]就可以将出口文件名和入口文件名一一对应
    publicPath: '/' // 输出解析文件的目录
  },
  module: {
    rules: [{
        test: /\.(png|svg|jpe?g|gif)$/i, // 解析图片
        // include: /to64\/*/,
        // include: /\/static/,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 100 * 1024, // 大於100k轉碼
            name: '[name].[hash:7].[ext]', //文件名
            outputPath: 'img'
          }
        }]
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/, // 字体处理
        use: ['file-loader']
      }, {
        test: /\.s?css$/i, // 解析css, scss
        use: [
          // MiniCssExtractPlugin.loader,
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                config: path.resolve(__dirname, "./.postcssrc.js"),
              }
            }
          },
          'sass-loader',
          // 'vue-style-loader'
        ] // 解析順序,從右到左
      },{
        test: /\.vue$/i, // .vue文件解析
        exclude: /node_modules/,
        use: [{
          loader: 'vue-loader',
          options: {
            transformAssetUrls: {
              video: ['src', 'poster'],
              audio: 'src',
              source: 'src',
              img: 'src',
              image: ['xlink:href', 'href'],
              use: ['xlink:href', 'href']
            }
          }
        }]
      },  {
        test: /\.m?js$/, // js文件解析
        exclude: /node_modules/, // 排除符合条件的模块
        use: {
          loader: 'babel-loader',
          options: {
            configFile: path.resolve(__dirname,'./.babelrc') // 修改配置文件位置， 默认根目录
          }
        }
      }
    ]
  },
  plugins:[ // 插件
    new MiniCssExtractPlugin(), // css提取插件
    new VueLoaderPlugin(), // vue-loader 插件
    // copy custom static assets
    new CopyWebpackPlugin({ // 复制插件,将static复制到打包路径里
        patterns: [
          {
            from: path.join(entryPath, '/static'), // 从哪复制
            to: path.join(outputPath, '/static'), // 复制到哪
            // noErrorOnMissing: true, // 不提示未找到文件
            globOptions: {
              dot: true,
              gitignore: true,
              ignore: ['.*']
            },
            // 
          },
        ],
      }),
    new htmlWebpackPlugin({ // html模板插件
      filename: `${outputPath}/index.html`, // 文件名
      chunks: ['index'], // 导入js文件
      inject: 'body', // 插入js位置
      template: `${entryPath}/index.html`, // 模板文件位置
      timestamp: `<script>var timestamp = ${Date.now()};</script>`,
      clearCache: `<script>${fs.readFileSync(path.resolve(__dirname, 'clearCache.js'))}</script>` // 自定义模板传参<%= htmlWebpackPlugin.options.clearCache %>
    })
  ],
  resolve: {
    extensions: ['.js', '.json', 'scss', 'css', '.vue'], // 引入文件可以省略後綴
    alias: { // 別名
      '@src': entryPath
    }
  }
}