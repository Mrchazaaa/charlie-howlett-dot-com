<template>
  <div>
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
  BarController,
  LineController,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import 'chartjs-adapter-date-fns'

Chart.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  BarElement,
  LineElement,
  PointElement,
  BarController,
  LineController,
  Title,
  Tooltip,
  Legend
)

export default {
  name: 'AnalyticsCharts',
  props: {
    analyticsData: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      lighthouseChart: null,
      sizeChart: null
    }
  },
  watch: {
    analyticsData: {
      handler() {
        this.createCharts()
      },
      deep: true
    }
  },
  mounted() {
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

      const labels = this.analyticsData.map(report => new Date(report.time))
      const performanceData = this.analyticsData.map(report => {
        const avgPerformance = this.getAverageLighthouseScore(report, 'performance')
        console.log('Performance for report:', report.time, avgPerformance)
        return Math.round(avgPerformance * 100)
      })

      console.log('Chart labels:', labels)
      console.log('Performance data:', performanceData)

      if (this.lighthouseChart) {
        this.lighthouseChart.destroy()
      }

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

      if (this.sizeChart) {
        this.sizeChart.destroy()
      }

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
    }
  }
}
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 400px;
}

.chart-container canvas {
  width: 100% !important;
  height: 100% !important;
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
</style>