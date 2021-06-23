<template>
  <div class="home">
    <catchFishCvs></catchFishCvs>
    <!-- <game></game> -->
  </div>
</template>
<script>
import catchFishCvs from './components/catchFishCvs'
// import game from './components/game'
export default {
  data () {
    return {
    }
  },
  components: {
    catchFishCvs,
    // game
  },
  computed: {
  },
  mounted () {

  }
}
</script>

<style lang="scss" scoped>
.home {
  // padding: 50px;
}
</style>