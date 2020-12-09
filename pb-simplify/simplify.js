const path = require('path'),
  fs = require('fs'),
  pbjs = require('protobufjs/cli/pbjs'),
  useData = require('./useData.json');

let fileCache = {}; // 缓存文件数据
let src = path.resolve(__dirname, './src'); // 文件夹路径
let outPath = path.resolve(__dirname, './dist'); // 输出路径

let files = fs.readdirSync(src, { encoding: 'utf-8' }).filter(str => /\.ext\.proto$/.test(str)); // 筛选proto文件
files.forEach(fileName => {
  let prefix = fileName.split('.')[0];
  let fileData = fs.readFileSync(path.resolve(src, fileName), { encoding: 'utf-8' }); // 保存读取的数据
  fileCache[prefix] = splitProto(fileName, fileData)
})

// 遍历需要用到的协议
getProto(useData);

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
  let rpcReg = /rpc\s+(\w+)\s*\((\w+)\)\s*returns\s*\((\w+)\)\s*;/g; 

  // 匹配enum内容
  let enumReg = /(?<!\bmessage\s+\w+\s*\{[^\{\}]*)\benum\s*(\w+)\s*\{[^\}]*\}/g;

  // 匹配message内容
  let messageReg = /\bmessage\s+(\w+)\s*\{(([^\{\}]*\benum\s*\w+\s*\{[^\}]*\}[^\}]*)|([^\}]*))\}/g;
  let messageItemReg = /\b(([a-zA-Z]\w+)|(map\s?\<[^\>,]*,[^\>,]*\>))\s+\w+\s*\=\s*\w\s*;?/g

  // 匹配service内容
  let serviceReg = /\b(service\s+\w+\s*\{)[^\}]*(\})/g; // 匹配proto文件service内容

  // 匹配头部引入声明内容
  let keyWord = /(\bsyntax.*)|(\boption.*)|(\bpackage.*)|(\bimport.*)/g;

  // 去注释
  fileData = fileData.replace(/\/\/.*/gm, '');

  let header = (fileData.match(keyWord) || []).join('');

  // 格式化message
  let messages = {};
  let messageExec = null;
  while (messageExec = messageReg.exec(fileData)) {
    let [src, fun, content] = messageExec;
    let messageItemExec = null;
    let redirect = [];
    messageItemReg.lastIndex = 0;
    while (messageItemExec = messageItemReg.exec(content)) {
      let fieldType = messageItemExec[1];
      if (type.indexOf(fieldType) === -1) {
        redirect.push(fieldType);
      }
    }
    messages[fun] = {src, redirect};
  }
  
  // 格式化enum
  let enums = {};
  let enumExec = null;
  while (enumExec = enumReg.exec(fileData)) {
    let [src, name] = enumExec;
    enums[name] = src;
  }

  // // 格式化rpc
  let rpcs = {};
  let rpcExec = null;
  while (rpcExec = rpcReg.exec(fileData)) {
    let [src, fun, req, res] = rpcExec;
    rpcs[fun] = {src, req, res}
  }

  // 格式化serviceReg
  let services = '';
  let serviceExec = null;
  while (serviceExec = serviceReg.exec(fileData)) {
    let [src, first, last] = serviceExec;
    services = [first, last];
  }

  return {
    fileName,
    services,
    messages,
    header,
    enums,
    rpcs
  }
}

// getProtoByFun
function getProto (useData) {
  let redirectArr = {
  };
  let redirect = (name, protoData, data) => {
    let mes = protoData.messages[name];
    let enu = protoData.enums[name];
    if (mes) {
      mes.redirect.length && mes.redirect.forEach(item => {
        redirect(item, protoData, data);
      })
      data.message.indexOf(mes) === -1 && data.message.push(mes);
    } else if (enu) {
      data.enum.indexOf(enu) === -1 && data.enum.push(enu);
    } else {
      data.nofind.push(name);
    }
    // protoData.enums[name] || protoData.messages[name];
  }

  Object.keys(useData).forEach(service => {
    let protoData = fileCache[service];
    let totalData = {
      fileName: protoData.fileName,
      message: [],
      enum: [],
      nofind: [],
      rpc: ''
    }
    useData[service].service && useData[service].service.forEach(funName => {
      let {src ,req, res} = protoData.rpcs[funName];
      let reqMsg = protoData.messages[req];
      let resMsg = protoData.messages[res];
      totalData.message.push(reqMsg);
      totalData.message.push(resMsg);
      reqMsg.redirect.forEach(item => {
        redirect(item,protoData, totalData);
      })
      resMsg.redirect.forEach(item => {
        redirect(item,protoData, totalData);
      })
      totalData.rpc = src;
        // console.log(funName, req, reqMsg, res, resMsg);
    })
    redirectArr[service] = totalData;
    console.log(totalData)
  });
}