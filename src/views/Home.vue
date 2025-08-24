<template>
  <div class="home">
    <!-- Loading Screen -->
    <div v-if="loading" class="loading-screen">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <h2 class="mt-3">Loading...</h2>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else class="main-content">
      <PreLoad/>
      <TitleContainerComponent/>
      <ContentContainerComponent/>
      <FooterComponent/>
    </div>
  </div>
</template>

<script>
import PreLoad from '../components/PreLoad.vue'
import ContentContainerComponent from '../components/ContentContainer.vue';
import TitleContainerComponent from '../components/TitleContainer.vue';
import FooterComponent from "../components/Footer.vue";

export default {
  name: 'HomePage',
  components: {
    PreLoad,
    TitleContainerComponent,
    ContentContainerComponent,
    FooterComponent
  },
  data() {
    return {
      loading: true
    }
  },
  async mounted() {
    await this.waitForPageLoad()

    // Add a small delay to ensure smooth transition
    setTimeout(() => {
        this.loading = false
    }, 500)
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

      // Wait for fonts to load (if any)
      if (document.fonts) {
        await document.fonts.ready
      }

      // Wait for all images
      await Promise.all(imagePromises)

      // Additional wait for any dynamic content
      return new Promise(resolve => setTimeout(resolve, 300))
    }
  }
}
</script>

<style scoped>
.home {
  height: 100%;
}

.loading-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--primary, #2C3E50) 0%, var(--info, #3498DB) 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loading-content {
  text-align: center;
  color: white;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

.main-content {
  animation: fadeIn 0.8s ease-in-out;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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