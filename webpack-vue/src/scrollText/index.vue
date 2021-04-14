<template>
  <div class="home">
    <router-view></router-view>
  </div>
</template>
<script>
export default {
  data () {
    return {
      tag: '标签a'
    }
  },
  computed: {
    test () {
      let a = {a: 1, b: 2, c: 3};
      let arr = Object.values(a);
      return arr;
    }
  },
  created () {
    // console.log(RUN_ENV, IS_PHONE);
  },
  mounted () {
    // console.log(window.vconsole, 1);
  },
  
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