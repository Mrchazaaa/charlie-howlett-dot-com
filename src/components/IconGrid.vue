<template>
  <div id="icon-grid" :style="'grid-template-columns: repeat(' + rowWidth + ', 1fr);'">
    <FloatingIcon
      v-for="item in items"
      :key="item.image"
      :image="item.image"
      :href="item.link"
      :style="'grid-column: span ' + item.width + ';'"
      :height="rowHeight"/>
  </div>
</template>

<script>
  import FloatingIcon from "./FloatingIcon.vue";

  export default {
    name: "IconGrid",
    props: {
      items: {
        type: Array,
        required: true
      },
      rowWidth: {
        type: Number,
        required: true
      },
      rowHeight: {
        type: Number,
        required: true
      },
    },
    components: {
      FloatingIcon,
    },
  };
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
  @import "@/styles/_variables.scss";

  #icon-grid {
    width: 100%;
    display: grid;
  }
</style>

