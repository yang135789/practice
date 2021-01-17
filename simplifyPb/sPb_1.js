const path = require('path'),
  fs = require('fs'),
  protobuf = require('protobufjs');
  // useData = require('./useData.json'); // 根據該json提取
let need = [
  'GetMoney',
  'GetBag',
  'RoomAwardData',
  'GetActivity',
  'SlotMachine2020Data',
  'SlotMachine2020UserDate',
  'SlotMachine2020WinRecords',
  'SlotMachine2020Bet',
  'PlayerSort',
  'GetGiftConfig',
  'GetExchangeConf',
  'Buy',
  'GetPlayer'
];

let funcNameRe = /createApiOpt\(\s*['"][a-zA-Z]+['"]\s*,\s*(['"][a-zA-Z]+['"])/g;

let src = path.resolve(__dirname, './src'); // 文件夹路径
let outPath = path.resolve(__dirname, './dist'); // 输出路径


filesToJson(src);
// 遍历需要用到的协议

// 将proto转json格式
function filesToJson(src) {
  let protoRoot = new protobuf.Root();
  let newProtoRoot = new protobuf.Root();
  // 筛选proto文件
  let files = fs.readdirSync(src, { encoding: 'utf-8' }).filter(str => /\.ext\.proto$/.test(str));
  let root = {
    nested: {}
  }
  files.forEach(fileName => {
    // let prefix = fileName.split('.')[0];
    let fileData = fs.readFileSync(path.resolve(src, fileName), { encoding: 'utf-8' }); // 保存读取的数据
    protobuf.parse(fileData, protoRoot);
    // parse(fileData, root, fileName);
  })
  // let protoJson = protoRoot.toJSON();
  parseData(protoRoot, need)
  // console.log(nestedJson);
}

function parseData (protoRoot, need) {
  let nestedJson = {
    nested: {},
    options: {}
  }; // 导出json
  let methodArr = {}; // 获取所有的服务
  for (let pkgName in protoRoot.nested) {
    let pkg = protoRoot.nested[pkgName];
    for (let key in pkg) {
      if (!pkg[key]) continue;
      if (pkg[key] && pkg[key].constructor.className === 'Service') {
        Object.assign(methodArr, pkg[key].methods);
      }
      console.log(pkg[key] && pkg[key].constructor.className, pkg[key] && pkg[key].fullName);
      if (!pkg[key]) {
        console.log(key, pkg[key])
      }
    }
  }
  nestedJson.options = protoRoot.options;
  need.map(item => {
    let lookup = methodArr[item];
    let {responseType, requestType, fullName} = lookup;
    let [pg, server, method] = fullName.split('.');
    if (!nestedJson[pg]) { // 包名路径
      nestedJson[pg] = {
        nested: {
          [server]: []
        }
      }
    }
    // console.log(lookup.fullName, responseType, requestType)
  })
}

function redirect (key) {

}