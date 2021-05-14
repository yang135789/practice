<template>
  <div class="game">
    <canvas ref="canvas"></canvas>
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
      fishData: [ // 鱼数据
        [{},{},{}],
        [{},{},{},{},{}],
        [{},{},{},{},{},{}],
        [{},{},{},{},{}],
        [{},{},{},{},{}],
        // [{}],
      ],
      countDown: {
        time: 20, // 倒计时
        gameLength: 10 // 游戏时长
      },
      isPlaying: false, // 游戏中
      shellData: { // 炮弹数据
        el: null, // dom
        origX: 0, // 原坐标x
        origY: 0, // 原坐标y
        targX: false, // 目标坐标y
        targY: false, // 目标坐标x
        targFishList: [], // 目标线上的鱼
        runing: false // 飞行中
      },
      animatonTimmer: null, // 动画定时器
    }
  },
  computed: {
    fishDataList () {
      let arr = [];
      this.fishData.forEach(item => {
        arr.push(...item)
      })
      return arr
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.init();
    })
  },
  methods: {
    init () { // 初始化
      this.shellData.el = this.$refs.shell;
      this.shellData.origX = this.shellData.el.offsetLeft;
      this.shellData.origY = this.shellData.el.offsetTop;
      this.countDown.el = this.$refs.colorBar;
      this.countDown.origWidth = this.countDown.el.offsetWidth;
      this.coordinate = [];

      this.fishData.forEach((item, row) => {
        let rowEl = this.$refs[`fish_${row}`];
        item.forEach((fish, cel) => {
          let fishEl = this.$refs[`fish_${row}_${cel}`];
          fish.el = fishEl;
          fish.width = fishEl.offsetWidth;
          fish.height = fishEl.offsetHeight;
          fish.coordinate = [
            fishEl.offsetLeft,
            rowEl.offsetTop,
            fishEl.offsetLeft + fishEl.offsetWidth,
            rowEl.offsetTop + rowEl.offsetHeight,
          ];
          fish.isDead = false;
        })
      });
    },
    clickFish (e, data) { // 点击某只鱼
      if (!this.isPlaying) return;
      if (data.isDead) return;
      if (this.shellData.runing) return;
      this.shellData.el.style.display = 'block';
      let baseNum = 1000;
      let targX = e.target.offsetLeft + e.target.offsetWidth / 2  ;
      let targY = e.target.parentElement.offsetTop + e.target.parentElement.offsetHeight / 2 ;
      let moveTo = this.distanceToXY(targX, targY, baseNum); // 移动到固定距离位置
      this.shellData.targX = moveTo.x + 'px';
      this.shellData.targY = moveTo.y + 'px';
      this.shellData.runing = true;
      this.shellData.targFishList = this.forecastRoute(targX, targY);
      console.log(moveTo, this.shellData.targFishList);
    },
    start () {
      console.log(this.shellData.el.offsetLeft, this.shellData.el.offsetTop);
      this.isPlaying = true;
      this.playing();
    },
    playing () {
      if (!this.isPlaying) return;
      // 倒计时
      this.countDown.time = this.countDown.gameLength * this.countDown.el.offsetWidth / this.countDown.origWidth;
      // 倒计时结束
      if (!this.countDown.time) {
        this.stop();
      }
      let curx = this.shellData.el.offsetLeft;
      let cury = this.shellData.el.offsetTop;
      if (curx === 0 && cury === 0) {

      }
       // 遍历经过哪些鱼，跳过打过的鱼
      for (let fish of this.shellData.targFishList) {
        let [x, y, x1, y1] = fish.coordinate;
        if (curx >= x && curx <= x1 && cury >= y && cury <= y1 && !fish.isDead && this.shellData.runing) {
            console.log('----', this.shellData.targFishList);
            console.log(curx,  cury);
            fish.isDead = true;
            fish.el.children[0].style.display = 'none';
          // setTimeout(() => {
            this.shellData.targX = this.shellData.origX + 'px';
            this.shellData.targY = this.shellData.origY + 'px';
            this.shellData.el.style.display = 'none';
            this.shellData.runing = false;
          // }, 2000)
          break;
        }
      }
      // console.log(curx,cury);
      this.animatonTimmer = requestAnimationFrame(this.playing);
    },
    stop () { // 游戏借宿
      this.isPlaying = false;
      cancelAnimationFrame(this.animatonTimmer);
      this.shellData.runing = false;
      this.shellData.el.style.display = 'none';
      this.shellData.targX = this.shellData.origX + 'px';
      this.shellData.targY = this.shellData.origY + 'px';
      console.log('游戏结束！');
    },
    // 计算路线经过的鱼
    forecastRoute (ox1, oy1) {
      let x = ox1 - this.shellData.origX;
      let y = oy1 - this.shellData.origY;
      let length = Math.ceil(Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)));
      let fishList = [];
      Array.from(new Array(length), (v, i) => {
        let {x: curx, y: cury} = this.distanceToXY (ox1, oy1, i);
        let atFish = this.fishDataList.filter(item => {
          let [x, y, x1, y1] = item.coordinate;
          return curx >= x && curx < x1 && cury > y && cury <= y1
        })
        if (atFish.length) {
          if (fishList.indexOf(atFish[0]) === -1) {
            atFish[0].el.style.background = "#adc"
            fishList.push(atFish[0]);
          }
        }
      })
      return fishList;
    },
    // 根据距离求坐标点
    distanceToXY (ox1, oy1, length) {
      let ox = this.shellData.origX;
      let oy = this.shellData.origY;
      let x = ox1 - this.shellData.origX;
      let y = oy1 - this.shellData.origY;
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
    width: 750px;
    height: 800px;
    background: #cad;
  }
}
</style>