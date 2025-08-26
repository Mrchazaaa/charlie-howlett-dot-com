<template>
  <div class="home">
    <LoadingScreen :show="loading" />

    <!-- Main Content -->
    <div class="main-content" :class="{ hidden: loading }">
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
import LoadingScreen from '../components/LoadingScreen.vue';

export default {
  name: 'HomePage',
  components: {
    TitleContainerComponent,
    ContentContainerComponent,
    FooterComponent,
    LoadingScreen
  },
  data() {
    return {
      loading: true
    }
  },
  async mounted() {
    document.body.style.overflow = 'hidden'

    await this.waitForPageLoad()

    document.body.style.overflow = ''
    this.loading = false;
  },
  methods: {
    async waitForPageLoad() {
      // Wait for DOM to be ready
      await this.$nextTick()

      // Wait for all images to load
      const images = document.querySelectorAll('img')
      const imagePromises = Array.from(images).map(img => {
        if (img.complete) return Promise.resolve()

        return new Promise((resolve) => {
          img.onload = resolve
          img.onerror = resolve // Still resolve on error to avoid hanging
        })
      })

      if (document.fonts) {
        await document.fonts.ready
      }

      await Promise.all(imagePromises)
    }
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
    opacity: 0;
    transform: translateY(0);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>