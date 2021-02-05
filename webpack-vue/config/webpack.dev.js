const webpackMerge = require('webpack-merge');

module.exports = env => {
  // 获取环境变量，匹配: 开头的键作为项目文件名
  global.proj = Object.keys(env).filter(key => /^:.*/.test(key))[0].slice(1);
  const common = require('./webpack.common'); // 公用配置， 因为用到global.proj变量，所以在后面赋值后引入
  return webpackMerge.merge(common, {
    // 原始源代码（仅限行）
    devtool: 'cheap-module-source-map',
    mode:'development', // 模式,'development' 开发 或 'production'生产
    devServer:{         //开发服务配置
      // publicPath: '/',
      // contentBase: `/static`, // 項目路徑
      // contentBasePublicPath: '/static',
      host: '0.0.0.0', // 設為0.0.0.0才能在局域網內訪問
      progress: true, // 進度打印在控制台
      port: 8080, // 端口
      open: false, // 啟動後自動打開瀏覽器
      hot: true // 熱替換，自动使用webpack.HotModuleReplacementPlugin插件
    }
  })
};
