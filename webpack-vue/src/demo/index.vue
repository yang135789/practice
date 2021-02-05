<template>
  <div class="home">
    <router-view></router-view>
  </div>
</template>
<script>
export default {
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