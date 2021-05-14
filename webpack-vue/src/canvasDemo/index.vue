<template>
  <div class="home">
    <!-- <catchFishCss></catchFishCss> -->
    <catchFishCvs></catchFishCvs>
  </div>
</template>
<script>
import catchFishCss from './components/catchFishCss'
import catchFishCvs from './components/catchFishCvs'
export default {
  data () {
    return {
    }
  },
  components: {
    catchFishCss,
    catchFishCvs
  },
  computed: {
  },
  mounted () {

  }
}
</script>

<style lang="scss" scoped>
.home {
  padding: 50px;
}
</style>