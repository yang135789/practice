const webpackMerge = require('webpack-merge'); // 配置合并方法

module.exports = env => {
  global.proj = Object.keys(env).filter(key => /^:.*/.test(key))[0].slice(1);
  const common = require('./webpack.common.js'); // 公用配置， 因为用到global.proj变量，所以在后面赋值后引入
  return webpackMerge.merge(common, {
    mode: 'production', // 生產模式
    devtool: false, // map映射
  });
}
