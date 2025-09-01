<template>
  <div>
    <!-- Lighthouse Performance Chart -->
    <AnalyticsLineChart
      title="Lighthouse Performance Trends"
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
import { getAverageLighthouseScores } from '../utils/lighthouseUtils.js'

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
  }
}
</script>

