<template>
  <div class="game">
    <!-- 倒计时 -->
    <div class="countDown">
      <div class="num">{{ countDown.time }}S</div>
      <div class="bgBar">
        <div class="colorBar" ref="colorBar" :class="{play: isPlaying}" :style="{
          'transition-duration': `${ countDown.gameLength }s`
        }"></div>
      </div>
    </div>
    <!-- 游戏区 -->
    <div class="gameContent">
      <div class="fishRow" v-for="(item, row) in fishData" :key="row" :ref="`fish_${row}`">
        <div class="fish" v-for="(fish, cel) in item" :key="cel" @click="clickFish($event, item)"  :ref="`fish_${row}_${cel}`">
          <div class="img" v-show="!fishData.isDead">鱼</div>
        </div>
      </div>
      <div class="shell" :style="[{
        left: shellData.tagLeft,
        top: shellData.tagTop,
      }]" ref="shell"></div>
      <div class="battery"></div>
    </div>
    <button @click="start">开始</button>
    <button @click="stop">停止</button>
  </div>
</template>
<script>
export default {
  data () {
    return {
      fishData: [ // 鱼数据
        [{},{},{}],
        [{},{},{},{},{}],
        [{},{},{},{},{}, {}],
        [{},{},{},{},{}],
        [{},{},{},{},{}]
      ],
      countDown: {
        time: 20, // 倒计时
        gameLength: 10 // 游戏时长
      },
      isPlaying: false, // 游戏中
      shellData: { // 炮弹数据
        el: null,
        srcLeft: 0,
        srcTop: 0,
        tagTop: false,
        tagLeft: false,
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
      this.shellData.srcLeft = this.shellData.el.offsetLeft;
      this.shellData.srcTop = this.shellData.el.offsetTop;
      this.countDown.el = this.$refs.colorBar;
      this.countDown.srcWidth = this.countDown.el.offsetWidth;
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
    clickFish (e) { // 点击某只鱼
      // if (!this.isPlaying) return;
      this.shellData.el.style.display = 'block';
      let baseNum = 1000;
      let targetX = e.target.offsetLeft + e.target.offsetWidth / 2  ;
      let targetY = e.target.parentElement.offsetTop + e.target.parentElement.offsetHeight / 2 ;
      let moveTo = this.distanceToXY(targetX, targetY, baseNum); // 移动到固定距离位置
      this.forecastRoute(targetX, targetY, baseNum);
      this.shellData.tagTop = moveTo.y + 'px';
      this.shellData.tagLeft = moveTo.x + 'px';
      console.log(moveTo);
      setTimeout(() => {
        this.shellData.el.style.display = 'none';
        this.shellData.tagTop = this.shellData.srcTop + 'px';
        this.shellData.tagLeft = this.shellData.srcLeft + 'px';
      }, 2000)
    },
    start () {
      console.log(this.shellData.el.offsetLeft, this.shellData.el.offsetTop);
      this.isPlaying = true;
      this.playing();
    },
    playing () {
      if (!this.isPlaying) return;
      // 倒计时
      this.countDown.time = this.countDown.gameLength * this.countDown.el.offsetWidth / this.countDown.srcWidth;
      if (!this.countDown.time) {
        this.stop();
      }
      let curx = this.shellData.el.offsetLeft;
      let cury = this.shellData.el.offsetTop;
      console.log(curx,cury);
      this.animatonTimmer = requestAnimationFrame(this.playing);
    },
    stop () {
      this.isPlaying = false;
      cancelAnimationFrame(this.animatonTimmer);
      console.log('游戏结束！');
    },
    // 计算路线经过的鱼
    forecastRoute (ox1, oy1, length) {
     let coor = [];
      Array.from(new Array(length), (v, i) => {
        let {x: curx, y: cury} = this.distanceToXY (ox1, oy1, i);
        let atFish = this.fishDataList.filter(item => {
          let [x, y, x1, y1] = item.coordinate;
          return curx >= x && curx < x1 && cury > y && cury <= y1
        })
        if (atFish.length) {
          if (coor.indexOf(atFish[0]) === -1) {
            atFish[0].el.style.background = '#acd';
            coor.push(atFish[0]);
          }
        }
      })
      // this.$forceUpdate();
      console.log(coor);
    },
    // 根据距离求坐标点
    distanceToXY (ox1, oy1, length) {
      let ox = this.shellData.srcLeft;
      let oy = this.shellData.srcTop;
      let x = ox1 - ox;
      let y = oy1 - oy;
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
  .countDown {
    width: 750px;
    height: 50px;
    display: flex;
    align-items: center;
    .num {
      font-size: 24px;
      color: #666;
      width: 120px;
      text-align: center;
    }
    .bgBar {
      height: 30px;
      flex: 1;
      border-radius: 25px;
      background: cornflowerblue;
      overflow: hidden;
      .colorBar {
        height: 100%;
        width: 100%;
        background: #cea;
        &.play {
          transition: width 20s linear;
          width: 0;
        }
      }
    }
  }
  .gameContent {
    width: 750px;
    height: 900px;
    position: relative;
    .fishRow {
      height: 100px;
      width: 750px;
      display: flex;
      .fish {
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        .img {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: chocolate;
          display: flex;
          justify-content: center;
          align-items: center;
          color: #fff;
        }
      }
    }
    .shell {
      position: absolute;
      background:olive;
      border-radius: 50%;
      width: 10px;
      height: 10px;
      left: 50%;
      top: calc(100% - 25px);
      transform: translate(-50%, -50%);
      z-index: 1;
      transition: all 2s linear;
    }
    .battery {
      width: 50px;
      height: 50px;
      position: absolute;
      background: navajowhite;
      left: 50%;
      bottom: 0;
      transform: translate(-50%, 0);
      border-radius: 50px 50px 0 0;
    }
  }
}
</style>