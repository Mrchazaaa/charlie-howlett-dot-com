<template>
  <div class="home">
    <!-- Main Content -->
    <div class="main-content">
      <TitleContainerComponent/>
      <ContentContainerComponent/>
      <FooterComponent/>
    </div>
  </div>
</template>

<script>
import TitleContainerComponent from '../components/TitleContainer.vue';
import ContentContainerComponent from '../components/ContentContainer.vue';
import FooterComponent from "../components/Footer.vue";

export default {
  name: 'HomePage',
  components: {
    TitleContainerComponent,
    ContentContainerComponent,
    FooterComponent
  }
}
</script>

<style scoped>
.home {
  height: 100%;
}

.main-content {
  animation: fadeIn 0.8s ease-in-out;
}

.main-content.hidden {
  opacity: 0;
  pointer-events: none;
}

@keyframes fadeIn {
  from {
    opacity: 0.01;
    transform: translateY(0);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>