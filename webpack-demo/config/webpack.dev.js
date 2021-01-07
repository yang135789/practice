module.exports = env => {
  global.env = env; // 将环境变量设为全局, 所有使用到该变量的必须再次后面引入
  const merge = require('webpack-merge');
  const path = require('path');
  const common = require('./webpack.common'); // 公用配置
  // env 环境变量
  return merge(common, {
    // 原始源代码（仅限行）
    devtool: 'cheap-module-source-map',
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
    }
  })
};
