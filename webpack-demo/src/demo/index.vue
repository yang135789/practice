<template>
  <div class="home">
    <mp3Play></mp3Play>
    <!-- <mp3Play1></mp3Play1> -->
    <div class="pathTest">
      <img src="./assets/image/29.jpg">
      <img src="/static/29.jpg">
      <img src="./assets/image/pause.png">
    </div>
  </div>
</template>
<script>
import mp3Play from './components/mp3Play'
// import mp3Play1 from './components/mp3Play1'
export default {
  components: {mp3Play},
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
  width: 500px;
  height: 300px;
  .pathTest {
    width: 300px;
    img {
      max-width: 100%;
    }
  }
  h1 {
    color: #bcad;
  }
  p {
    color: #deac;
  }
}
</style>