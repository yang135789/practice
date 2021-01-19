// import _ from 'lodash';
import '../css/page.css';
// import '../image/id=22631188 (しる).jpg'
function component() {
    var element = document.createElement('div');
  
    // Lodash（目前通过一个 script 脚本引入）对于执行这一行是必需的
    // element.innerHTML = _.join(['你好', 'webpack'], ' ');
    // element.innerHTML = "hello webpack"
    return element;
  }
  
  document.body.appendChild(component());