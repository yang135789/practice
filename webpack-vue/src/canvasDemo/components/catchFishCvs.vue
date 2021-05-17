<template>
  <div class="game">
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
      canvas: {
        el: null,
        ctx: null,
        width: this.toCurPX(750),
        height: this.toCurPX(800),
        fishRowHeight: this.toCurPX(100),
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
        width: 10,
        height: 10,
        color: '#000',
        list: []
      },
      countDown: {
        time: 20, // 倒计时
        gameLength: 10 // 游戏时长
      },
      isPlaying: false, // 游戏中
      gunData: { // 炮弹数据
        el: null, // dom
        color: "#fac",
        height: this.toCurPX(100),
        width: this.toCurPX(100),
        centerX: 0, // 原坐标x
        centerY: 0, // 原坐标y
        targX: false, // 目标坐标y
        targY: false, // 目标坐标x
        targFishList: [], // 目标线上的鱼
        runing: false // 飞行中
      },
      animatonTimmer: null, // 动画定时器
    }
  },
  computed: {
  },
  mounted () {
    this.$nextTick(() => {
      this.init();
    })
  },
  methods: {
    toCurPX (px) { // 轉換為當前屏幕大小的像素
      return px / (1920 / 100) * (window.innerWidth / 100);
    },
    start () {
      this.draw();
    },
    init () { // 初始化
      if (!this.canvas.el) {
        this.canvas.el = this.$refs.canvas;
        this.canvas.ctx = this.canvas.el.getContext('2d');
        this.canvas.el.width = this.canvas.width;
        this.canvas.el.height = this.canvas.height;
      }
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
          this.fishData.list.push(fish);
        })
      });
      this.gunData.x = this.canvas.width / 2 - this.gunData.width / 2;
      this.gunData.y = this.canvas.height - this.gunData.height;
      this.gunData.centerX = this.canvas.width / 2;
      this.gunData.centerY = this.canvas.height - this.gunData.height / 2;
      // this.draw();
      console.log(this.canvas.ctx);
    },
    // 渲染画布
    draw () {
      this.canvas.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
      this.fishData.list.forEach((fish, index) => {
        if (!fish.isDead) {
          this.canvas.ctx.fillStyle = fish.color;
          this.canvas.ctx.fillRect(fish.x, fish.y, fish.width, fish.height);
        }
      });
      this.canvas.ctx.fillStyle = this.gunData.color;
      this.canvas.ctx.fillRect(this.gunData.x, this.gunData.y, this.gunData.width, this.gunData.height);
      this.canvas.ctx.fillStyle = this.bulletData.color;
      this.bulletData.list.forEach(item => {
        this.canvas.ctx.fillRect(item.curX, item.curY, this.bulletData.width, this.bulletData.height);
      })
      this.canvas.animationFrame = requestAnimationFrame(this.draw);
    },
    // 获取坐标点上的鱼
    getXYofFish (x, y) {
      let atFish = this.fishData.list.filter(item => x >= item.x && x < item.x1 && y > item.y && y <= item.y1);
      return atFish.length ? atFish[0] : {};
    },
    // 点击画布
    clickCanvas (event) {
      let targetFish = this.getXYofFish(event.offsetX, event.offsetY);
      let road = this.distanceToXY(event.offsetX, event.offsetY, this.canvas.height + 200);
      let routerFish = this.forecastRoute(event.offsetX, event.offsetY);
      this.bulletData.list.push(this.createBullet(road.x, road.y))
      // this.draw();
      this.canvas.ctx.beginPath();
      this.canvas.ctx.moveTo(this.gunData.centerX, this.gunData.centerY);
      this.canvas.ctx.lineTo(road.x, road.y);
      this.canvas.ctx.stroke();
      ;
      // console.log(event.offsetX, event.offsetY, targetFish, routerFish);
    },
    // 生成子弹
    createBullet (targX, targY) {
      let bullet = {
        targX: targX - this.bulletData.width / 2,
        targY: targY + this.bulletData.height / 2,
        curX: this.gunData.centerX - this.bulletData.width / 2,
        curY: this.gunData.centerY - this.bulletData.height,
        show: true,
        timmer: null
      }
      let x = bullet.targX - bullet.curX;
      let y = bullet.targY - bullet.curY;
      let stepX = x * 60 / (1000 * 3);
      let stepY = y * 60 / (1000 * 3);
      bullet.timmer = setInterval(() => {
        bullet.curX += stepX;
        bullet.curY += stepY;
        let overstepX = stepX >= 0 ? bullet.curX >= bullet.targX : bullet.curX <= bullet.targX;
        let overstepY = bullet.curY <= bullet.targY;
        // console.log([x * 60 / 1000, y * 60 / 1000], [bullet.curX, bullet.curY], [bullet.targX, bullet.targY]);
        if (overstepX && overstepY) {
          clearInterval(bullet.timmer);
          this.bulletData.list.splice(this.bulletData.list.indexOf(bullet), 1);
        }
      }, 1000 / 60);
      return bullet;
    },
    // 计算路线经过的鱼
    forecastRoute (ox1, oy1) {
      let x = ox1 - this.gunData.centerX;
      let y = oy1 - this.gunData.centerY;
      let length = Math.ceil(Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)));
      let fishList = [];
      Array.from(new Array(length), (v, i) => {
        let {x: curx, y: cury} = this.distanceToXY(ox1, oy1, i);
        let atFish = this.fishData.list.filter(item => {
          let [x, y, x1, y1] = item.coordinate;
          return curx >= x && curx < x1 && cury > y && cury <= y1
        })
        if (atFish.length) {
          if (fishList.indexOf(atFish[0]) === -1) {
            fishList.push(atFish[0]);
          }
        }
      })
      return fishList;
    },
    // 根据距离求坐标点
    distanceToXY (ox1, oy1, length) {
      let ox = this.gunData.centerX;
      let oy = this.gunData.centerY;
      let x = ox1 - this.gunData.centerX;
      let y = oy1 - this.gunData.centerY;
      let proportion = length / (Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)));
      let x1 = ox + x * proportion;
      let y1 = oy + y * proportion;
      return {x: x1, y: y1}
    }
  }
}
</script>
<style lang="scss" scoped>
.game {
  canvas {
    // width: 750px;
    // height: 800px;
  }
}
</style>