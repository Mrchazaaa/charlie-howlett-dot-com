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
      <!-- Summary Cards -->
      <div class="row mb-4">
        <div class="col-sm-6 col-md-4 mb-3 d-flex" v-for="(metric, index) in summaryMetrics" :key="index">
          <div class="card bg-light w-100">
            <div class="card-body text-center d-flex flex-column justify-content-center">
              <h5 class="card-title text-muted">{{ metric.label }}</h5>
              <h2 class="card-text text-primary">{{ metric.value }}</h2>
              <small class="text-muted">{{ metric.unit }}</small>
            </div>
          </div>
        </div>

        <!-- Build Analysis Card -->
        <div class="col-lg-6 col-xl-4 mb-3 d-flex">
          <div class="card bg-light w-100">
            <div class="card-body">
              <h5 class="card-title text-muted text-center mb-3">Build Analysis</h5>
              <div class="table-responsive">
                <table class="table table-sm table-hover mb-0">
                  <thead class="table-dark">
                    <tr>
                      <th>Category</th>
                      <th>Size</th>
                      <th>%</th>
                      <th>Files</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(category, key) in assetCategories" :key="key">
                      <td><span class="badge bg-primary text-white">{{ key }}</span></td>
                      <td>{{ formatBytes(category.bytes) }}</td>
                      <td>{{ category.percentage }}%</td>
                      <td>{{ category.files.length }}</td>
                    </tr>
                    <tr class="table-light fw-bold border-top border-2">
                      <td>Total</td>
                      <td>{{ formatBytes(buildInfo.totalSize) }}</td>
                      <td>100%</td>
                      <td>{{ totalFiles }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Lighthouse Performance Chart -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h3 class="card-title mb-0">Lighthouse Performance Metrics</h3>
            </div>
            <div class="card-body">
              <div class="chart-container">
                <canvas ref="lighthouseChart"></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bundle Size Trends Chart -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h3 class="card-title mb-0">Bundle Size Trends</h3>
            </div>
            <div class="card-body">
              <div class="chart-container">
                <canvas ref="sizeChart"></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  Chart,
  CategoryScale,
  LinearScale,
  TimeScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  BarController,
  LineController,
  DoughnutController,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import 'chartjs-adapter-date-fns'
import LoadingScreen from '../components/LoadingScreen.vue';

Chart.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  BarController,
  LineController,
  DoughnutController,
  Title,
  Tooltip,
  Legend
)

export default {
  name: 'AnalyticsDashboard',
  components: {
    LoadingScreen
  },
  data() {
    return {
      analyticsData: [],
      loading: true,
      error: null,
      lighthouseChart: null,
      sizeChart: null
    }
  },
  computed: {
    summaryMetrics() {
      if (!this.latestReport) return []

      const lighthouse = this.latestReport.lighthouseReports?.[0] || {}
      const webpack = this.latestReport.WebpackAnalyticsReport || {}

      return [
        {
          label: 'Performance Score',
          value: lighthouse.performance ? Math.round(lighthouse.performance * 100) : 'N/A',
          unit: lighthouse.performance ? '/100' : ''
        },
        {
          label: 'Accessibility Score',
          value: lighthouse.accessibility ? Math.round(lighthouse.accessibility * 100) : 'N/A',
          unit: lighthouse.accessibility ? '/100' : ''
        },
        {
          label: 'Best Practices Score',
          value: lighthouse.bestPractices ? Math.round(lighthouse.bestPractices * 100) : 'N/A',
          unit: lighthouse.bestPractices ? '/100' : ''
        },
        {
          label: 'SEO Score',
          value: lighthouse.seo ? Math.round(lighthouse.seo * 100) : 'N/A',
          unit: lighthouse.seo ? '/100' : ''
        },
        {
          label: 'Build Time',
          value: webpack.buildTimeSeconds ? this.formatTime(webpack.buildTimeSeconds / 1000) : 'N/A',
          unit: ''
        }
      ]
    },
    latestReport() {
      return this.analyticsData[this.analyticsData.length - 1] || {}
    },
    buildInfo() {
      const webpack = this.latestReport.WebpackAnalyticsReport || {}
      return {
        time: webpack.time,
        buildTimeSeconds: webpack.buildTimeSeconds,
        totalSize: webpack.sizeBreakdown?.total?.bytes
      }
    },
    assetCategories() {
      const webpack = this.latestReport.WebpackAnalyticsReport || {}
      const breakdown = webpack.sizeBreakdown || {}

      const categories = {}
      Object.keys(breakdown).forEach(key => {
        if (key !== 'total' && breakdown[key]) {
          categories[key] = breakdown[key]
        }
      })

      return categories
    },
    totalFiles() {
      return Object.values(this.assetCategories).reduce((total, category) => {
        return total + (category.files?.length || 0)
      }, 0)
    }
  },
  async mounted() {
    await this.loadAnalyticsData()
    this.createCharts()
  },
  beforeUnmount() {
    if (this.lighthouseChart) {
      this.lighthouseChart.destroy()
    }
    if (this.sizeChart) {
      this.sizeChart.destroy()
    }
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
    createCharts() {
      this.$nextTick(() => {
        this.createLighthouseChart()
        this.createSizeChart()
      })
    },
    createLighthouseChart() {
      const canvas = this.$refs.lighthouseChart
      if (!canvas || !this.analyticsData.length) {
        console.log('Lighthouse chart: Missing canvas or no data', { canvas: !!canvas, dataLength: this.analyticsData.length })
        return
      }

      console.log('Creating lighthouse chart with data:', this.analyticsData)

      // Debug the data processing
      const labels = this.analyticsData.map(report => new Date(report.time))
      const performanceData = this.analyticsData.map(report => {
        const avgPerformance = this.getAverageLighthouseScore(report, 'performance')
        console.log('Performance for report:', report.time, avgPerformance)
        return Math.round(avgPerformance * 100)
      })

      console.log('Chart labels:', labels)
      console.log('Performance data:', performanceData)

      const ctx = canvas.getContext('2d')
      this.lighthouseChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Performance',
              data: performanceData,
              borderColor: 'rgba(24, 188, 156, 1)',
              backgroundColor: 'rgba(24, 188, 156, 0.1)',
              tension: 0.1
            },
            {
              label: 'Accessibility',
              data: this.analyticsData.map(report => {
                const avgAccessibility = this.getAverageLighthouseScore(report, 'accessibility')
                return Math.round(avgAccessibility * 100)
              }),
              borderColor: 'rgba(52, 152, 219, 1)',
              backgroundColor: 'rgba(52, 152, 219, 0.1)',
              tension: 0.1
            },
            {
              label: 'Best Practices',
              data: this.analyticsData.map(report => {
                const avgBestPractices = this.getAverageLighthouseScore(report, 'bestPractices')
                return Math.round(avgBestPractices * 100)
              }),
              borderColor: 'rgba(155, 89, 182, 1)',
              backgroundColor: 'rgba(155, 89, 182, 0.1)',
              tension: 0.1
            },
            {
              label: 'SEO',
              data: this.analyticsData.map(report => {
                const avgSeo = this.getAverageLighthouseScore(report, 'seo')
                return Math.round(avgSeo * 100)
              }),
              borderColor: 'rgba(241, 196, 15, 1)',
              backgroundColor: 'rgba(241, 196, 15, 0.1)',
              tension: 0.1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              type: 'time',
              time: {
                unit: 'day',
                displayFormats: {
                  day: 'MMM dd'
                }
              },
              title: {
                display: true,
                text: 'Date'
              }
            },
            y: {
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
          plugins: {
            title: {
              display: true,
              text: 'Lighthouse Scores Over Time'
            }
          }
        }
      })
    },
    createSizeChart() {
      const canvas = this.$refs.sizeChart
      if (!canvas || !this.analyticsData.length) return

      const ctx = canvas.getContext('2d')
      this.sizeChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: this.analyticsData.map(report => new Date(report.time)),
          datasets: [
            {
              label: 'Total Size',
              data: this.analyticsData.map(report => {
                const totalSize = report.WebpackAnalyticsReport?.sizeBreakdown?.total?.bytes || 0
                return totalSize / 1024 / 1024 // Convert to MB
              }),
              borderColor: 'rgba(24, 188, 156, 1)',
              backgroundColor: 'rgba(24, 188, 156, 0.1)',
              tension: 0.1
            },
            {
              label: 'JavaScript',
              data: this.analyticsData.map(report => {
                const jsSize = report.WebpackAnalyticsReport?.sizeBreakdown?.javascript?.bytes || 0
                return jsSize / 1024 / 1024 // Convert to MB
              }),
              borderColor: 'rgba(52, 152, 219, 1)',
              backgroundColor: 'rgba(52, 152, 219, 0.1)',
              tension: 0.1
            },
            {
              label: 'CSS',
              data: this.analyticsData.map(report => {
                const cssSize = report.WebpackAnalyticsReport?.sizeBreakdown?.css?.bytes || 0
                return cssSize / 1024 / 1024 // Convert to MB
              }),
              borderColor: 'rgba(155, 89, 182, 1)',
              backgroundColor: 'rgba(155, 89, 182, 0.1)',
              tension: 0.1
            },
            {
              label: 'Images',
              data: this.analyticsData.map(report => {
                const imgSize = report.WebpackAnalyticsReport?.sizeBreakdown?.images?.bytes || 0
                return imgSize / 1024 / 1024 // Convert to MB
              }),
              borderColor: 'rgba(241, 196, 15, 1)',
              backgroundColor: 'rgba(241, 196, 15, 0.1)',
              tension: 0.1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              type: 'time',
              time: {
                unit: 'day',
                displayFormats: {
                  day: 'MMM dd'
                }
              },
              title: {
                display: true,
                text: 'Date'
              }
            },
            y: {
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
          },
          plugins: {
            title: {
              display: true,
              text: 'Bundle Size Trends Over Time'
            }
          }
        }
      })
    },
    getAverageLighthouseScore(report, metric) {
      if (!report.lighthouseReports || !Array.isArray(report.lighthouseReports)) {
        return 0
      }

      const scores = report.lighthouseReports
        .map(r => r[metric])
        .filter(score => score !== undefined && score !== null)

      if (scores.length === 0) return 0

      return scores.reduce((sum, score) => sum + score, 0) / scores.length
    },
    formatBytes(bytes) {
      if (!bytes || bytes === 0) return '0 B'

      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))

      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
    },
    formatTime(seconds) {
      if (!seconds) return 'N/A'

      const totalSeconds = Math.round(seconds)
      const minutes = Math.floor(totalSeconds / 60)
      const remainingSeconds = totalSeconds % 60

      if (minutes > 0) {
        return `${minutes}m ${remainingSeconds}s`
      }
      return `${totalSeconds}s`
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

.chart-container {
  position: relative;
  height: 400px;
}

.chart-container canvas {
  width: 100% !important;
  height: 100% !important;
}
</style>