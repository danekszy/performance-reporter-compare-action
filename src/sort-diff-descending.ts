import {MetricDiff} from './types'

export function sortDiffDescending(items: MetricDiff[]): MetricDiff[] {
  return items.sort(
    (diff1, diff2) => Math.abs(diff2.diff) - Math.abs(diff1.diff)
  )
}
