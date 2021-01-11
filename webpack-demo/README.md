# webpack 搭建

## 使用的工具
```
webpack5 打包程序
babel7+corejs3 js兼容处理
sass style预处理
postcss css兼容处理
vue3 js框架
```
1. 初始化

``` 
  使用npm
  npm install
  使用yarn
  yarn
```

2. 命令
+ 本地开发
```
  使用npm
  npm run dev proj=项目名
  使用yarn
  yarn dev proj=项目名
  本地开发模式下浏览器输入http://127.0.0.1:8080/webpack-dev-server， 可查看文件结构
```
+ 打包
```
  使用npm
  npm run build proj=项目名
  使用yarn
  yarn build proj=项目名
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
┃   ┣── .babelrc babel配置文件，js兼容处理
┃   ┣── .postcssrc postcss配置文件，css兼容处理
┃   ┣── .browserslistrc browserslist配置文件，项目运行环境
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
webpack // 打包工具
webpack-cli // 脚手架
webpack-dev-server // 本地开发服务
html-webpack-plugin@next // html模板插件
mini-css-extract-plugin // 提取CSS到单独的文件
css-loader // 解析js中的css文件
style-loader // 将css文件用style标签插入html
url-loader // 
file-loader //
html-loader // 
sass-loader node-sass // sass文件解析
postcss postcss-loader // 样式兼容处理
postcss-preset-env // post预设环境
babel-loader @babel/core // js兼容处理
@babel/preset-env core-js //  babel预设环境，根据配置转换js， 按需加载需要用到corejs
vue@next // vue3
vue-loader@next @vue/compiler-sfc@next // vue文件解析 @vue/compiler-sfc需要vue的版本一致
copy-webpack-plugin // 文件複製插件
```

99. 問題處理
+ 安裝node-sass失敗
```
先卸載npm uninstall node-sass -D
在yarn add node-sass --dev
```
+ 遇到警告
```
[DEP_WEBPACK_COMPILATION_ASSETS] DeprecationWarning: Compilation.assets will be frozen in future, all modifications are deprecated.
Do changes to assets earlier, e. g. in Compilation.hooks.processAssets.
Make sure to select an appropriate stage from Compilation.PROCESS_ASSETS_STAGE_*
```
```
  安装html-webpack-plugin@next
```

+ 引入.vue模块报错
```
Module build failed (from ./node_modules/vue-loader/lib/index.js):
TypeError: Cannot read property 'parseComponent' of undefined
    at parse (F:\practice\webpack-demo\node_modules\@vue\component-compiler-utils\dist\parse.js:15:23)
    at Object.module.exports (F:\practice\webpack-demo\node_modules\vue-loader\lib\index.js:67:22)
```
```
升级vue-loader到最新版本
```
