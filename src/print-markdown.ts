import type {MetricDiff, ReportDiff, TestAttributes} from './types'

function conditionalPercentage(number: number): string {
  if ([Infinity, -Infinity].includes(number)) {
    return '-'
  }

  const absValue = Math.abs(number)

  if ([0, 100].includes(absValue)) {
    return `${number}%`
  }

  const value = [0, 100].includes(absValue) ? absValue : absValue.toFixed(2)

  return `${signFor(number)}${value}%`
}

function capitalize(text: string): string {
  return `${text[0].toUpperCase()}${text.slice(1)}`
}

function makeHeader(columns: readonly string[]): string {
  return `${columns.join(' | ')}
${columns
  .map(x =>
    Array.from(new Array(x.length))
      .map(() => '-')
      .join('')
  )
  .join(' | ')}`
}

const TABLE_HEADERS = makeHeader(['Test Name', 'Metric', '% Changed'])

function signFor(num: number): '' | '+' | '-' {
  if (num === 0) return ''
  return num > 0 ? '+' : '-'
}

function toMetricDiff(
  oldMetric: TestAttributes,
  newMetric: TestAttributes,
  diff?: number | undefined
): string {
  const diffLine = [
    `${oldMetric.avg} (± ${oldMetric.stdDev})ms -> ${newMetric.avg} (± ${newMetric.stdDev})ms`
  ]
  if (typeof diff !== 'undefined') {
    diffLine.push(`(${signFor(diff)}${diff}ms)`)
  }
  return diffLine.join(' ')
}

function toMetricDiffCell(metricDiff: MetricDiff): string {
  const lines = []
  if (metricDiff.diff === 0) {
    lines.push(metricDiff.new.avg)
  } else {
    lines.push(toMetricDiff(metricDiff.old, metricDiff.new, metricDiff.diff))
  }

  return lines.join('<br />')
}

function printAssetTableRow(asset: MetricDiff): string {
  return [
    asset.name,
    toMetricDiffCell(asset),
    conditionalPercentage(asset.diffPercentage)
  ].join(' | ')
}

export function printMetricTablesByGroup(statsDiff: ReportDiff): string {
  const statsFields = [
    'added',
    'removed',
    'slower',
    'faster',
    'unchanged'
  ] as const
  return statsFields
    .map(field => {
      const assets = statsDiff[field]
      if (assets.length === 0) {
        return `**${capitalize(field)}**

No metrics were ${field}`
      }

      return `**${capitalize(field)}**

${TABLE_HEADERS}
${assets
  .map(asset => {
    return printAssetTableRow(asset)
  })
  .join('\n')}`
    })
    .join('\n\n')
}
