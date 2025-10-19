<template>
  <div class="analytics">
    <nav class="navbar navbar-expand-lg navbar-dark">
      <div class="container">
        <span class="navbar-brand">Analytics Dashboard</span>
        <div class="navbar-nav ml-auto">
          <router-link to="/" class="nav-link">Home</router-link>
        </div>
      </div>
    </nav>
    <AnalyticsDashboard/>
  </div>
</template>

<script>
import AnalyticsDashboard from '../components/AnalyticsDashboard.vue'

export default {
  name: 'AnalyticsPage',
  components: {
    AnalyticsDashboard
  }
}
</script>

<style scoped>
@import "@/styles/card.scss";

.navbar {
  background-color: var(--navbar-primary-background);
}

.analytics {
  min-height: 100vh;
}

.navbar-brand {
  text-decoration: none;
}

.nav-link {
  text-decoration: none;
}

.nav-link.active {
  font-weight: bold;
}
</style>