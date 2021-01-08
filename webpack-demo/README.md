# webpack 搭建

從零開始

1. 新建目錄並初始化package.json文件  

``` 
  npm init -y 
```

2. 安裝webpack和webpack-cli依賴以及webpack-dev-server开发环境工具
``` 
  yarn add webpack webpack-cli webpack-dev-server --dev
  
```

3. 项目结构
```
┏ root 根目录
┣━━ assets 所有项目公用文件夹
┃   ┣── components 公用组件
┃   ┣── font 字体文件
┃   ┣── style 公用样式
┃   ┣── libs js库
┃   ┗── utils 工具
┣━━ config 配置相关
┃   ┣── webpack.common.js webpack公用配置文件
┃   ┣── webpack.prod.js webpack生產配置文件
┃   ┗── webpack.dev.js webpack開發配置文件
┣━━ src 存放项目
┃   ┗── 项目文件夹
┃       ┣── assets 存放資源
┃       ┃   ┣── api 接口文件
┃       ┃   ┣── js js文件
┃       ┃   ┣── style 樣式
┃       ┃   ┗── images 圖片
┃       ┣── components 存放組件
┃       ┣── static 存放靜態資源
┃       ┣── store 存放狀態管理
┃       ┣── router  存放路由
┃       ┣── index.js 項目入口
┃       ┗── index.html html模板
┗━━ package.json 
```


4. 添加webpack配置文件
```
  webpack.dev.js
  webpack.prod.js
  webpack.common.js
```

5. 項目依赖
```
webpack 打包工具
webpack-cli 脚手架
webpack-dev-server 本地开发服务
html-webpack-plugin html模板插件
mini-css-extract-plugin 提取CSS到单独的文件
css-loader css文件解析
style-loader style解析
sass-loader node-sass sass文件解析
babel-loader @babel/core @babel/preset-env babel
```
  
6. 通過命令行啟動webpack  
在package.json裡的script添加啟動命令  
"build": "./node_modules/.bin/webpack -c config/webpack.prod.js --env NODE_ENV=prod"
"dev": "./node_modules/.bin/webpack serve -c config/webpack.dev.js --env NODE_ENV=local"
```
  ./node_modules/.bin/webpack 局部運行webpack的路徑
  serve 啟動本地開發, 需安裝webpack-dev-server, 沒有該參數默認打包
   -c config/webpack.dev.js 根據webpack配置文件打包
  --env NODE_ENV=local 環境變量
```

因為項目結構原因, 開發打包命令需要添加proj=項目名稱  
如: yarn dev proj=demo

99. 問題處理
`
安裝node-sass失敗
先卸載npm uninstall node-sass -D
在yarn add node-sass --dev
`