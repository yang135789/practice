<template>
  <div class="game">
    <div>{{ timeData.time }}</div>
    <canvas ref="canvas" @click="clickCanvas"></canvas>
    <div>
      <button @click="start">开始</button>
      <button @click="stop">停止</button>
    </div>
  </div>
</template>
<script>
export default {
  data () {
    return {
      imgs: {
        fish: ['1.png', '2.png', '3.png', '4.png', '5.png', '6.png', '7.png', '8.png'],
        bullet: ['bullet.png']
      },
      canvas: {
        el: null,
        ctx: null,
        width: this.toCurPX(750),
        height: this.toCurPX(800),
        runing: false
      },
      fishData: {
        height: this.toCurPX(100),
        matrix: [
          [{},{},{}],
          [{},{},{},{},{}],
          [{},{},{},{},{},{}],
          [{},{},{},{},{}],
          [{},{},{},{},{}],
        ],
        list: []
      },
      bulletData: {
        width: this.toCurPX(20),
        height: this.toCurPX(60),
        color: '#000',
        list: []
      },
      timeData: {
        timestamp: 0, // 保存时间戳
        runTime: 0, // 运行时间
        time: 20, // 倒计时
        gameLength: 20 // 游戏时长
      },
      gunData: { // 炮弹数据
        color: "#fac",
        height: this.toCurPX(60),
        width: this.toCurPX(20),
        centerX: 0, // 原坐标x
        centerY: 0, // 原坐标y
        targFishList: [], // 目标线上的鱼
        runing: false // 飞行中
      }
    }
  },
  computed: {
    },
  async mounted () {
    await this.loadImgs();
    this.$nextTick(() => {
      this.init();
    })
  },
  methods: {
    // 加载图片
    loadImgs () {
      return new Promise((res, rej) => {
        let count = 0;
        let total = 0;
        let errorImg = [];
        for (let key in this.imgs) {
          total += this.imgs[key].length;
          this.imgs[key].forEach((imgStr, index) => {
            let img = new Image();
            img.src = require(`../assets/image/${imgStr}`);
            img.onload = () => {
              count++;
              this.imgs[key][index] = img;
              if (count >= total) {
                res(errorImg);
                console.log('加载完成');
              }
            }
            img.onerror = () => {
              total --;
              errorImg.push(imgStr)
              if (count >= total) {
                res(errorImg);
                console.log('加载完成');
              }
            }
          })
        }
      })
    },
    toCurPX (px) { // 轉換為當前屏幕大小的像素
      return px / (1920 / 100) * (window.innerWidth / 100);
    },
    init () { // 初始化
      if (!this.canvas.el) {
        this.canvas.el = this.$refs.canvas;
        this.canvas.ctx = this.canvas.el.getContext('2d');
        this.canvas.el.width = this.canvas.width;
        this.canvas.el.height = this.canvas.height;
      }
      this.bulletData.list = [];
      this.initFish();
      this.initGun();
      this.draw();
    },
    // 初始化鱼数据
    initFish () {
      this.fishData.list = [];
      // 初始化矩阵数据
      this.fishData.matrix.forEach((fishRow, index) => {
        fishRow.forEach((fish, i) => {
          let r = 255 * Math.random();
          let g = 255 * Math.random();
          let b = 255 * Math.random();
          let a = Math.random();
          fish.row = index;
          fish.cel = i;
          fish.color = `rgba(${r},${g},${b},${a})`;
          // 宽高
          fish.height = this.fishData.height;
          fish.width = this.canvas.width / fishRow.length;
          // 左上角,右下角坐标
          fish.x = i * fish.width;
          fish.y = index * fish.height
          fish.x1 = (i + 1) * fish.width;
          fish.y1 = (index + 1) * fish.height;
          fish.coordinate = [fish.x, fish.y, fish.x1, fish.y1];
          // 中心点
          fish.centerX = fish.x + fish.width / 2;
          fish.centerY = fish.y + fish.height / 2;
          // 死亡
          fish.isDead = false;
          // 内容
          let itemImg = this.imgs.fish[index];
          // let itemHeight = 0.5 * fish.height;
          // let itemWidth = itemHeight / itemImg.height * itemImg.width;
          let itemWidth = 0.5 * fish.width;
          let itemHeight = itemWidth / itemImg.width * itemImg.height;
          let itemX = fish.centerX - itemWidth / 2;
          let itemY = fish.centerY - itemHeight / 2;
          let itemX1 = itemX + itemWidth;
          let itemY1 = itemY + itemHeight;
          fish.item = {
            img: itemImg,
            height: itemHeight,
            width: itemWidth,
            x: itemX,
            y: itemY,
            x1: itemX1,
            y1: itemY1,
            stepX: Math.random(),
            stepY: Math.random(),
            isPlay: false,
            play: () => {
              let item = fish.item;
              if (item.isPlay) return;
              // if (!(fish.row === 0 && fish.cel === 1)) return;
              item.isPlay = true;
              // item.x+=50;
              let timer = this.fps60Timer(() => {
                if (item.y1 + item.stepY > fish.y1 || item.y + item.stepY < fish.y) {
                  item.stepY = -item.stepY;
                }
                if (item.x1 + item.stepX > fish.x1 || item.x + item.stepX < fish.x) {
                  item.stepX = -item.stepX;
                }
                item.x+=item.stepX;
                item.x1+=item.stepX;
                item.y+=item.stepY;
                item.y1+=item.stepY;
                if (fish.isDead || !this.canvas.runing) {
                  clearInterval(timer)
                }
              }, 60)
            },
          }
          this.fishData.list.push(fish);
        })
      });
    },
    // 初始化枪数据
    initGun () {
      this.gunData.x = this.canvas.width / 2 - this.gunData.width / 2;
      this.gunData.y = this.canvas.height - this.gunData.height;
      this.gunData.img = this.imgs['bullet'][0];
      this.gunData.centerX = this.canvas.width / 2;
      this.gunData.centerY = this.canvas.height - this.gunData.height / 2;
    },
    // 60帧定时器
    fps60Timer (fn, fps = 60) {
      return setInterval(fn, 1000 / fps);
    },
    // 渲染画布
    draw (times) {
      this.canvas.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
      // this.canvas.ctx.fillStyle = 'rgba(255,255,255,0.3)';
      // this.canvas.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
      // 绘制枪
      this.canvas.ctx.fillStyle = this.gunData.color;
      this.canvas.ctx.fillRect(this.gunData.x, this.gunData.y, this.gunData.width, this.gunData.height);
      this.canvas.ctx.drawImage(this.gunData.img, this.gunData.x, this.gunData.y, this.gunData.width, this.gunData.height)
      // 绘制鱼
      this.fishData.list.forEach((fish, index) => {
        if (!fish.isDead) {
          this.canvas.ctx.fillStyle = fish.color;
          this.canvas.ctx.fillRect(fish.x, fish.y, fish.width, fish.height);
          // 渲染鱼图片
          this.canvas.ctx.drawImage(fish.item.img, fish.item.x, fish.item.y, fish.item.width, fish.item.height)
          times && fish.item.play()
        }
      });
      // 绘制子弹
      this.canvas.ctx.fillStyle = this.bulletData.color;
      this.bulletData.list.forEach(item => {
        this.canvas.ctx.save();
        this.canvas.ctx.translate(item.centerX, item.centerY);
        this.canvas.ctx.rotate(item.deg);
        this.canvas.ctx.drawImage(item.img, -this.bulletData.width / 2, -this.bulletData.height / 2, this.bulletData.width, this.bulletData.height);
        this.canvas.ctx.restore();
        // this.canvas.ctx.fillRect(item.x, item.y, this.bulletData.width, this.bulletData.height);
      })
      if (times) {
        // 记录时间戳
        if (!this.timeData.timestamp) this.timeData.timestamp = times;
        this.timeData.runTime = times - this.timeData.timestamp;
        this.timeData.time = Math.ceil(this.timeData.gameLength - this.timeData.runTime / 1000);
        this.canvas.animationFrame = requestAnimationFrame(this.draw);
        if (this.timeData.time <= 0) {
          this.stop()
        }
      }
    },
    // 获取坐标点上的鱼
    getXYofFish (x, y) {
      let atFish = this.fishData.list.filter(item => x >= item.x && x < item.x1 && y > item.y && y <= item.y1);
      return atFish.length ? atFish[0] : {};
    },
    // 点击画布
    clickCanvas (event) {
      if (!this.canvas.runing) return;
      // 子弹终点
      let bulletEnd = this.distanceToXY(event.offsetX, event.offsetY, this.canvas.height + 100);
      let bullet = this.createBullet(bulletEnd.x, bulletEnd.y);
      this.bulletData.list.push(bullet);
    },
    // 生成子弹
    createBullet (targX, targY) {
      // 在弹道上的鱼
      // let targetFish = this.getXYofFish(targX, targY);
      let routerFish = this.forecastRoute(targX, targY);
      
      let bullet = {
        centerX: this.gunData.centerX,
        centerY: this.gunData.centerY,
        x: this.gunData.centerX - this.bulletData.width / 2,
        y: this.gunData.centerY - this.bulletData.height / 2,
        x1: this.gunData.centerX + this.bulletData.width / 2,
        y1: this.gunData.centerY + this.bulletData.height / 2,
        targX: targX - this.bulletData.width / 2, // 目标坐标
        targY: targY - this.bulletData.height / 2,
        curX: this.gunData.centerX - this.bulletData.width / 2, // 当前坐标
        curY: this.gunData.centerY - this.bulletData.height,
        timmer: null,
        invalid: false, // 子弹失效
        fishList: routerFish, // 弹道上的鱼列表
        img: this.imgs['bullet'][0],
        deg: Math.atan2((targY - this.gunData.centerY), (targX - this.gunData.centerX)) + Math.PI / 2
      }
      console.log(bullet.deg);
      let s = 3; // 小球到终点所用时间
      let x = bullet.targX - bullet.x;
      let y = bullet.targY - bullet.y;
      // 每帧速度
      let stepX = x * 60 / (1000 * s);
      let stepY = y * 60 / (1000 * s);
      bullet.timmer = this.fps60Timer(() => {
        // 改变子弹坐标
        bullet.x += stepX;
        bullet.y += stepY;
        bullet.x1 += stepX;
        bullet.y1 += stepY;
        bullet.centerX += stepX;
        bullet.centerY += stepY;
        let overstepX = stepX >= 0 ? bullet.x >= bullet.targX : bullet.x <= bullet.targX;
        let overstepY = bullet.y <= bullet.targY;
        // 遍历经过哪些鱼，跳过打过的鱼
        for (let fish of routerFish) {
          if (this.rectCollision(bullet, fish) && !fish.isDead) {
              fish.isDead = true; // 鱼死亡
              bullet.invalid = true; // 让子弹失效
              console.log('死掉的鱼', fish);
              break;
          }
        }
        // 到达终点或打到鱼后消失
        if (overstepX && overstepY || bullet.invalid) {
          clearInterval(bullet.timmer);
          this.bulletData.list.splice(this.bulletData.list.indexOf(bullet), 1);
        }
      });
      return bullet;
    },
    // 计算在子弹路线上的鱼
    forecastRoute (targX, targY) {
      let length = Math.ceil(Math.sqrt(Math.pow(targX - this.gunData.centerX, 2) + Math.pow(targY - this.gunData.centerY, 2)));
      let fishList = [];
      Array.from(new Array(length), (v, i) => {
        let dot = this.distanceToXY(targX, targY, i);
        let x = dot.x - this.bulletData.width / 2;
        let y = dot.y - this.bulletData.height / 2;
        let x1 = x + this.bulletData.width;
        let y1 = y + this.bulletData.height;
        // this.canvas.ctx.fillRect(x1, y1, this.bulletData.width, this.bulletData.height);
        let atFish = this.fishData.list.filter(fish => {
          return this.rectCollision({x, y, x1, y1}, fish)
        })
        atFish.forEach(fish => {
          if (fishList.indexOf(fish) === -1) {
            fishList.push(fish);
          }
        })
      })
      console.log('弹道上的鱼', fishList)
      return fishList;
    },
    // 计算枪中心点到目标点间,
    distanceToXY (targX, targY, length) {
      let ox = this.gunData.centerX;
      let oy = this.gunData.centerY;
      let x = targX - this.gunData.centerX;
      let y = targY - this.gunData.centerY;
      let proportion = length / (Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)));
      let x1 = ox + x * proportion;
      let y1 = oy + y * proportion;
      return {x: x1, y: y1}
    },
    // 碰撞计算
    rectCollision (obj, obj1) {
      let x = Math.max.apply(null, [obj.x, obj1.x]) <= Math.min.apply(null, [obj.x1, obj1.x1]);
      let y = Math.max.apply(null, [obj.y, obj1.y]) <= Math.min.apply(null, [obj.y1, obj1.y1]);
      if (x && y) {
        return true
      }
      return false;
    },
    start () {
      this.canvas.runing = true;
      this.timeData.timestamp = 0;
      this.canvas.animationFrame = requestAnimationFrame(this.draw);
    },
    stop () {
      this.init();
      this.canvas.runing = false;
      this.timeData.time = 20;

      cancelAnimationFrame(this.canvas.animationFrame)
    }
  }
}
</script>
<style lang="scss" scoped>
.game {
  canvas {
    user-select: none;
    // width: 750px;
    // height: 800px;
  }
}
</style>