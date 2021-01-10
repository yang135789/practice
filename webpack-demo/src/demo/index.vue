<template>
  <div class="home">
    <h1>h1{{ tag }}</h1>
    <p>p{{ tag }}</p>
  </div>
</template>

<script>
export default {
  data () {
    return {
      tag: '标签'
    }
  }
}
</script>

<style lang="scss" scoped>
.home {
  width: 500px;
  height: 300px;
  background: #adce;
  h1 {
    color: #bcad;
  }
  p {
    color: #deac;
  }
}
</style>