<template>
  <div class="container-fluid mt-4">
    <LoadingScreen :show="loading" />

    <div v-if="error" class="row">
      <div class="col-12">
        <div class="alert alert-danger" role="alert">
          <h4 class="alert-heading">Error Loading Data</h4>
          <p>{{ error }}</p>
        </div>
      </div>
    </div>

    <div v-else-if="!loading && !error" class="analytics-content pb-4">
      <div class="mb-4">
        <!-- Lighthouse Performance Chart -->
        <AnalyticsLineChart
          title="Lighthouse Performance Trends"
          :analytics-data="analyticsData"
          :datasets="lighthouseDatasets"
          :y-axis-config="lighthouseYAxisConfig"
          chart-title="Lighthouse Scores Over Time"
        />
      </div>

      <div>
        <!-- Bundle Size Trends Chart -->
        <AnalyticsLineChart
          title="Bundle Size Trends"
          :analytics-data="analyticsData"
          :datasets="bundleSizeDatasets"
          :y-axis-config="bundleSizeYAxisConfig"
          chart-title="Bundle Size Trends Over Time"
        />
      </div>
    </div>
  </div>
</template>

<script>
import LoadingScreen from '../components/LoadingScreen.vue';
import AnalyticsLineChart from './AnalyticsLineChart.vue'
import { getAverageLighthouseScores } from '../utils/lighthouseUtils.js'

export default {
  name: 'AnalyticsDashboard',
  components: {
    LoadingScreen,
    AnalyticsLineChart
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
    },
    lighthouseDatasets() {
      // Pre-calculate all lighthouse scores once per report
      const reportScores = this.analyticsData.map(report => getAverageLighthouseScores(report))

      return [
        {
          label: 'Performance',
          dataExtractor: () => reportScores.map(scores => Math.round(scores.performance * 100)),
          borderColor: 'rgba(24, 188, 156, 1)',
          backgroundColor: 'rgba(24, 188, 156, 0.1)'
        },
        {
          label: 'Accessibility',
          dataExtractor: () => reportScores.map(scores => Math.round(scores.accessibility * 100)),
          borderColor: 'rgba(52, 152, 219, 1)',
          backgroundColor: 'rgba(52, 152, 219, 0.1)'
        },
        {
          label: 'Best Practices',
          dataExtractor: () => reportScores.map(scores => Math.round(scores.bestPractices * 100)),
          borderColor: 'rgba(155, 89, 182, 1)',
          backgroundColor: 'rgba(155, 89, 182, 0.1)'
        },
        {
          label: 'SEO',
          dataExtractor: () => reportScores.map(scores => Math.round(scores.seo * 100)),
          borderColor: 'rgba(241, 196, 15, 1)',
          backgroundColor: 'rgba(241, 196, 15, 0.1)'
        }
      ]
    },
    bundleSizeDatasets() {
      return [
        {
          label: 'Total Size',
          dataExtractor: (analyticsData) => analyticsData.map(report => {
            const totalSize = report.WebpackAnalyticsReport?.sizeBreakdown?.total?.bytes || 0
            return totalSize / 1024 / 1024 // Convert to MB
          }),
          borderColor: 'rgba(24, 188, 156, 1)',
          backgroundColor: 'rgba(24, 188, 156, 0.1)'
        },
        {
          label: 'JavaScript',
          dataExtractor: (analyticsData) => analyticsData.map(report => {
            const jsSize = report.WebpackAnalyticsReport?.sizeBreakdown?.javascript?.bytes || 0
            return jsSize / 1024 / 1024 // Convert to MB
          }),
          borderColor: 'rgba(52, 152, 219, 1)',
          backgroundColor: 'rgba(52, 152, 219, 0.1)'
        },
        {
          label: 'CSS',
          dataExtractor: (analyticsData) => analyticsData.map(report => {
            const cssSize = report.WebpackAnalyticsReport?.sizeBreakdown?.css?.bytes || 0
            return cssSize / 1024 / 1024 // Convert to MB
          }),
          borderColor: 'rgba(155, 89, 182, 1)',
          backgroundColor: 'rgba(155, 89, 182, 0.1)'
        },
        {
          label: 'Images',
          dataExtractor: (analyticsData) => analyticsData.map(report => {
            const imgSize = report.WebpackAnalyticsReport?.sizeBreakdown?.images?.bytes || 0
            return imgSize / 1024 / 1024 // Convert to MB
          }),
          borderColor: 'rgba(241, 196, 15, 1)',
          backgroundColor: 'rgba(241, 196, 15, 0.1)'
        }
      ]
    },
    lighthouseYAxisConfig() {
      return {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value) {
            return value + '%'
          }
        },
        title: {
          display: true,
          text: 'Score (%)'
        }
      }
    },
    bundleSizeYAxisConfig() {
      return {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value.toFixed(1) + ' MB'
          }
        },
        title: {
          display: true,
          text: 'Size (MB)'
        }
      }
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

</style>