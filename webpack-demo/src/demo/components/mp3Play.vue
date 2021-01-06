<template>
  <div class='mp3Play'>
    <audio
      ref="audio"
      :src="src"
      v-show="false" 
      @pause="changeStatus('pause')"
      @play="changeStatus('play')"
      @timeupdate="timeupdate"
      webkit-playsinline playsinline
    ></audio>
    <div :class="[isPlay ? 'pause' : 'play']" @click="changeStatus('start')"></div>
    <div class="currentTime">
      <div class="bar" :style="{width: `${time / duration * 100}%`}"></div>
      {{ currentTime }}
      </div>
    <div class="playing"  :class="{run : browser.isIOS && isPlay}" ref="playing">
      <span class="playing__bar playing__bar1" :style="{height: arr[3] && `${(arr[3] / 255)  * 100}%`}"></span>
      <span class="playing__bar playing__bar2" :style="{height: arr[6] && `${(arr[6] / 255)  * 100}%`}"></span>
      <span class="playing__bar playing__bar3" :style="{height: arr[9] && `${(arr[9] / 255)  * 100}%`}"></span>
      <span class="playing__bar playing__bar4" :style="{height: arr[12] && `${(arr[12] / 255) * 100}%`}"></span>
      <span class="playing__bar playing__bar5" :style="{height: arr[15] && `${(arr[15] / 255) * 100}%`}"></span>
    </div>
  </div>
</template>
<script>
import { Browser } from 'UTILS/arouse'
export default {
  data () {
    return {
      // src: 'https://www.miyachat.com/resource/mp3/10441495.mp3',
      isPlay: false,
      audio: null,
      audioCtx: null,
      duration: 0,
      time: 0,
      analyser: null,
      config: { attributes: true, childList: true, subtree: true },
      arr: [],
      browser: Browser.getBrowser(), // 判斷瀏覽器
      index: 0
    }
  },
  mounted () {
    this.audio = this.$refs.audio;
  },
  computed: {
    src () {
      return `${location.origin}${location.pathname.replace('/index.html', '/')}static/Lupins.mp3?t=${window.timestamp}`
    },
    currentTime () {
      let ts = parseInt(this.time);
      let s = ts % 60;
      let m = Math.floor(ts / 60);
      return `${ m < 10 ? `0${ m }` : m }"${ s < 10 ? `0${ s }` : s }`
    }
  },
  methods: {
    changeStatus (val) {
      console.log(val)
      if (val === 'pause') {
        this.isPlay = false;
        !this.browser.isIOS && cancelAnimationFrame(this.index);
      } else if (val === 'play') {
        this.duration = parseInt(this.audio.duration);
        this.isPlay = true;
        console.log(!this.browser.isIOS && !this.audioCtx);
        if (!this.browser.isIOS && !this.audioCtx) {
          this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          let source = this.audioCtx.createMediaElementSource(this.audio);
          let gainNode = this.audioCtx.createGain();
          this.analyser = this.audioCtx.createAnalyser();
	        this.analyser.fftSize =  16 * 2;
          source.connect(gainNode); // 聲音控制
          source.connect(this.analyser);  // 可視化控制
          gainNode.connect(this.audioCtx.destination);
          console.log(this.analyser, this.audioCtx.createMediaElementSource, source);
        }
    	  !this.browser.isIOS && requestAnimationFrame(this.anime);
      } else if (val === 'start') {
        this.isPlay ? this.audio.pause() : this.audio.play();
      } else {
      }
    },
    // 播放時間改變時觸發
    timeupdate ({target}) {
      this.time = target.currentTime;
    },
    anime () {
      var arr = new Uint8Array(this.analyser.frequencyBinCount);
      this.analyser.getByteFrequencyData(arr);
      this.arr = arr;
      this.isPlay 
	    this.index = requestAnimationFrame(this.anime);
    }
  },
}
</script>
<style lang='scss' scoped>

@keyframes up-and-down {
  10% {
    height: 30%;
  }
  30% {
    height: 100%;
  }
  60% {
    height: 50%;
  }
  80% {
    height: 75%;
  }
  100% {
    height: 20%;
  }
}
.mp3Play {
  font-size: 28px;
  color: #fff;
  background: #6666;
  width: 500px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 50px;
  height: 50px;
  padding: 0 10px 0 5px;
  margin: 0 auto 20px;
  .play {
    width: 40px;
    height: 40px;
    background: #fff;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    &:after {
      content: '';
      margin-left: 5px;
      width: 20px;
      height: 30px;
      display: block;
      background: #000;
      clip-path: polygon(0% 0%, 0% 100%, 100% 50%);
      // border-color: transparent transparent transparent #000;
    }
  }
  .pause {
    height:   40px;
    width: 40px;
    background: #fff;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    &:after, &:before {
      content: '';
      display: inline-block;
      height: 25px;
      width: 10px;
      background: #000;
    }
    &:after {
      margin-left: 5px;
    }
  }
  .currentTime {
    flex: 1;
    text-align: right;
    margin: 0 20px;
    position: relative;
    z-index: 0;
    .bar {
      content: '';
      position: absolute;
      z-index: -1;
      height: 100%;
      width: 0%;
      left: 0;
      top: 0;
      background: linear-gradient(to right, #cad, #eda, #ade) no-repeat center left / 750px 100%;
    }
  }
  .playing {
    // background: rgba(255, 255, 255, 0.1);
    width: 50px;
    height: 50px;
    border-radius: 1px;
    justify-content: space-between;
    padding: 5px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    &.run .playing__bar {
      animation: up-and-down 1.3s ease infinite alternate;
    }
    .playing__bar {
      display: inline-block;
      background: white;
      transition: height 0.1s;
      width: 5px;
      height: 100%;
      &.playing__bar1, &.playing__bar5 {
        height: 30%;
      }
      &.playing__bar2, &.playing__bar4 {
        height: 60%;
        animation-delay: -2.4s;
      }
      &.playing__bar3 {
        height: 75%;
        animation-delay: -3.6s;
      }
    }
  }
}
</style>
