import type { Job } from '~~/shared/types'
import { tool } from 'ai'
import { z } from 'zod'

export function get_job_tool(jobs: Job[] | undefined) {
  console.log(jobs)

  return tool({
    description: '',
    name: '',
    inputSchema: z.object(),
    outputSchema: z.object(),
    execute() {
      return {}
    },
  })
}
