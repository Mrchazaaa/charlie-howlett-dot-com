<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
  export default {
    name: 'app'
  }
</script>

<style lang="scss">
  @import "@/styles/_variables.scss";
  @import "@/styles/scss/bootstrap.scss";
  @import '@/styles/styles.scss';


  body, html {
    margin:0;
    padding:0;
    height: 100dvh;
  }
  hr {
      margin-bottom: 0px;
  }
</style>
