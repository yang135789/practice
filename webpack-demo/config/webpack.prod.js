

module.exports = env => {
  // global.env = env; // 将环境变量设为全局, 所有使用到该变量的必须再次后面引入
  let [proj] = Object.keys(env).filter(key => /^:.*/.test(key));
  global.proj = proj.slice(1);
  const merge = require('webpack-merge'); // 配置合并方法
  const common = require('./webpack.common.js'); // 公用文件
  return merge(common, {
    mode: 'production', // 生產模式
    devtool: false, // map映射
  });
}
