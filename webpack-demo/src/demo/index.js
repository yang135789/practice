import './assets/style/index.scss';
function a () {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(this);
    })
  })
}
async function b () {
  let obj = await a();
  console.log(obj);
}

b();