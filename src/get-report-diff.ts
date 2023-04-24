import type {ReportCompilation} from './types'

import {getMetricDiff} from './get-metric-diff'
import {sortDiffDescending} from './sort-diff-descending'
import {ReportDiff} from './types'

export function getReportDiff(
  oldReport: ReportCompilation,
  newReport: ReportCompilation
): ReportDiff {
  const added = []
  const removed = []
  const slower = []
  const faster = []
  const unchanged = []

  for (const [name, oldMetrics] of Object.entries(oldReport)) {
    const newMetric = newReport[name]
    if (!newMetric) {
      removed.push(getMetricDiff(name, oldMetrics, {avg: 0, stdDev: 0}))
    } else {
      const diff = getMetricDiff(name, oldMetrics, newMetric)

      if (diff.diffPercentage > 5) {
        slower.push(diff)
      } else if (diff.diffPercentage < 5) {
        faster.push(diff)
      } else {
        unchanged.push(diff)
      }
    }
  }

  for (const [name, newMetrics] of Object.entries(newReport)) {
    const oldMetric = oldReport[name]
    if (!oldMetric) {
      added.push(getMetricDiff(name, {avg: 0, stdDev: 0}, newMetrics))
    }
  }

  return {
    added: sortDiffDescending(added),
    removed: sortDiffDescending(removed),
    slower: sortDiffDescending(slower),
    faster: sortDiffDescending(faster),
    unchanged
  }
}
