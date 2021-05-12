<template>
  <div class="game">
    <div class="gameContent">
      <div class="fishRow" v-for="(item, index) in fishData" :key="index">
        <div class="fish" v-for="(fish, i) in item" :key="i" @click="clickFish">
          <div class="img"></div>
        </div>
      </div>
      <div class="shell" :style="[{
        left: shellData.tagLeft,
        top: shellData.tagTop,
      }]" ref="shell"></div>
      <div class="battery"></div>
    </div>
  </div>
</template>
<script>
export default {
  data () {
    return {
      fishData: [
        [{},{},{}],
        [{},{},{},{},{}],
        [{},{},{},{},{}, {}],
        [{},{},{},{},{}],
        [{},{},{},{},{}],
      ],
      shellData: {
        el: null,
        srcLeft: 0,
        srcTop: 0,
        tagTop: false,
        tagLeft: false,
      }
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.render();
    })
  },
  methods: {
    render () {
      this.shellData.el = this.$refs.shell;
      this.shellData.srcLeft = this.shellData.el.offsetLeft;
      this.shellData.srcTop = this.shellData.el.offsetTop;
    },
    clickFish (e) {
      this.shellData.el.style.display = 'block';
      let shellX = this.shellData.el.offsetLeft + this.shellData.el.offsetWidth / 2;
      let shellY = this.shellData.el.offsetTop + this.shellData.el.offsetHeight / 2;
      let baseNum = 1000;
      let top = e.target.parentElement.offsetTop + e.target.parentElement.offsetHeight / 2 + this.shellData.el.offsetHeight / 2;
      let left =  e.target.offsetLeft + e.target.offsetWidth / 2  + this.shellData.el.offsetWidth / 2;
      let proportion = baseNum / (Math.sqrt(Math.pow(left - shellX, 2) + Math.pow(top - shellY, 2)));
      let top1 = shellY + (top - shellY) * proportion;
      let left1 = shellX + (left - shellX) * proportion;
      this.shellData.tagTop = top1 + 'px';
      this.shellData.tagLeft = left1 + 'px';
      setTimeout(() => {
        this.shellData.el.style.display = 'none';
        this.shellData.tagTop = this.shellData.srcTop + 'px';
        this.shellData.tagLeft = this.shellData.srcLeft + 'px';
      }, 1000)
      console.log([shellX, shellY], [left, top], [left1, top1]);
    }
  }
}
</script>
<style lang="scss" scoped>
.game {
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
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        .img {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: chocolate;
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
      transition: all 1s linear;
    }
    .battery {
      width: 50px;
      height: 50px;
      position: absolute;
      background: navajowhite;
      left: 50%;
      bottom: 0;
      transform: translate(-50%, 0);
    }
  }
}
</style>