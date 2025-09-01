/**
 * Calculate average lighthouse scores for all metrics from a report
 * @param {Object} report - The analytics report containing lighthouseReports array
 * @returns {Object} Dictionary with metric names as keys and average scores (0-1) as values
 */
export function getAverageLighthouseScores(report) {
  const scores = {
    performance: 0,
    accessibility: 0,
    bestPractices: 0,
    seo: 0
  }

  if (!report?.lighthouseReports || !Array.isArray(report.lighthouseReports)) {
    return scores
  }

  // Calculate average for each metric
  Object.keys(scores).forEach(metric => {
    const metricScores = report.lighthouseReports
      .map(r => r[metric])
      .filter(score => score !== undefined && score !== null && typeof score === 'number')

    if (metricScores.length > 0) {
      scores[metric] = metricScores.reduce((sum, score) => sum + score, 0) / metricScores.length
    }
  })

  return scores
}