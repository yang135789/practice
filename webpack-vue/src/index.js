const fs = require('fs');
const path = require('path');
const { program } = require('commander'); // 命令行解析工具
const inquirer = require('inquirer'); // 控制台交互工具

// program
//   .version('0.0.1')
//   .option('-pyf, --pyf <string>', 'Add project:year:folder')
//   .parse(process.argv);
// const options = program.opts();
// console.log(options.pyf);

// src目錄下的項目
const srcList = fs.readdirSync(path.resolve(__dirname, '../../src'));

// 設置交互問題
inquirer.prompt([
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
    name: "vuex",
    type: 'confirm',
    message: "使用vuex?",
    default: true
  },
  {
    name: "vue-router",
    type: 'confirm',
    message: "使用vue-router?",
    default: true
  }
]).then(answers => {
  console.log(answers);
  fs.copyFile(path.resolve(__dirname, './index.js'), path.resolve(__dirname, `../../src/index.js`), (err) => {
    console.log('複製錯誤', err);
  })
})
// 解析命令行参数