<template>
  <div class="container-fluid mt-4">
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

      <!-- Analytics Charts -->
      <AnalyticsCharts :analytics-data="analyticsData" />

      <!-- Analytics Reports -->
      <div class="row mb-4">
        <div class="col-12">
          <!-- Latest Report Summary -->
          <CollapsibleCard
            title="Latest Analytics Summary"
            :subtitle="formatDate(latestReport.time)"
            :initially-expanded="true">
            <AnalyticsSummary :report="latestReport" />
          </CollapsibleCard>

          <!-- Historical Reports -->
          <CollapsibleCard
            v-for="report in sortedHistoricalReports"
            :key="report.time"
            title="Analytics Report"
            :subtitle="formatDate(report.time)"
            :initially-expanded="false">
            <AnalyticsSummary :report="report" />
          </CollapsibleCard>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LoadingScreen from '../components/LoadingScreen.vue';
import AnalyticsCharts from '../components/AnalyticsCharts.vue';
import AnalyticsSummary from '../components/AnalyticsSummary.vue';
import CollapsibleCard from '../components/CollapsibleCard.vue';

export default {
  name: 'AnalyticsDashboard',
  components: {
    LoadingScreen,
    AnalyticsCharts,
    AnalyticsSummary,
    CollapsibleCard
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
    },
    sortedHistoricalReports() {
      if (this.analyticsData.length <= 1) return []

      return this.analyticsData
        .slice(0, -1) // Remove the latest report
        .sort((a, b) => new Date(b.time) - new Date(a.time)) // Sort by date, newest first
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
    },
    formatDate(dateString) {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleString()
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