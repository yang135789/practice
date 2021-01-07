const merge = require('webpack-merge');
const path = require('path');
const htmlWebpackPlugin = require('html-webpack-plugin'); // 多页面插件
const common = require('./webpack.common'); // 公用配置

module.exports = env => {
  // env 环境变量
  return merge(common(env), {
    mode: 'development',
    // 原始源代码（仅限行）
    devtool: 'cheap-module-source-map'
    ,
    entry:{ // 入口文件
        index:'./src/demo/index.js',
    },  // 要打包的主体
    mode:'development', // 模式,'development' 开发 或 'production'生产
    output:{  // 输出打包的文件
        path:path.resolve(__dirname,'./dist'), // 文件夹地址
        filename:'js/[name].js', // 文件夹名 [name]就可以将出口文件名和入口文件名一一对应
        publicPath: path.resolve(__dirname,'./src/demo') // 导入文件的根路径
    },
    devServer:{         //开发服务配置
        progress: true,
        port: 1080,
        open: true,
    },
    plugins:[ // 插件
        new htmlWebpackPlugin({
            filename: "views/page.html",
            title: "xxxx", 
            chunks: ['page'],
            template: "./src/demo1/index.html", // 模板文件位置
        }),
        // new webpack.HotModuleReplacementPlugin()
        // new CleanWebpackPlugin(['dist']) 
    ]
  })
};
