<template>
  <div class='audioPlayer'>
    <div class="visualization">
      <!-- <canvas ref="canvas"></canvas> -->
      <div class="bar" v-for="(n,i) in arr" :key="i" :style="{height: `${(n / 255) * 100}%`}" ></div>
    </div>
    <div class="ctrl">
      <div  :class="[isPlay ? 'pause' : 'play']" @click="clickStart('start')"></div>
      <div class="time">{{ currentTime }}</div>
      <div class="timeBar">
        <div class="timeBarLength" :style="{width: `${time / duration * 100}%`}"></div>
      </div>
    </div>
  </div>
</template>
<script>
// 通过ajax请求音频,使用js来播放音频, iOS可以使用, 缺点: 不能边缓存边播
export default {
  data () {
    return {
      isPlay: false, // 正在播放
      audio: null,
      audioCtx: null,
      duration: 0,
      time:  0, // 播放時長
      length: 20,
      analyser: null,
      config: { attributes: true, childList: true, subtree: true },
      arr: new Array(16).fill(),
      // browser: Browser.getBrowser(), // 判斷瀏覽器
      index: 0,
      map3Buffer: null, // mp3數據
      showTip: true,
      isLoading: false, // 加載動畫
    }
  },
  mounted () {
  },
  computed: {
    src () {
      // return `${location.origin}${location.pathname.replace('/index.html', '/')}static/光良 - 童话.mp3?t=${window.timestamp}`
      // return `${location.origin}${location.pathname.replace('/index.html', '/')}static/麦振鸿 - 莫失莫忘(逍遥叹 演奏曲).mp3?t=${window.timestamp}`
      return `${location.origin}${location.pathname.replace('/index.html', '/')}static/Lupins.mp3?t=${window.timestamp}`
    },
    // 当前播放时间
    currentTime () {
      let ts = parseInt(this.time);
      let s = ts % 60;
      let m = Math.floor(ts / 60);
      return `${ m < 10 ? `0${ m }` : m }'${ s < 10 ? `0${ s }` : s }"`
    }
  },
  methods: {
    // 封裝ajax
    ajax (options) { // ajax方法
      return new Promise(function (resolve, reject) {
        let url = options.url || 'http://localhost:80/';
        let type = options.type || 'get';
        let data = options.data || null;
        let xhr = new XMLHttpRequest();
        xhr.onload = function () {
          resolve(xhr.response);
        };
        xhr.onerror = function (err) {
          reject({status: xhr.status, des: xhr.response})
        }
        xhr.open(type, url);
        options.headers && Object.keys(options.headers).forEach(key => {
          xhr.setRequestHeader(key, options.headers[key]);
        })
        options.responseType && (xhr.responseType = options.responseType)
        xhr.send(data);
      })
    },
    // 获取音乐数据
    getAudioData () {
      this.isLoading = true;
      this.ajax({
        url: this.src,
        responseType:'arraybuffer'
      }).then((data) => {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftSize = 512 * 2 / 4;
        this.audioCtx.decodeAudioData(data, (buffer) => {
          this.map3Buffer = buffer;
          this.duration = Math.round(buffer.duration);
          this.time = this.duration;
          this.isLoading = false;
          this.clickStart();
          console.log('加載結束');
        }, function(e){"Error with decoding audio data" + e.err});
      }).catch(err => {
        console.log('獲取音頻失敗!', err);
      })
    },
    clickStart () {
      if (!this.map3Buffer) { // 如果沒有音樂
        this.isLoading || this.getAudioData(); // 獲取音樂數據
        return
      }
      if (this.isPlay) { // 正在播放
        this.isPlay = false; // 修改播放狀態
        this.audioCtx.suspend(); // 暫停
        cancelAnimationFrame(this.index); // 清楚動畫定時器
      } else {
        this.showTip = false;
        if (!this.AudioBufferSourceNode) { // 
          this.AudioBufferSourceNode = this.audioCtx.createBufferSource();
          this.AudioBufferSourceNode.onended = () => { // 音樂播放結束觸發
            console.log('結束播放');
            cancelAnimationFrame(this.index); // 清除動畫定時器
            this.arr = new Array(16).fill();
            this.audioCtx.suspend(); // 暫停
            this.time = this.duration;
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
        requestAnimationFrame(this.visualization);
        console.log(this.AudioBufferSourceNode);
      }
    },
    // 播放時間改變時觸發
    timeupdate ({target}) {
      this.time = target.currentTime;
    },
    // 获取可视化数据并渲染
    visualization () {
      var arr = new Uint8Array(this.analyser.frequencyBinCount);
      var state = this.audioCtx.state;
      this.analyser.getByteFrequencyData(arr);
      this.arr = arr;
      // this.time = this.duration - this.audioCtx.currentTime % this.duration;
      this.time = this.audioCtx.currentTime % this.duration;
      if (state === "running") {
        this.isPlay = true;
      } else {
        this.isPlay = false;
      }
	    this.index = requestAnimationFrame(this.visualization);
    }
  },
}
</script>
<style lang='scss' scoped>
.audioPlayer {
  width: 100%;
  height: 100%;
  .visualization {
    width: 100%;
    height: calc(100% - 100px);
    background: url('../static/29.jpg') no-repeat top / cover;
    display: flex;
    justify-content: space-around;
    align-items: flex-end;
    .bar {
      width: 10px;
      transition: height 100ms;
      // height: 100%;
      background: linear-gradient(0deg, #d2f53662, #75fcb896, #e999,#fff9);
      // background: rgba(117, 252, 184, 0.589);
    }
  }
  .ctrl {
    height: 100px;
    width: 100%;
    background: turquoise;
    display: flex;
    align-items: center;
    justify-content: space-around;
    .play, .pause {
      height: 100px;
      width: 100px;
    }
    .play {
      background: url(@src/assets/image/play.png) no-repeat center / 100%;
    }
    .pause {
      background: url(@src/assets/image/pause.png) no-repeat center / 100%;
    }
    .time {
      color: #fff;
      font-size: 30px;
    }
    .timeBar {
      width: 50%;
      height: 10px;
      background: cornflowerblue;
      .timeBarLength {
        height: 100%;
        width: 0;
        background: crimson;
      }
    }
  }
}
</style>
