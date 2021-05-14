<template>
  <div class="home">
    <ballistic></ballistic>
  </div>
</template>
<script>
import ballistic from './components/ballistic'
export default {
  data () {
    return {
    }
  },
  components: {
    ballistic
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