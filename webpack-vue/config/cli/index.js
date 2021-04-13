const fs = require('fs');
const path = require('path');
const { program } = require('commander'); // 命令行解析工具
const inquirer = require('inquirer'); // 控制台交互工具
const generator = require('./generator');

// program
//   .version('0.0.1')
//   .option('-pyf, --pyf <string>', 'Add project:year:folder')
//   .parse(process.argv);
// const options = program.opts();
// console.log(options.pyf);


function mkDir (src, des) {
}

// src目錄下的項目
const srcList = fs.readdirSync(path.resolve(__dirname, '../../src'));
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
  if (!fs.existsSync(proj)) {
    fs.mkdirSync(proj);
  }
  console.log(res, proj)
});
// 解析命令行参数