<template>
  <div class="home">
    <mp3Play></mp3Play>
    <!-- <div><img src="./assets/image/29.jpg" alt=""></div> -->
  </div>
</template>
<script>
import mp3Play from './components/mp3Play'
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
  h1 {
    color: #bcad;
  }
  p {
    color: #deac;
  }
}
</style>