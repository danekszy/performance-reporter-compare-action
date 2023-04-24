import {printMetricTablesByGroup} from './print-markdown'
import type {ReportDiff} from './types'

export function getIdentifierComment(key: string): string {
  return `<!--- bundlestats-action-comment${key ? ` key:${key}` : ''} --->`
}

export function getCommentBody(reportDiff: ReportDiff, title: string): string {
  return `
# Performance Report${title ? `-${title}` : ''}

Here are the results of performance testing.

<details>
<summary>View detailed test metric breakdown</summary>

<div>

${printMetricTablesByGroup(reportDiff)}

</div>
</details>

${getIdentifierComment(title)}
`
}
