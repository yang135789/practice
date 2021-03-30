const webpackMerge = require('webpack-merge'); // 配置合并方法
const common = require('./webpack.common.js'); // 公用配置， 因为用到global.proj变量，所以在后面赋值后引入

module.exports = env => {
  return webpackMerge.merge(common(env), {
    mode: 'production', // 生產模式
    devtool: false, // map映射
  });
}
