const path = require('path'),
  fs = require('fs'),
  pbjs = require('protobufjs/cli/pbjs'),
  useFun = require('./useFun.json');

let fileCache = {}; // 缓存文件数据
let src = path.resolve(__dirname, './src'); // 文件夹路径
let outPath = path.resolve(__dirname, './dist'); // 输出路径

let files = fs.readdirSync(src, { encoding: 'utf-8' }).filter(str => /\.ext\.proto$/.test(str)); // 筛选proto文件
files.forEach(fileName => {
  let prefix = fileName.split('.')[0];
  let fileData = fs.readFileSync(path.resolve(src, fileName), { encoding: 'utf-8' }); // 保存读取的数据
  fileCache[prefix] = splitProto(fileName, fileData)
})

// Object.keys(useFun).forEach(key => {
//   useFun[key].forEach(fun => {
//     let funReg = new RegExp(`rpc\\s${fun}\\s*\\((\\w+)\\)\\s*returns\\s*\\((\\w+)\\)`, 'g'); // 匹配方法
//     console.log(fun);
//     console.log(funReg.test(fileCache[key]));
//   })
// });

// let protoFiles = files.filter(str => /\.proto$/.test(str)).map(name => path.resolve(src, name));
// pbjs.main(['--target', 'json', '--out', src + '/index.json'].concat(protoFiles), function (err, output) {
//   if (err) throw err;
//   console.log(output);
// });

// 对proto文件数据进行格式化
function splitProto (fileName, fileData) {
  // proto类型
  let type = ['double', 'float', 'int32', 'int64', 'uint32', 'uint64', 'sint32', 'sint64', 'fixed32', 'fixed64', 'sfixed32', 'sfixed64', 'bool', 'string', 'bytes'];
  // 匹配rpc
  // let rpcReg = (name) => new RegExp(`rpc\\s${name}\\s*\\((\\w+)\\)\\s*returns\\s*\\((\\w+)\\)`, 'g'); 
  let rpcReg = /rpc\s+(\w+)\s*\((\w+)\)\s*returns\s*\((\w+)\)\s*;/g; 
  // 匹配enum内容
  let enumReg = /(?<!\bmessage\s+\w+\s*\{[^\{\}]*)\benum\s*\w+\s*\{[^\}]*\}/g;
  // 匹配message内容
  let messageReg = /\bmessage\s+\w+\s*\{(([^\{\}]*\benum\s*\w+\s*\{[^\}]*\}[^\}]*\})|([^\}]*\}))/g;
  // 匹配service内容
  let serviceReg = /\bservice\s+\w+\s*\{[^\}]*\}/g; // 匹配proto文件service内容
  // 匹配头部引入声明内容
  let keyWord = /(\bsyntax.*)|(\boption.*)|(\bpackage.*)|(\bimport.*)/g;
  
  // 去注释
  fileData = fileData.replace(/\/\/.*/gm, '');
  
  let messages = fileData.match(messageReg);
  let header = fileData.match(keyWord);
  let enums = fileData.match(enumReg);
  let rpcs = fileData.match(rpcReg);
  // console.log(fileName, messages.join('\n'));
  // messages && fs.writeFileSync(`${outPath}/messages.${fileName}`, messages.join('\n'));
  // header && fs.writeFileSync(`${outPath}/header.${fileName}`, header.join('\n'));
  // enums && fs.writeFileSync(`${outPath}/enums.${fileName}`, enums.join('\n'));
  rpcs && fs.writeFileSync(`${outPath}/rpc.${fileName}`, rpcs.join('\n'));
  return fileData.match(messageReg)
}