<template>
  <div>
    <!-- Lighthouse Performance Chart -->
    <AnalyticsLineChart
      title="Lighthouse Performance Metrics"
      :analytics-data="analyticsData"
      :datasets="lighthouseDatasets"
      :y-axis-config="lighthouseYAxisConfig"
      chart-title="Lighthouse Scores Over Time"
    />

    <!-- Bundle Size Trends Chart -->
    <AnalyticsLineChart
      title="Bundle Size Trends"
      :analytics-data="analyticsData"
      :datasets="bundleSizeDatasets"
      :y-axis-config="bundleSizeYAxisConfig"
      chart-title="Bundle Size Trends Over Time"
    />
  </div>
</template>

<script>
import AnalyticsLineChart from './AnalyticsLineChart.vue'

export default {
  name: 'AnalyticsCharts',
  components: {
    AnalyticsLineChart
  },
  props: {
    analyticsData: {
      type: Array,
      required: true
    }
  },
  computed: {
    lighthouseDatasets() {
      return [
        {
          label: 'Performance',
          dataExtractor: (analyticsData) => analyticsData.map(report => {
            const avgPerformance = this.getAverageLighthouseScore(report, 'performance')
            return Math.round(avgPerformance * 100)
          }),
          borderColor: 'rgba(24, 188, 156, 1)',
          backgroundColor: 'rgba(24, 188, 156, 0.1)'
        },
        {
          label: 'Accessibility',
          dataExtractor: (analyticsData) => analyticsData.map(report => {
            const avgAccessibility = this.getAverageLighthouseScore(report, 'accessibility')
            return Math.round(avgAccessibility * 100)
          }),
          borderColor: 'rgba(52, 152, 219, 1)',
          backgroundColor: 'rgba(52, 152, 219, 0.1)'
        },
        {
          label: 'Best Practices',
          dataExtractor: (analyticsData) => analyticsData.map(report => {
            const avgBestPractices = this.getAverageLighthouseScore(report, 'bestPractices')
            return Math.round(avgBestPractices * 100)
          }),
          borderColor: 'rgba(155, 89, 182, 1)',
          backgroundColor: 'rgba(155, 89, 182, 0.1)'
        },
        {
          label: 'SEO',
          dataExtractor: (analyticsData) => analyticsData.map(report => {
            const avgSeo = this.getAverageLighthouseScore(report, 'seo')
            return Math.round(avgSeo * 100)
          }),
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
  methods: {
    getAverageLighthouseScore(report, metric) {
      if (!report.lighthouseReports || !Array.isArray(report.lighthouseReports)) {
        return 0
      }

      const scores = report.lighthouseReports
        .map(r => r[metric])
        .filter(score => score !== undefined && score !== null)

      if (scores.length === 0) return 0

      return scores.reduce((sum, score) => sum + score, 0) / scores.length
    }
  }
}
</script>

