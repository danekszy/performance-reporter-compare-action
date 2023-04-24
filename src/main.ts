import * as core from '@actions/core'
import {context, getOctokit} from '@actions/github'
import {getReportDiff} from './get-report-diff'
import {parseReportFileToJson} from './parse-report-file-to-json'
import {getCommentBody, getIdentifierComment} from './to-comment-body'

async function run(): Promise<void> {
  try {
    if (
      context.eventName !== 'pull_request' &&
      context.eventName !== 'pull_request_target'
    ) {
      throw new Error(
        'This action only supports pull_request and pull_request_target events'
      )
    }
    const {
      issue: {number: issue_number},
      repo: {owner, repo: repo_name}
    } = context
    const token = core.getInput('github-token')
    const currentReportJsonPath = core.getInput('current-report-json-path')
    const baseReportJsonPath = core.getInput('base-report-json-path')
    const title = core.getInput('title') ?? ''
    const {rest} = getOctokit(token)

    const [currentReportJson, baseReportJson, {data: comments}] =
      await Promise.all([
        parseReportFileToJson(currentReportJsonPath),
        parseReportFileToJson(baseReportJsonPath),
        rest.issues.listComments({
          repo: repo_name,
          owner,
          issue_number
        })
      ])

    const identifierComment = getIdentifierComment(title)

    const [currentComment, ...restComments] = comments.filter(
      comment =>
        comment.user?.login === 'github-actions[bot]' &&
        comment.body &&
        comment.body.includes(identifierComment)
    )

    const statsDiff = getReportDiff(baseReportJson, currentReportJson)

    const commentBody = getCommentBody(statsDiff, title)

    const promises: Promise<unknown>[] = []

    if (restComments.length > 1) {
      promises.push(
        ...restComments.map(async comment => {
          return rest.issues.deleteComment({
            repo: repo_name,
            owner,
            comment_id: comment.id
          })
        })
      )
    }

    if (currentComment) {
      promises.push(
        rest.issues.updateComment({
          issue_number,
          owner,
          repo: repo_name,
          body: commentBody,
          comment_id: currentComment.id
        })
      )
    } else {
      promises.push(
        rest.issues.createComment({
          issue_number,
          owner,
          repo: repo_name,
          body: commentBody
        })
      )
    }

    await Promise.all(promises)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
