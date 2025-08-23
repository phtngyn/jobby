import type { Job } from '~~/shared/types'
import { convert } from 'html-to-text'
import { z } from 'zod'
import { embedMany } from '~~/server/ai/llm'
import { JobChunksTable } from '~~/server/db/schema/job_chunks'
import { JobsTable } from '~~/server/db/schema/jobs'
import { db } from '~~/server/utils/drizzle'
import { JOB_SEARCH_TARGET_COLUMNS } from '~~/shared/constants'
import { JobSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const { jobs: _jobs } = await readValidatedBody(
    event,
    z.object({ jobs: JobSchema.array() }).parse,
  )

  const parsed = _jobs.map(j => ({
    ...j,
    freigabedatum: new Date(j.freigabedatum),
  }))

  let created: Job[] | undefined
  await db.transaction(async (tx) => {
    created = await tx
      .insert(JobsTable)
      .values(parsed)
      .onConflictDoNothing({ target: JobsTable.jobId })
      .returning() as any

    if (!created)
      return

    const promises = created.map(async (job) => {
      for (const col of JOB_SEARCH_TARGET_COLUMNS) {
        const text = job[col]
        if (!text)
          continue

        const chunks = sentencize(text)
        if (!chunks.length)
          continue

        const embeddings = await embedMany(chunks)

        await tx.insert(JobChunksTable).values(
          chunks.map((c, i) => ({
            jobId: job.jobId,
            type: col,
            chunkIndex: i,
            content: c,
            embedding: embeddings[i],
          })),
        )
      }
    })

    await Promise.all(promises)
  })

  return created
})

function sentencize(input: string) {
  if (typeof input !== 'string')
    return []

  const text = convert(input, {
    wordwrap: false,
    decodeEntities: true,
    preserveNewlines: true,
    formatters: {
      liWithDot(elem, walk, builder) {
        builder.openBlock({ leadingLineBreaks: 1 })
        walk(elem.children, builder)
        builder.closeBlock({ trailingLineBreaks: 1 })
      },
    },
    selectors: [
      { selector: 'li', format: 'liWithDot' },
      { selector: 'ul', format: 'inline' },
      { selector: 'ol', format: 'inline' },
      { selector: 'p', format: 'inline' },
    ],
  })

  const items = text.trim().split(/\r?\n+/)

  const sentences = items.flatMap((item) => {
    const sentence = item.toLowerCase()
      .replace(/[.,!?;:()"'`]/g, '')
      .replace(/[•\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '')
      .replace(/^[^a-z0-9]+|[^a-z0-9]+$/gi, '')
      .trim()

    return sentence ? [sentence] : []
  })

  return sentences
}
