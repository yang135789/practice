const webpack = require('webpack');
const webpackMerge = require('webpack-merge'); // 配置合并方法
const common = require('./webpack.common.js'); // 公用配置， 因为用到global.proj变量，所以在后面赋值后引入
const CopyWebpackPlugin = require('copy-webpack-plugin'); // 文件複製插件
const path = require('path');
module.exports = env => {
  const proj = Object.keys(env).filter(key => /^:.*/.test(key))[0].slice(1);
  const outputPath = path.resolve(__dirname, `../dist/${proj}/`);
  return webpackMerge.merge(common(env), {
    mode: 'production', // 生產模式
    devtool: false, // map映射
    plugins: [
      new CopyWebpackPlugin({ // 复制插件,将static复制到打包路径里
        patterns: [
          {
            from: path.join('./assets/dll/vue-dll.js'), // 从哪复制
            to: path.join(outputPath, '/js/dll/'), // 复制到哪
            noErrorOnMissing: true, // 不提示未找到文件
            globOptions: {
              dot: true,
              gitignore: true,
              ignore: ['.*']
            },
            // 
          },
        ],
      }),
      new webpack.DllReferencePlugin({
        manifest: require(path.join(__dirname, '../assets/dll', 'vue.manifest.json'))
      })
    ]
  });
}
