/* eslint-disable unused-imports/no-unused-vars */
import type { ChatWriter, Filters } from '~~/shared/types'
import { tool } from 'ai'
import { z } from 'zod'

export function getFilters(writer: ChatWriter) {
  return (_filters: Filters) => tool({
    description: '',
    name: '',
    inputSchema: z.object({ prompt: z.string() }),
    outputSchema: z.object(),
    async execute({ prompt }, { toolCallId: id }) {
      // writer.write({
      //   type: 'data-weather',
      //   data: { city: prompt, weather: '', status: 'loading' },
      //   id,
      // })
      return {}
    },
  })
}
