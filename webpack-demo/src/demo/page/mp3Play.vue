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
    <div :class="[isPlay ? 'pause' : 'play']" @click="clickStart('start')"></div>
    <div class="playing"  :class="{run : browser.isIOS && isPlay}" ref="playing">
      <span
       class="playing__bar"
       v-for="i in length"
       :key="i"
       :class="['playing__bar' + i]"
       :style="{height: arr[i] && `${(arr[i] / 255)  * 100}%`}"
       ></span>
      <!-- <span class="playing__bar playing__bar1" :style="{height: arr[3] && `${(arr[3] / 255)  * 100}%`}"></span> -->
      <!-- <span class="playing__bar playing__bar2" :style="{height: arr[6] && `${(arr[6] / 255)  * 100}%`}"></span> -->
      <!-- <span class="playing__bar playing__bar3" :style="{height: arr[9] && `${(arr[9] / 255)  * 100}%`}"></span> -->
      <!-- <span class="playing__bar playing__bar4" :style="{height: arr[12] && `${(arr[12] / 255) * 100}%`}"></span> -->
      <!-- <span class="playing__bar playing__bar5" :style="{height: arr[15] && `${(arr[15] / 255) * 100}%`}"></span> -->
    </div>
    <div class="currentTime">
      <!-- <div class="bar" :style="{width: `${time / duration * 100}%`}"></div> -->
      {{ currentTime }}
    </div>
    <div class="tip" v-show="showTip">
      <span>点击听一下我的声音吧～</span>
    </div>
  </div>
</template>
<script>
import { Browser } from 'UTILS/arouse';
import axios from "axios";
export default {
  data () {
    return {
      // src: 'https://www.miyachat.com/resource/mp3/10441495.mp3',
      isPlay: false,
      audio: null,
      audioCtx: null,
      duration: 0,
      time: 0, // 播放時長
      length: 10,
      analyser: null,
      config: { attributes: true, childList: true, subtree: true },
      arr: new Array(16).fill(0),
      browser: Browser.getBrowser(), // 判斷瀏覽器
      index: 0,
      map3Buffer: null, // mp3數據
      showTip: true,
    }
  },
  mounted () {
    this.audio = this.$refs.audio;
  },
  computed: {
    src () {
      return `${location.origin}${location.pathname.replace('/index.html', '/')}static/浜口史郎 - ルフィ猛攻!.mp3?t=${window.timestamp}`
    },
    currentTime () {
      let ts = parseInt(this.time);
      let s = ts % 60;
      let m = Math.floor(ts / 60);
      return `${ m < 10 ? `0${ m }` : m }'${ s < 10 ? `0${ s }` : s }"`
      // return `${ m }'${ s }"`
    }
  },
  methods: {
    getAudioData () {
      axios({
        url: this.src,
        method: 'get',
        responseType:'arraybuffer'
      }).then(({data}) => {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftSize = 512 * 2;
        this.audioCtx.decodeAudioData(data, (buffer) => {
          this.map3Buffer = buffer;
          this.time = buffer.duration;
          this.duration = buffer.duration;
          this.clickStart();
          console.log(buffer);
          console.log('加載結束');
        }, function(e){"Error with decoding audio data" + e.err});
      })
    },
    changeStatus (val) {
      console.log(val)
      if (val === 'pause') {
        this.isPlay = false;
        // !this.browser.isIOS && cancelAnimationFrame(this.index);
      } else if (val === 'play') {
        this.duration = parseInt(this.audio.duration);
        this.isPlay = true;
        // if (!this.browser.isIOS && !this.audioCtx) {
        //   this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        //   let source = this.audioCtx.createMediaElementSource(this.audio);
        //   let gainNode = this.audioCtx.createGain();
        //   this.analyser = this.audioCtx.createAnalyser();
	      //   this.analyser.fftSize =  16 * 2;
        //   source.connect(gainNode); // 聲音控制
        //   source.connect(this.analyser);  // 可視化控制
        //   gainNode.connect(this.audioCtx.destination);
        //   console.log(this.analyser, this.audioCtx.createMediaElementSource, source);
        // }
    	  // !this.browser.isIOS && requestAnimationFrame(this.anime);
      } else if (val === 'start') {
        // AudioBufferSourceNode.loop = true;
        // this.isPlay ? this.audio.pause() : this.audio.play();
      } else {
      }
    },
    clickStart () {
      if (!this.map3Buffer) {
        this.getAudioData();
        return
      }
      if (this.isPlay) {
        this.isPlay = false;
        this.audioCtx.suspend(); // 繼續播放
        cancelAnimationFrame(this.index);
      } else {
        this.showTip = false;
        if (!this.AudioBufferSourceNode) {
          this.AudioBufferSourceNode = this.audioCtx.createBufferSource();
          this.AudioBufferSourceNode.onended = () => {
            console.log('結束播放');
            cancelAnimationFrame(this.index);
            this.audioCtx.suspend(); // 繼續播放
            this.AudioBufferSourceNode = null;
            this.isPlay = false;
          }
          let gainNode = this.audioCtx.createGain();
          this.AudioBufferSourceNode.buffer = this.map3Buffer;
          gainNode.connect(this.audioCtx.destination);
          this.AudioBufferSourceNode.connect(gainNode);
          this.AudioBufferSourceNode.connect(this.analyser);
          this.AudioBufferSourceNode.start(0);
        }
        this.audioCtx.resume();
        requestAnimationFrame(this.anime);
        console.log(this.AudioBufferSourceNode);
      }
    },
    // 播放時間改變時觸發
    timeupdate ({target}) {
      this.time = target.currentTime;
    },
    anime () {
      var arr = new Uint8Array(this.analyser.frequencyBinCount);
      var state = this.audioCtx.state;
      this.analyser.getByteFrequencyData(arr);
      this.arr = arr;
      this.time = this.duration - this.audioCtx.currentTime % this.duration;
      if (state === "running") {
        this.isPlay = true;
      } else {
        this.isPlay = false;
      }
      console.log(this.analyser)
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
  font-size: 32px;
  color: #fff;
  background: #6666;
  width: 372px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 50px;
  height: 76px;
  padding: 0 10px 0 0;
  background: linear-gradient(90deg,#ffa617 2%, #ffbb13);
  border-radius: 0 38px 38px 0;
  margin: 0 auto;
  position: relative;
  left: 10px;
  .play, .pause {
    height: 100px;
    width: 100px;
    margin-left: -50px;
  }
  .play {
    background: url(../img/play.png) no-repeat center / 100%;
  }
  .pause {
    background: url(../img/pause.png) no-repeat center / 100%;
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
    width: 200px;
    padding-left: 24px;
    height: 50px;
    border-radius: 1px;
    justify-content: space-between;
    // padding: 5px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    &.run .playing__bar {
      animation: up-and-down 1.6s linear infinite alternate;
    }
    .playing__bar {
      display: inline-block;
      background: white;
      // transition: height 50ms linear;
      width: 6px;
      height: 100%;
      border-radius: 3px;
      &:nth-of-type(5n - 4) {
        height: 20%;
      }
      &:nth-of-type(5n - 3) {
        height: 40%;
        animation-delay: -2.4s;
      }
      &:nth-of-type(5n - 2) {
        height: 65%;
        animation-delay: -3.6s;
      }
       &:nth-of-type(5n - 1) {
        height: 80%;
        animation-delay: -4.8s;
       }
       &:nth-of-type(5n) {
         height: 100%;
         animation-delay: -5s;
       }
      // &.playing__bar2 {
      //   height: 60%;
      //   animation-delay: -2.4s;
      // }
      // &.playing__bar3 {
      //   height: 75%;
      //   animation-delay: -3.6s;
      // }
      // &.playing__bar4 {
      //   animation-delay: -3.6s;
      // }
      // &.playing__bar5 {
      //   animation-delay: -4.8s;
      // }
      // &.playing__bar6 {
      //   animation-delay: -4.8s;
      // }
      // &.playing__bar7 {
      //   animation-delay: -5s;
      // }
      // &.playing__bar8 {
      //   animation-delay: -6.2s;
      // }
      // &.playing__bar9 {
      //   animation-delay: -7.4s;
      // }
      // &.playing__bar10 {
      //   animation-delay: -8.6s;
      // }
      // &.playing__bar1, &.playing__bar5 {
      //   height: 30%;
      // }
      // &.playing__bar2, &.playing__bar4 {
      //   height: 60%;
      //   animation-delay: -2.4s;
      // }
      // &.playing__bar3 {
      //   height: 75%;
      //   animation-delay: -3.6s;
      // }
    }
  }
  .tip {
    // height: 80px;
    width: auto;
    white-space: nowrap;
    word-break: normal;
    padding: 19px 24px;
    background: #FFFFFF;
    position: absolute;
    left: calc(50% - 40px);
    transform: translateX(-50%);
    top: 110px;
    border-radius: 12px 12px 12px 8px;
    &::before {
      content: '';
      position: absolute;
      height: 20px;
      width: 30px;
      top: -10px;
      left: calc(50% - 160px);
      background: #FFFFFF;
      clip-path: polygon(50% 0, 100% 100%, 0 100%);
    }
    span {
      color: #2B2B2B;
      font-size: 28px;
      white-space: nowrap;
    }
  }
}
</style>
