import type { ChatWriter } from '~~/shared/types'
import { getFilters } from './filter'
import { getJobs } from './job'

export function getTools(writer: ChatWriter) {
  return {
    get_jobs: getJobs(writer),
    get_filters: getFilters(writer),
  }
}
