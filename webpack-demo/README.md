# webpack 搭建

1. 新建目錄並初始化package.json文件  

``` 
  npm init -y 
```

2. 安裝webpack和webpack-cli依賴
``` 
  yarn add webpack webpack-cli --save-de
  
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