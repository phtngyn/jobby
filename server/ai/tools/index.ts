import type { ChatWriter } from '~~/shared/types'
import { getFilters } from './filter'
import { getRecommendedJobs } from './job'

export function getTools(writer: ChatWriter) {
  return {
    getRecommendedJobs: getRecommendedJobs(writer),
    getFilters: getFilters(writer),
  }
}
