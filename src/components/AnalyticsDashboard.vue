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

      <!-- Analytics Charts -->
      <AnalyticsCharts :analytics-data="analyticsData" />

      <!-- Analytics Reports -->
      <div class="row mb-4">
        <div class="col-12">
          <!-- Latest Report Summary -->
          <div class="card mb-3">
            <div class="card-header">
              <button class="btn btn-link w-100 text-start p-0 border-0 bg-transparent collapsible-header" 
                      @click="toggleLatestReport" 
                      :class="{ collapsed: !showLatestReport }">
                <strong>Latest Analytics Summary</strong>
                <span class="ms-2 text-muted">{{ formatDate(latestReport.time) }}</span>
                <span class="float-end">
                  <i class="fas" :class="showLatestReport ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
                </span>
              </button>
            </div>
            <div class="collapse-content" :class="{ 'show': showLatestReport }">
              <div class="card-body">
                <AnalyticsSummary :report="latestReport" />
              </div>
            </div>
          </div>

          <!-- Historical Reports -->
          <div class="card mb-3" v-for="(report, index) in sortedHistoricalReports" :key="report.time">
            <div class="card-header">
              <button class="btn btn-link w-100 text-start p-0 border-0 bg-transparent collapsible-header" 
                      @click="toggleHistoricalReport(index)" 
                      :class="{ collapsed: !showHistoricalReports[index] }">
                <strong>Analytics Report {{ index + 2 }}</strong>
                <span class="ms-2 text-muted">{{ formatDate(report.time) }}</span>
                <span class="float-end">
                  <i class="fas" :class="showHistoricalReports[index] ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
                </span>
              </button>
            </div>
            <div class="collapse-content" :class="{ 'show': showHistoricalReports[index] }">
              <div class="card-body">
                <AnalyticsSummary :report="report" />
              </div>
            </div>
          </div>
        </div>
      </div>
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
      error: null,
      showLatestReport: true,
      showHistoricalReports: {}
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
    },
    toggleLatestReport() {
      this.showLatestReport = !this.showLatestReport
    },
    toggleHistoricalReport(index) {
      this.showHistoricalReports[index] = !this.showHistoricalReports[index]
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

.collapsible-header {
  color: var(--primary, #007bff) !important;
  text-decoration: none !important;
  font-size: 1.1rem;
}

.collapsible-header:hover {
  color: var(--primary, #0056b3) !important;
}

.collapse-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease-out;
}

.collapse-content.show {
  max-height: 2000px;
  transition: max-height 0.3s ease-in;
}

</style>