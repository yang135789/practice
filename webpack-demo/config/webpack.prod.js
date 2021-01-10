

module.exports = env => {
  global.env = env; // 将环境变量设为全局, 所有使用到该变量的必须再次后面引入
  const merge = require('webpack-merge');
  console.log(env);
  const common = require('./webpack.common.js');
  return merge(common, {
    mode: 'production', // 生產模式
    devtool: false, // map映射
  });
}
