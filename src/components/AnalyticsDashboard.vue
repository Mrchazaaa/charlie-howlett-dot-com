<template>
  <div class="container-fluid mt-4">
    <div class="row">
      <div class="col-12">
        <h1 class="display-4 text-center mb-4">Analytics Dashboard</h1>
      </div>
    </div>

    <LoadingScreen :show="loading" message="Loading analytics data..." />

    <div v-if="error" class="row">
      <div class="col-12">
        <div class="alert alert-danger" role="alert">
          <h4 class="alert-heading">Error Loading Data</h4>
          <p>{{ error }}</p>
        </div>
      </div>
    </div>

    <div v-else-if="!loading && !error" class="analytics-content">
      <!-- Analytics Summary -->
      <AnalyticsSummary :report="latestReport" />

      <!-- Analytics Charts -->
      <AnalyticsCharts :analytics-data="analyticsData" />
    </div>
  </div>
</template>

<script>
import LoadingScreen from '../components/LoadingScreen.vue';
import AnalyticsCharts from '../components/AnalyticsCharts.vue';
import AnalyticsSummary from '../components/AnalyticsSummary.vue';

export default {
  name: 'AnalyticsDashboard',
  components: {
    LoadingScreen,
    AnalyticsCharts,
    AnalyticsSummary
  },
  data() {
    return {
      analyticsData: [],
      loading: true,
      error: null
    }
  },
  computed: {
    latestReport() {
      return this.analyticsData[this.analyticsData.length - 1] || {}
    }
  },
  async mounted() {
    await this.loadAnalyticsData()
  },
  methods: {
    async loadAnalyticsData() {
      try {
        this.loading = true

        const response = await fetch('/.netlify/functions/analytics')
        if (!response.ok) {
          throw new Error('Failed to fetch analytics data')
        }

        const data = await response.json()
        console.log('Raw analytics data:', data)

        // Extract timestamp from keys and add to reports
        this.analyticsData = Object.entries(data.results)
          .filter(([report]) => report !== null)
          .map(([key, report]) => {
            // Extract timestamp from key format: "2025-08-23T22:56:49.360Z/analytics.json"
            const timestamp = key.split('/')[0]
            return {
              ...report,
              time: timestamp
            }
          })

        console.log('Processed analytics data:', this.analyticsData)

      } catch (err) {
        this.error = `Error loading analytics data: ${err.message}`
        console.error('Analytics loading error:', err)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.analytics-content {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.card {
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border: none;
}

.card-header {
  background-color: var(--primary, #007bff);
  color: white;
  border-bottom: none;
}

.text-primary {
  color: var(--primary, #007bff) !important;
}

.btn-primary {
  background-color: var(--primary, #007bff);
  border-color: var(--primary, #007bff);
}

.spinner-border {
  color: var(--primary, #007bff) !important;
}

</style>