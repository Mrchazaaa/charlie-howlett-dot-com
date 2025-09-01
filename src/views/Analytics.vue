<template>
  <div class="analytics">
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container">
        <router-link to="/" class="navbar-brand">Charlie Howlett</router-link>
        <div class="navbar-nav ml-auto">
          <router-link to="/" class="nav-link">Home</router-link>
          <router-link to="/analytics" class="nav-link active">Analytics</router-link>
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
.analytics {
  min-height: 100vh;
  background-color: #f8f9fa;
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