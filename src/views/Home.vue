<template>
  <div class="home">
    <!-- Main Content -->
    <div class="main-content">
      <TitleContainerComponent/>
    </div>
  </div>
</template>

<script>
import TitleContainerComponent from '../components/TitleContainer.vue';

export default {
  name: 'HomePage',
  components: {
    TitleContainerComponent
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