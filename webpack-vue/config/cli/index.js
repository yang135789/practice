const { program } = require('commander'); // 命令行解析工具
 
program
  .version('0.0.1')
  .option('-pyf, --pyf <string>', 'Add project:year:folder');
program.parse(process.argv);
const options = program.opts();
// 解析命令行参数
console.log(options.pyf);