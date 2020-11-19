
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

// 獲取元素樣式
function getDomStyle (el) {
  let styleSheetList = window.getComputedStyle(el, null);
  let hasList = ['width','borderWidth','height','padding','paddingTop','paddingLeft','paddingRight','paddingBottom','margin','marginTop','marginLeft','marginRight','marginBottom'];
  let data = {};
  hasList.forEach(key => {
    data[key] = parseInt(styleSheetList[key]);
  })
  data.totalHeight = data.paddingTop + data.paddingBottom + data.marginTop + data.marginBottom + data.height + data.borderWidth * 2;
  data.totalWidth = data.paddingLeft + data.paddingRight + data.marginLeft + data.marginRight + data.width + data.borderWidth * 2;
  return data
}

function createImageList(option) {
  let el = option.el; // 父元素
  let rootStyle = {}; // 容器寬度
  let images = option.images; // 圖片列表
  let imgWidth = option.imgWidth || 200; // 圖片寬度
  let colspanCount =0; // 計算列數
  let imgHeightList = []; // 保存列高度
  let imgLoadList = []; // 保存圖片加載列表
  let loadImgIndex = 0;
  images.forEach(url => {
    let imgBox = document.createElement("div");
    let img = new Image();
    img.src = url;
    imgBox.style.position = 'absolute';
    imgBox.style.display = 'none';
    imgBox.appendChild(img);
    el.appendChild(imgBox);
    img.onload = function () {
      imgBox.style.height = Math.ceil(img.height / img.width * imgWidth) + "px";
      imgBox.style.width = imgWidth + "px";
      console.log(img.height, img.width);
      let imgBoxStyle = getDomStyle(imgBox); // 獲取圖片容器樣式
      if (!rootStyle.width) {
        rootStyle = getDomStyle(el);
        colspanCount = parseInt(rootStyle.width / imgBoxStyle.totalWidth);
      }
      if(loadImgIndex < colspanCount){ // 第一行
        imgHeightList.push(imgBoxStyle.totalHeight);
        imgBox.style.left = imgBoxStyle.totalWidth * loadImgIndex + "px";
      } else {
        var minIndex = imgHeightList.indexOf(Math.min.apply(null,imgHeightList)); // 獲取最小高度一列索引值
        imgBox.style.left = imgBoxStyle.totalWidth * minIndex + "px";
        imgBox.style.top = imgHeightList[minIndex] + "px";
        imgHeightList[minIndex] += imgBoxStyle.totalHeight;
      }
      imgLoadList.push({el: imgBox, style: imgBoxStyle});
      imgBox.style.display = 'block';
      el.style.height = Math.max.apply(null,imgHeightList) + 'px';
      loadImgIndex++;
    };
  })
}