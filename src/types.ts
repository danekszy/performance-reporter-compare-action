export type TestAttributes = {
  avg: number
  stdDev: number
}

export type MetricDiff = {
  name: string
  new: TestAttributes
  old: TestAttributes
  diff: number
  diffPercentage: number
}

export type ReportDiff = {
  added: MetricDiff[]
  removed: MetricDiff[]
  slower: MetricDiff[]
  faster: MetricDiff[]
  unchanged: MetricDiff[]
}

export type ReportCompilation = {
  [key: string]: TestAttributes
}
