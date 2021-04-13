const Yeoman = require('yeoman-environment'); // 环境配置
const Generator = require('yeoman-generator');
const path = require('path');
module.exports = class extends Generator {
  constructor (params) {
    super([], { // 自定义环境
      env: Yeoman.createEnv([], {
        cwd: path.resolve('./src', params.name) // 目标目录
      }),
      resolved: path.resolve(__dirname, './templates') // 模板目录
    });
    this.params = params;
    // console.log();
  }
  writing() {
    this.fs.copyTpl(
      this.templatePath(), // 模板
      this.destinationPath(), // 目标
      {
        htmlTitle: '<%= htmlWebpackPlugin.options.title %>',
        htmlTimestamp: '<%= htmlWebpackPlugin.options.timestamp %>',
        htmlClearCache: '<%= htmlWebpackPlugin.options.clearCache %>'
      }
    );
  }
}