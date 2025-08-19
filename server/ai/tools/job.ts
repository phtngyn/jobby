/* eslint-disable unused-imports/no-unused-vars */
import type { ChatWriter, Job } from '~~/shared/types'
import { tool } from 'ai'
import { z } from 'zod'

export function getRecommendedJobs(writer: ChatWriter) {
  return (_jobs?: Job[]) => tool({
    description: '',
    name: '',
    inputSchema: z.object({ prompt: z.string() }),
    outputSchema: z.object(),
    async execute({ prompt }, { toolCallId }) {
      // writer.write({
      //   type: 'data-weather',
      //   data: { city: prompt, weather: '', status: 'loading' },
      //   id: toolCallId,
      // })
      return {}
    },
  })
}
