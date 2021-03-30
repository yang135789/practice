import { createApp } from 'vue';
import index from './index.vue';
import store from '@src/store'
import router from '@src/router'
import '@src/assets/style/index.scss'

if (!window.eruda && RUN_ENV === 'local' && IS_PHONE) {
  let debugToolsSrc = 'https://cdnjs.cloudflare.com/ajax/libs/eruda/2.4.1/eruda.min.js'
  let debugToolsDom = document.createElement('script')
  debugToolsDom.src = debugToolsSrc;
  document.body.append(debugToolsDom);
  debugToolsDom.onload = () => {
    eruda.init();
  }
}

let app = createApp(index); 
app.use(store); // 使用状态管理
app.use(router); // 使用路由管理
app.mount('#app'); // 只能在use之后使用