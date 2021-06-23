<template>
  <canvas class="textStroke" :style="{width: `${width}px`}" ref="cvs"></canvas>
</template>
<script>
export default {
  props: {
    text: {
      default: '剩余: 19秒'
    },
    font: {
      default: () => ({
        size: 22,
        color: '#ffffff',
        borderWidth: 1,
        borderColor: '#9A5215',
      })
    }
  },
  data () {
    return {
      // font: {
      //   size: 24,
      //   color: '#ffffff',
      //   borderWidth: 1,
      //   borderColor: '#9A5215',
      //   // lineHeight: 100
      // },
      width: 0,
      cvs: null,
      ctx: null,
    }
  },
  mounted () {
    if (!this.ctx) {
      this.cvs = this.$refs.cvs;
      this.ctx = this.cvs.getContext('2d');
    }
    this.crateText();
  },
  methods: {
    toCurPX (px, isCvs = true) { // 轉換為當前屏幕大小的像素
      return px / (750 / 100) * (window.innerWidth / 100);
    },
    crateText () {
      this.ctx.clearRect(0,0,this.cvs.width,this.cvs.height);
      this.ctx.font = `bold ${this.toCurPX(this.font.size * window.devicePixelRatio)}px PingFang SC`;
      let measureText = this.ctx.measureText(this.text);
      this.cvs.width = measureText.actualBoundingBoxRight;
      this.width = this.toCurPX(measureText.actualBoundingBoxRight, false);
      this.cvs.height = (this.font.lineHeight || measureText.fontBoundingBoxAscent + measureText.fontBoundingBoxDescent) + this.toCurPX(this.font.borderWidth * 2);
      console.log(measureText, this.cvs.width, this.width);
      this.ctx.lineWidth = this.toCurPX(this.font.borderWidth);
      this.ctx.fillStyle = this.font.color;
      this.ctx.strokeStyle = this.font.borderColor;
      this.ctx.font = `bold ${this.toCurPX(this.font.size * window.devicePixelRatio)}px PingFang SC`;
      this.ctx.fillText(this.text, 0, measureText.fontBoundingBoxAscent);
      this.ctx.strokeText(this.text, 0, measureText.fontBoundingBoxAscent);
    }
  },
  watch: {
    text () {
      this.crateText();
    }
  }
}
</script>
<style lang="scss" scoped>
.textStroke {

}
</style>