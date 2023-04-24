import {MetricDiff, TestAttributes} from './types'

export function getMetricDiff(
  name: string,
  oldMetric: TestAttributes,
  newMetric: TestAttributes
): MetricDiff {
  return {
    name,
    new: {
      avg: newMetric.avg,
      stdDev: newMetric.stdDev
    },
    old: {
      avg: oldMetric.avg,
      stdDev: oldMetric.stdDev
    },
    diff: newMetric.avg - oldMetric.avg,
    diffPercentage:
      +((1 - newMetric.avg / oldMetric.avg) * -100).toFixed(5) || 0
  }
}
