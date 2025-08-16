<template>
  <div id="app">
    <PreLoad/>
    <TitleContainerComponent/>
  </div>
</template>

<script>
  import PreLoad from './components/PreLoad.vue'
  import TitleContainerComponent from './components/TitleContainer.vue';

  export default {
    name: 'app',
    components: {
      PreLoad,
      TitleContainerComponent
    },
  }
</script>

<style lang="scss">
  @import "@/styles/_variables.scss";
  @import "@/styles/scss/bootstrap.scss";
  @import "@/styles/flatly.scss";
  @import "@/styles/darkly.scss";

  body, html {
    margin:0;
    padding:0;
    height: 100dvh;
  }
  hr {
      margin-bottom: 0px;
  }
  .border {
    // border-radius: 4px;
  }
</style>
