
module.exports = parse;
parse.filename = null;

var tokenize = require('./tokenize.js');
// 正则
var base10Re    = /^[1-9][0-9]*$/,
    base10NegRe = /^-?[1-9][0-9]*$/,
    base16Re    = /^0[x][0-9a-fA-F]+$/,
    base16NegRe = /^-?0[x][0-9a-fA-F]+$/,
    base8Re     = /^0[0-7]+$/,
    base8NegRe  = /^-?0[0-7]+$/,
    numberRe    = /^(?![eE])[0-9]*(?:\.[0-9]*)?(?:[eE][+-]?[0-9]+)?$/,
    nameRe      = /^[a-zA-Z_][a-zA-Z_0-9]*$/,
    fqTypeRefRe = /^(?:\.[a-zA-Z_][a-zA-Z_0-9]*)+$/,
    typeRefRe = /^(?:\.?[a-zA-Z_][a-zA-Z_0-9]*)(?:\.[a-zA-Z_][a-zA-Z_0-9]*)*$/;

function parse(source, root = {nested: []}, filename) {

  let head = true,
    pkg,
    imports, // 引用文件数组
    weakImports, // 
    syntax, // 语法版本
    isProto3 = false;

  parse.filename = filename;


  var tn = tokenize(source),
    next = tn.next, // 跳到下一个非空字符
    push = tn.push,
    peek = tn.peek,
    skip = tn.skip,
    cmnt = tn.cmnt;

  var token;

  // 解析包名
  function parsePackage() {
  
    // 一个proto文件只允许一个package
    if (pkg !== undefined)
        throw illegal("package");
  
    pkg = next();
  
    // 包名格式不正确
    if (!typeRefRe.test(pkg))
        throw illegal(pkg, "name");
    // 没有加载过该包添加对象
    if (!root.nested[pkg]) {
      root.nested[pkg] = {};
    }
    // ptr = ptr.define(pkg);
    skip(";");
  }

  function readString() {
    var values = [],
        token;
    do {
        // 下个字符不是引号，就报错
        if ((token = next()) !== "\"" && token !== "'")
            throw illegal(token);
        values.push(next());
        skip(token);
        token = peek();
    } while (token === "\"" || token === "'");
    return values.join("");
  }

  // 解析引入的包
  function parseImport() {
    var token = peek();
    var whichImports; // 引入的包，数组
    switch (token) {
        case "weak":
            whichImports = weakImports || (weakImports = []);
            next();
            break;
        case "public":
            next();
            // eslint-disable-line no-fallthrough
        default:
            whichImports = imports || (imports = []);
            break;
    }
    token = readString(); // 引入包路径
    skip(";");
    whichImports.push(token);
  }

  // 解析语法版本
  function parseSyntax() {
    skip("=");
    syntax = readString();
    isProto3 = syntax === "proto3";

    /* istanbul ignore if */
    if (!isProto3 && syntax !== "proto2")
        throw illegal(syntax, "syntax");

    skip(";");
  }

   // 解析选项
  function parseOption(parent, token) {
    var isCustom = skip("(", true); // true未没找到则报错
  
    /* istanbul ignore if */
    if (!typeRefRe.test(token = next()))
        throw illegal(token, "name");
  
    var name = token;
    var option = name;
    var propName;
  
    if (isCustom) {
        skip(")");
        name = "(" + name + ")";
        option = name;
        token = peek();
        if (fqTypeRefRe.test(token)) {
            propName = token.substr(1); //remove '.' before property name
            name += token;
            next();
        }
    }
    skip("=");
    console.log(name,  option, propName);
    // var optionValue = parseOptionValue(parent, name);
    // setParsedOption(parent, option, optionValue, propName);
  }

  // 抛出错误
  function illegal(token, name, insideTryCatch = true) {
    var filename = parse.filename;
    if (!insideTryCatch)
        parse.filename = null;
    return Error("illegal " + (name || "token") + " '" + token + "' (" + (filename ? filename + ", " : "") + "line " + tn.line + ")");
  }

  while ((token = next()) !== null) {
    // console.log(token);
    switch (token) {
      case "package":
        // 非头部定义抛出错误
        if (!head)
          throw illegal(token);
        parsePackage();
        break;

        case "import":

          // 非头部定义抛出错误
          if (!head)
            throw illegal(token);

          parseImport();
          break;

        case "syntax":

          // 非头部定义抛出错误
          if (!head)
            throw illegal(token);

          parseSyntax();
          break;

        case "option":

          parseOption(root, token);
          skip(";");
          break;

        default:

      //     /* istanbul ignore else */
      //     if (parseCommon(ptr, token)) {
      //       head = false;
      //       continue;
      //     }

      //     /* istanbul ignore next */
      //     throw illegal(token);
    }
  }
}