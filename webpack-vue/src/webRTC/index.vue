<template>
  <div class="home">
    <h1>啥都没有</h1>
    <stillPhotos></stillPhotos>
  </div>
</template>
<script>
import stillPhotos from '@cpt/stillPhotos'
export default {
  components: {stillPhotos},
  data () {
    return {
    }
  },
  computed: {
  },
  mounted () {

  }
}
</script>

<style lang="scss" scoped>
.home {}
</style>