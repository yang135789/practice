const path = require('path'),
  fs = require('fs'),
  protobuf = require('protobufjs');
  // useData = require('./useData.json'); // 根據該json提取
var fieldtype = [ // proto字段類型
  "double",   // 0
  "float",    // 1
  "int32",    // 2
  "uint32",   // 3
  "sint32",   // 4
  "fixed32",  // 5
  "sfixed32", // 6
  "int64",    // 7
  "uint64",   // 8
  "sint64",   // 9
  "fixed64",  // 10
  "sfixed64", // 11
  "bool",     // 12
  "string",   // 13
  "bytes"     // 14
];
let apiList = [];
let extraList = ['RPCInput', 'RPCOutput'];

let src = path.resolve(__dirname, './src'); // 文件夹路径
let outPath = path.resolve(__dirname, './dist'); // 输出路径

getApiNameList();
parseJSON(src);

// 獲取api協議名
function getApiNameList() {
  let apiNameRe = /createApiOpt\(\s*['"][a-zA-Z]+['"]\s*,\s*['"]([a-zA-Z]+)['"]/g;
  let fileData = fs.readFileSync(path.resolve(__dirname, './api.js'), { encoding: 'utf-8' }); // 保存读取的数据
  let apiNameExec = '';
  while (apiNameExec = apiNameRe.exec(fileData)) {
    let [src, apiName] = apiNameExec;
    apiList.push(apiName);
  }
}

// 轉換json
function parseJSON(src) {
  let protoRoot = new protobuf.Root();
  // 筛选proto文件
  let files = fs.readdirSync(src, { encoding: 'utf-8' }).filter(str => /\.ext\.proto$/.test(str));
  files.forEach(fileName => {
    let fileData = fs.readFileSync(path.resolve(src, fileName), { encoding: 'utf-8' }); // 保存读取的数据
    protobuf.parse(fileData, protoRoot);
  })
  fs.writeFileSync(`${src}/index.json`, JSON.stringify(parseData(protoRoot, apiList))); // 寫入json
}

function parseData (protoRoot, apiList) {
  let nestedJson = {
    nested: {},
    options: {}
  }; // 导出json
  let methodArr = {}; // 获取所有的服务
  for (let pkgName in protoRoot.nested) {
    let pkg = protoRoot.nested[pkgName];
    for (let key in pkg) {
      if (!pkg[key] || !pkg.hasOwnProperty(key) ) continue;
      if (pkg[key] && pkg[key].methods) { //  && pkg[key].constructor.className != 'Service'
        Object.assign(methodArr, pkg[key].methods);
      }
      if (!pkg[key].constructor.className) {
        console.log(key);
      }
    }
  }
  nestedJson.options = protoRoot.options;
  apiList.map(item => {
    let lookup = methodArr[item];
    if (!lookup) { 
      console.log(`未找到方法${item}`);
    }
    let {responseType, requestType, fullName} = lookup;
    let [pg, server, method] = fullName.slice(1).split('.');
    nestedJson.nested[pg] = nestedJson.nested[pg] || { nested: {} };
    nestedJson.nested[pg].nested[server] = nestedJson.nested[pg].nested[server] || { methods: {} };
    nestedJson.nested[pg].nested[server].methods[method] = lookup.toJSON();
    redirect(protoRoot, requestType, nestedJson);
    redirect(protoRoot, responseType, nestedJson);
  })
  extraList.forEach(item => {
    redirect(protoRoot, item, nestedJson);
  })
  return nestedJson
}

// 處理重定向的值
function redirect (protoRoot, key, json) {
  let lookup = protoRoot.lookup(key);
  let fullName = lookup.fullName;
  let [pg, mesName] = fullName.slice(1).split('.');
  json.nested[pg] = json.nested[pg] || { nested: {} };
  json.nested[pg].nested[mesName] = lookup.toJSON();
  if (lookup.fields) { // 消息體
    for (let field in lookup.fields) {
      if (!fieldtype.includes(lookup.fields[field].type)) {
        redirect(protoRoot, lookup.fields[field].type, json);
        console.log('--------', lookup.fields[field].type);
      }
    }
  } else if (lookup.values) { // 枚舉類型
  } else {
  }
}