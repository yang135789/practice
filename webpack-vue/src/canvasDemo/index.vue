<template>
  <div class="home">
    <!-- <catchFishCvs></catchFishCvs> -->
    <textStroke></textStroke>
  </div>
</template>
<script>
import catchFishCvs from './components/catchFishCvs';
import textStroke from './components/textStroke';

export default {
  data () {
    return {
    }
  },
  components: {
    catchFishCvs,
    textStroke
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