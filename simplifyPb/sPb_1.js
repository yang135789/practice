const path = require('path'),
  fs = require('fs'),
  protobuf = require('protobufjs'),
  useData = require('./useData.json'), // 根據該json提取
  parse = require('./parse.js');

let src = path.resolve(__dirname, './src'); // 文件夹路径
let outPath = path.resolve(__dirname, './dist'); // 输出路径


findFiles(src);
// 遍历需要用到的协议

// 查找文件
function findFiles(src) {
  let protoRoot = new protobuf.Root();
  // 筛选proto文件
  let files = fs.readdirSync(src, { encoding: 'utf-8' }).filter(str => /\.ext\.proto$/.test(str));
  files.forEach(fileName => {
    // let prefix = fileName.split('.')[0];
    let root = {
      nested: {}
    }
    let fileData = fs.readFileSync(path.resolve(src, fileName), { encoding: 'utf-8' }); // 保存读取的数据
    parse(fileData, root, fileName)
  })
}
