<template>
  <div v-if="report">
    <!-- Lighthouse Scores -->
    <div class="mb-3">
      <div class="row mb-4">
        <div class="col-sm-6 col-md-3 mb-3 d-flex" v-for="(metric, index) in lighthouseMetrics" :key="index">
          <div class="card bg-light w-100">
            <div class="card-body text-center d-flex flex-column justify-content-center">
              <h5 class="card-title text-muted">{{ metric.label }}</h5>
              <h2 class="card-text text-primary">{{ metric.value }}</h2>
              <small class="text-muted">{{ metric.unit }}</small>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Build Analytics -->
    <div class="mb-4">
      <div class="row">
        <div class="col-sm-6 col-md-4 mb-3 d-flex" v-for="(metric, index) in buildMetrics" :key="index">
          <div class="card bg-light w-100">
            <div class="card-body text-center d-flex flex-column justify-content-center">
              <h5 class="card-title text-muted">{{ metric.label }}</h5>
              <h2 class="card-text text-primary">{{ metric.value }}</h2>
              <small class="text-muted">{{ metric.unit }}</small>
            </div>
          </div>
        </div>

        <!-- Build Analysis Card -->
        <div class="col-lg-8 mb-3 d-flex">
          <div class="card bg-light w-100">
            <div class="card-body">
              <h5 class="card-title text-muted text-center mb-3">Asset Breakdown</h5>
              <div class="table-responsive">
                <table class="table table-sm mb-0 asset-breakdown-table">
                  <thead>
                    <tr class="asset-breakdown-header">
                      <th>Category</th>
                      <th>Size</th>
                      <th>%</th>
                      <th>Files</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(category, key) in assetCategories" :key="key" class="asset-breakdown-row">
                      <td><span class="fw-bold">{{ key }}</span></td>
                      <td>{{ formatBytes(category.bytes) }}</td>
                      <td>{{ category.percentage }}%</td>
                      <td>{{ category.files.length }}</td>
                    </tr>
                    <tr class="asset-breakdown-total">
                      <td class="fw-bold">Total</td>
                      <td class="fw-bold">{{ formatBytes(buildInfo.totalSize) }}</td>
                      <td class="fw-bold">100%</td>
                      <td class="fw-bold">{{ totalFiles }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getAverageLighthouseScores } from '../utils/lighthouseUtils.js'

export default {
  name: 'AnalyticsSummary',
  props: {
    report: {
      type: Object,
      required: true
    }
  },
  computed: {
    lighthouseMetrics() {
      if (!this.report) return []

      const scores = getAverageLighthouseScores(this.report)

      return [
        {
          label: 'Performance',
          value: scores.performance > 0 ? Math.round(scores.performance * 100) : 'N/A',
          unit: scores.performance > 0 ? '/100' : ''
        },
        {
          label: 'Accessibility',
          value: scores.accessibility > 0 ? Math.round(scores.accessibility * 100) : 'N/A',
          unit: scores.accessibility > 0 ? '/100' : ''
        },
        {
          label: 'Best Practices',
          value: scores.bestPractices > 0 ? Math.round(scores.bestPractices * 100) : 'N/A',
          unit: scores.bestPractices > 0 ? '/100' : ''
        },
        {
          label: 'SEO',
          value: scores.seo > 0 ? Math.round(scores.seo * 100) : 'N/A',
          unit: scores.seo > 0 ? '/100' : ''
        }
      ]
    },
    buildMetrics() {
      if (!this.report) return []

      const webpack = this.report.WebpackAnalyticsReport || {}

      return [
        {
          label: 'Build Time',
          value: webpack.buildTimeSeconds ? this.formatTime(webpack.buildTimeSeconds / 1000) : 'N/A',
          unit: ''
        }
      ]
    },
    buildInfo() {
      const webpack = this.report?.WebpackAnalyticsReport || {}
      return {
        time: webpack.time,
        buildTimeSeconds: webpack.buildTimeSeconds,
        totalSize: webpack.sizeBreakdown?.total?.bytes
      }
    },
    assetCategories() {
      const webpack = this.report?.WebpackAnalyticsReport || {}
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
  methods: {
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

.asset-breakdown-table {
  border-radius: 0.375rem;
  overflow: hidden;
}

.asset-breakdown-header {
  background: linear-gradient(135deg, var(--primary, #007bff) 0%, #0056b3 100%);
  color: white;
}

.asset-breakdown-header th {
  border: none;
  font-weight: 600;
  font-size: 0.85rem;
  padding: 0.75rem 0.5rem;
}

.asset-breakdown-row:hover {
  background-color: rgba(0,123,255,0.05);
}

.asset-breakdown-total {
  border-top: 2px solid var(--primary, #007bff);
}

.asset-breakdown-total td {
  color: #495057;
}
</style>