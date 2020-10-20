let express = require('express');
let protobuf = require('protobufjs');
let app = express();
let Root = protobuf.Root;
let root = Root.fromJSON(require('./proto/index.json'));
// 編碼
function enCodeData(desction, data) {
  const dataDesction = root.lookupType(desction); // 要用來加密的消息
  const err = dataDesction.verify(data); // 校驗字段類型
  if (err) {
    console.log(err);
    return
  };
  const message = dataDesction.create(data); // 創建消息體
  const buffer = dataDesction.encode(message).finish(); // 加密
  return buffer;
}
// 解碼
function deCodeData(desction, data) {
  const dataDesction = root.lookupType(desction); // 要用來加密的消息
  const err = dataDesction.verify(data); // 校驗字段類型
  if (err) throw err;
  const json = dataDesction.decode(data).toJSON(); // 加密
  return json;
}

app.use(express.raw({ type: 'application/protobuf' })) // 自定義解析application/protobuf為二進制數據

app.all('*', function (req, res, next) {
  //设置允许跨域的域名，*代表允许任意域名跨域
  res.header("Access-Control-Allow-Origin", "*");
  //允许的header类型
  res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
  //跨域允许的请求方式 
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  // res.header("Content-Type", 'application/protobuf');
  next();
});

app.post('/', (req, res) => {
  req.accepts('application/protobuf')
  console.log(deCodeData('LoginReq', req.body));
  console.log(enCodeData('LoginRes', {province: 'va', city: 'cdacs', country: 'ccdace'}))
  res.end(enCodeData('LoginRes', {province: 'va', city: 'cdacs', country: 'ccdace'}));
})

app.listen(80, () => {
  console.log('localhost:80');
})