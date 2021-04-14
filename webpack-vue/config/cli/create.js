const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer'); // 控制台交互工具
const Generator = require('./generator'); 

// src目錄下的項目
const srcList = fs.readdirSync(path.resolve(__dirname, '../../src'));
// 设置问题
const prompt = [
  {
    name: "name",
    type: 'input',
    message: "請輸入項目名",
    validate (val) {
      if (val === '') return '項目名不能為空';
      if (srcList.indexOf(val) !== -1) return '已經存在相同名字的項目名'
      return true
    }
  },
  {
    name: "store",
    type: 'confirm',
    message: "使用vuex?",
    default: true
  },
  {
    name: "router",
    type: 'confirm',
    message: "使用vue-router?",
    default: true
  }
]
// 設置交互問題
inquirer.prompt(prompt).then(res => {
  let proj = path.resolve('./src', res.name);
  if (!fs.existsSync(proj)) { // 判断有无文件夹存在，无则创建
    fs.mkdirSync(proj);
  }
  const generator = new Generator(res);
  generator.run();
});
// 解析命令行参数