import type { TypeEnum } from '~~/db/schema/jobs'
import type { Job, JobNoDescription } from '~~/shared/types'

export function stringify(job: Job | JobNoDescription) {
  const parts: string[] = []

  if (job.title) {
    parts.push(`Job Title: ${job.title}`)
  }

  if (job.occupation) {
    parts.push(`Occupation: ${job.occupation}`)
  }

  if (job.employer) {
    parts.push(`Employer: ${job.employer}`)
  }

  const jobTypeMap: Record<
  (typeof TypeEnum.enumValues)[number],
  string
  > = {
    SELBSTAENDIGKEIT: 'Freelance',
    PRAKTIKUM_TRAINEE: 'Internship/Trainee',
    KUENSTLER: 'Artist',
    AUSBILDUNG: 'Apprenticeship',
    ARBEIT: 'Work',
  }
  if (job.type && jobTypeMap[job.type]) {
    parts.push(`Job Type: ${jobTypeMap[job.type]}`)
  }

  if (job.worktime) {
    parts.push(`Work Schedule: ${job.worktime}`)
  }

  parts.push(
    `Home Office: ${job.homeoffice ? 'Yes' : 'No'}`,
  )

  if (job.salary) {
    parts.push(`Salary: ${job.salary}`)
  }

  const DESCRIPTION_WORD_LIMIT = 100
  if ('description' in job && job.description) {
    const description = job.description.replace(/\s+/g, ' ').trim()
    const words = description.split(/\s+/)
    const snippet = words.slice(0, DESCRIPTION_WORD_LIMIT).join(' ')
    const ellipsis = words.length > DESCRIPTION_WORD_LIMIT ? '...' : ''
    parts.push(`Description: ${snippet}${ellipsis}`)
  }

  return `${parts.join('. ')}.`
}
