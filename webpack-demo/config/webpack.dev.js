module.exports = env => {
  global.env = env; // 将环境变量设为全局, 所有使用到该变量的必须再次后面引入
  const merge = require('webpack-merge');
  const path = require('path');
  const common = require('./webpack.common'); // 公用配置
  const output = path.resolve(__dirname, `../dist/${global.env.proj}/`);
  console.log(output);
  // env 环境变量
  return merge(common, {
    // 原始源代码（仅限行）
    devtool: 'cheap-module-source-map',
    mode:'development', // 模式,'development' 开发 或 'production'生产
    devServer:{         //开发服务配置
      // publicPath: '/',
      // contentBase: `/static`, // 項目路徑
      // contentBasePublicPath: '/static',
      // host: '0.0.0.0', // 設為0.0.0.0才能在局域網內訪問
      progress: true, // 進度打印在控制台
      port: 8080, // 端口
      open: false, // 啟動後自動打開瀏覽器
      hot: true // 熱替換
    }
  })
};
