import { createApp } from 'vue';
import index from './index.vue';

let app = createApp(index).mount('#app');
console.log(app);
// function a () {
//   return new Promise((resolve, reject) => {
//     setTimeout(() => {
//       resolve(this);
//     })
//   })
// }
// async function b () {
//   let obj = await a();
//   console.log(obj);
// }

// b();

// let c = {};

// c?.b?.a ?? console.log(a);

let obj = {a: 1}; 
console.log(Object.values(obj));