const path = require('path'),
  fs = require('fs'),
  protobuf = require('protobufjs'),
  useData = require('./useData.json'); // 根據該json提取

 // 缓存文件数据
let fileCache = {
  allMesEnum: {
    enums: [],
    messages: []
  }
};
let src = path.resolve(__dirname, './src'); // 文件夹路径
let outPath = path.resolve(__dirname, './dist'); // 输出路径



findFiles(src);
// 遍历需要用到的协议
createJson(useData);

// 查找文件
function findFiles (src) {
  // 筛选proto文件
 let files = fs.readdirSync(src, { encoding: 'utf-8' }).filter(str => /\.ext\.proto$/.test(str));
 files.forEach(fileName => {
   let prefix = fileName.split('.')[0];
   let fileData = fs.readFileSync(path.resolve(src, fileName), { encoding: 'utf-8' }); // 保存读取的数据
   fileCache[prefix] = splitProto(fileName, fileData)
 })
}

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
  let messageItemReg = /\b(([a-zA-Z0-9]\w+)|(map\s*\<[^\>,]*\s*,\s*([^\>,]*)\s*\>))\s+\w+\s*\=\s*\w\s*;?/g

  // 匹配service内容
  let serviceReg = /\b(service\s+\w+\s*\{)[^\}]*(\})/g; // 匹配proto文件service内容

  // 匹配头部引入声明内容
  let keyWord = /(\bsyntax.*)|(\boption\s+\w+\s+=.*)|(\bpackage\s+\w+\s*;.*)/g; // |(\bimport.*)

  // 去注释
  fileData = fileData.replace(/\/\/.*/gm, '');

  // 獲取頭部各類
  let header = (fileData.match(keyWord) || []).join('\r');

  // 格式化message
  let messages = {};
  let messageExec = null;
  while (messageExec = messageReg.exec(fileData)) {
    let [src, fun, content] = messageExec;
    let messageItemExec = null;
    let redirect = [];
    messageItemReg.lastIndex = 0;
    while (messageItemExec = messageItemReg.exec(content)) {
      let fieldType = messageItemExec[2] || messageItemExec[4];
      if (type.indexOf(fieldType) === -1) {
        redirect.push(fieldType);
      }
    }
    fileCache.allMesEnum.messages[fun] = messages[fun] = {src, redirect};
  }
  
  // 格式化enum
  let enums = {};
  let enumExec = null;
  while (enumExec = enumReg.exec(fileData)) {
    let [src, name] = enumExec;
    fileCache.allMesEnum.enums[name] = enums[name] = src;
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

// 加載prto文件數據, 創建json
function createJson (useData) {
  let protoRoot = new protobuf.Root();
  let redirectArr = [];
  // 公共文件, 用於保存不在同一目錄下的變量
  let commonFile = {
    fileName: 'common.ext.proto',
    header: `syntax = "proto3";\roption objc_class_prefix = "PB3";\rpackage pb;`,
    message: [],
    enum: []
  };
  // 查找各種變量重定向
  let redirect = (name, protoData, data) => {
    let mesData = protoData.messages[name];
    let enumData = protoData.enums[name];
    if (mesData) {
      mesData.redirect.length && mesData.redirect.forEach(item => {
        redirect(item, protoData, data);
      })
      data.message.indexOf(mesData) === -1 && data.message.push(mesData);
    } else if (enumData) {
      data.enum.indexOf(enumData) === -1 && data.enum.push(enumData);
    } else {
      data.nofind.indexOf(name) === -1 && data.nofind.push(name);
    }
  }
  Object.keys(useData).forEach(service => {
    let protoData = fileCache[service]; // 當前文件緩存
    let totalData = { // 需要的數據
      fileName: protoData.fileName,
      services: protoData.services,
      header: protoData.header,
      message: [],
      enum: [],
      nofind: [],
      rpc: []
    }
    useData[service].enum && useData[service].enum.forEach(name => {
      redirect(name, protoData, totalData);
    })
    useData[service].message && useData[service].message.forEach(name => {
      redirect(name,protoData, totalData);
    })
    useData[service].service && useData[service].service.forEach(name => {
      let {src ,req, res} = protoData.rpcs[name];
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
      totalData.rpc.push(src);
    })
    // 如果是common.ext.proto的數據, 全部添加公用裡面
    if (totalData.fileName === "common.ext.proto") {
      commonFile.enum = [].concat(totalData.enum);
      commonFile.message = [].concat(totalData.message);
    } else {
      // 非公用文件都添加引入公用文件, 確保不會缺失變量
      totalData.header = `${totalData.header}\rimport "pb/common.ext.proto";`;
    }
    // 沒有找的變量從全局查找, 添加到公用裡面
    if (totalData.nofind.length) {
      totalData.nofind.forEach(name => { // 為在自己文件找到的變量
        redirect(name,fileCache.allMesEnum, commonFile);
      })
    }
    redirectArr.push(totalData);
  });
  redirectArr.forEach(item => {
    let arr = [].concat(commonFile.enum, commonFile.message);
    // 把和公用裡面重複的數據刪除
    arr.forEach(com => {
      if (item.enum.indexOf(com) > -1) {
        item.enum.splice(item.enum.indexOf(com), 1);
      }
      if (item.message.indexOf(com) > -1) {
        item.message.splice(item.message.indexOf(com), 1);
      }
    });
    let text = `${item.header}\r\r${item.enum.join('\r')}\r\r${item.message.map(item => item.src).join('\r')}\r\r${item.services? `${item.services[0]}\r${item.rpc.join('\r')}\r${item.services[1]}`: ''}`
    protobuf.parse(text, protoRoot);
    // fs.writeFileSync(`${outPath}/${item.fileName}`, text);
  });
  let commonFileText = `${commonFile.header}\r\r${commonFile.enum.join('\r')}\r\r${commonFile.message.map(item => item.src).join('\r')}`
  protobuf.parse(commonFileText, protoRoot);
  fs.writeFileSync(`${src}/index.json`, JSON.stringify(protoRoot.toJSON())); // 寫入json
  // fs.writeFileSync(`${outPath}/${commonFile.fileName}`, commonFileText);
}