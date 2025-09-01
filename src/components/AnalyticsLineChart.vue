<template>
  <div class="row mb-4">
    <div class="col-12">
      <div class="card">
        <div class="card-header">
          <h3 class="card-title mb-0">{{ title }}</h3>
        </div>
        <div class="card-body">
          <div class="chart-container">
            <canvas ref="chart"></canvas>
          </div>
          <div class="custom-legend" v-if="chartLegendItems.length">
            <div class="legend-row" v-for="(row, rowIndex) in legendRows" :key="rowIndex">
              <div 
                class="legend-item" 
                v-for="item in row" 
                :key="item.datasetIndex"
                @click="toggleDataset(item.datasetIndex)"
                :class="{ hidden: item.hidden }">
                <span class="legend-color" :style="{ backgroundColor: item.fillStyle }"></span>
                <span class="legend-text">{{ item.text }}</span>
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
  LineElement,
  PointElement,
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
  LineElement,
  PointElement,
  LineController,
  Title,
  Tooltip,
  Legend
)

export default {
  name: 'AnalyticsLineChart',
  props: {
    title: {
      type: String,
      required: true
    },
    analyticsData: {
      type: Array,
      required: true
    },
    datasets: {
      type: Array,
      required: true
    },
    yAxisConfig: {
      type: Object,
      default: () => ({
        beginAtZero: true,
        title: {
          display: true,
          text: 'Value'
        }
      })
    },
    chartTitle: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      chart: null,
      chartLegendItems: []
    }
  },
  computed: {
    legendRows() {
      const rows = []
      for (let i = 0; i < this.chartLegendItems.length; i += 2) {
        rows.push(this.chartLegendItems.slice(i, i + 2))
      }
      return rows
    }
  },
  watch: {
    analyticsData: {
      handler() {
        this.createChart()
      },
      deep: true
    }
  },
  mounted() {
    this.createChart()
  },
  beforeUnmount() {
    if (this.chart) {
      this.chart.destroy()
    }
  },
  methods: {
    createChart() {
      this.$nextTick(() => {
        const canvas = this.$refs.chart
        if (!canvas || !this.analyticsData.length) {
          return
        }

        if (this.chart) {
          this.chart.destroy()
        }

        const labels = this.analyticsData.map(report => new Date(report.time))

        const ctx = canvas.getContext('2d')
        this.chart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: labels,
            datasets: this.datasets.map(dataset => ({
              ...dataset,
              data: dataset.dataExtractor(this.analyticsData),
              tension: 0.1
            }))
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
              y: this.yAxisConfig
            },
            plugins: {
              title: {
                display: !!this.chartTitle,
                text: this.chartTitle
              },
              legend: {
                display: false // Hide Chart.js legend, we'll use custom one
              }
            },
            layout: {
              padding: {
                bottom: 10
              }
            }
          }
        })

        // Generate custom legend items
        this.generateLegendItems()
      })
    },
    generateLegendItems() {
      if (!this.chart) return
      
      this.chartLegendItems = this.chart.data.datasets.map((dataset, index) => ({
        text: dataset.label,
        fillStyle: dataset.borderColor,
        datasetIndex: index,
        hidden: false
      }))
    },
    toggleDataset(datasetIndex) {
      if (!this.chart) return
      
      const meta = this.chart.getDatasetMeta(datasetIndex)
      meta.hidden = !meta.hidden
      this.chartLegendItems[datasetIndex].hidden = meta.hidden
      this.chart.update()
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

.custom-legend {
  margin-top: 4px;
  padding: 2px;
}

.legend-row {
  display: flex;
  justify-content: center;
  margin-bottom: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  margin: 0 15px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.legend-item.hidden {
  opacity: 0.3;
}

.legend-item:hover {
  opacity: 0.8;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 8px;
  flex-shrink: 0;
}

.legend-text {
  font-size: 14px;
  color: #666;
}

</style>