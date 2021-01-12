<template>
  <div class="home">
    <div class="pathTest">
      <img src="./assets/image/29.jpg">
    </div>
    <mp3PlayToAudioTag></mp3PlayToAudioTag>
    <div class="pathTest">
      <img src="/static/29.jpg">
    </div>
    <mp3PlayToAudioJs></mp3PlayToAudioJs>
  </div>
</template>
<script>
import mp3PlayToAudioTag from './components/mp3PlayToAudioTag'
import mp3PlayToAudioJs from './components/mp3PlayToAudioJs'
export default {
  components: {mp3PlayToAudioTag, mp3PlayToAudioJs},
  data () {
    return {
      tag: '标签'
    }
  },
  computed: {
    test () {
      let a = {a: 1, b: 2, c: 3};
      let arr = Object.values(a);
      return arr;
    }
  },
  mounted () {

  }
}
</script>

<style lang="scss" scoped>
.home {
  .pathTest {
    width: 300px;
    margin-bottom: 20px;
    img {
      max-width: 100%;
    }
  }
}
</style>