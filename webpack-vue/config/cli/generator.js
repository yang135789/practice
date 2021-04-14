// 使用模板生成项目
const Yeoman = require('yeoman-environment'); // 环境设置
const Generator = require('yeoman-generator'); // 生成
const path = require('path');
module.exports = class extends Generator {
  /**
   * 
   * @param {*} params {name: 项目文件名， store：是否使用vuex，router：是否使用路由}
   */
  constructor (params) {
    super([], { 
      // 自定义环境
      env: Yeoman.createEnv([], {
        // 设置执行命令目录，可通过this.destinationPath()获取
        cwd: path.resolve('./src', params.name)
      }),
      // 设置模板目录，可通过this.templatePath()获取
      resolved: path.resolve(__dirname, './templates')
    });
    this.params = params;
  }
  writing() {
    // 对象解构
    let {name, store, router} = this.params;
    console.log(`生成项目:${name},\n目录：${this.destinationPath()},\n使用vuex：${store},\n使用router：${router}`)
   
    // 复制模板，使用ejs语法
    // 如不设置环境或模板文件夹，需要自己指定文件路径
    this.fs.copyTpl(
      this.templatePath(), // 模板目录，该方法获取模板目录
      this.destinationPath(), // 目标目录，该方法获取执行命令目录
      {name, store, router}  // 给模板传参
    );
    // 选择不适用store不安装则删除store文件夹
    if (!store) {
      this.fs.delete(this.destinationPath('store'));
    }
    // 选择不使用router则删除router以及pages文件夹
    if (!router) {
      this.fs.delete(this.destinationPath('router'));
      this.fs.delete(this.destinationPath('pages'));
    }
  }
  end() {
    console.log('生成项目模板完成');
  }
}