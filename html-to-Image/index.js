
// 將圖片轉為base64
function image2Base64(img) {
  var canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  var ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, img.width, img.height);
  var dataURL = canvas.toDataURL("image/png");
  return dataURL;
}

function createImageList(option) {
  let el = option.el;
  let images = option.images;
  let imgWidth = option.imgWidth || 200;
  var elWidth = el.offsetWidth;
  var colspanCount = parseInt(elWidth / imgWidth);
  console.log(el, elWidth, colspanCount)
  images.forEach(url => {
    var imageContainer = document.createElement("div");
    imageContainer.style.width = `max-content`;
    imageContainer.style.height = `max-content`;
    let img = new Image();
    img.src = url;
    img.width = imgWidth;
    img.onload = function () {
      // console.log(img.width, img.height);
      // imageContainer.style.height = `${Math.ceil(imgWidth / img.width * img.height)}px`
    };
    imageContainer.appendChild(img);
    el.appendChild(imageContainer);
  })
  console.log(option);
}