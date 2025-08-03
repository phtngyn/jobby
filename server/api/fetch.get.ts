import type { Job, NewJobEmbedding } from '~~/shared/types'
import { Buffer } from 'node:buffer'
import { db } from '~~/db'
import { jobEmbeddings, jobs } from '~~/db/schema/jobs'

import { JobSchema } from '~~/shared/schemas'
import { embed } from '../ai/llm'
import { stringify } from '../ai/utils'

export default defineEventHandler(async () => {
  const headers = {
    'X-API-KEY': 'jobboerse-jobsuche',
    'Accept': 'application/json',
  }
  const response = await $fetch<{ stellenangebote: any[] }>('https://rest.arbeitsagentur.de/jobboerse/jobsuche-service/pc/v4/jobs?pav=false&berufsfeld=Informatik&wo=N%C3%BCrnberg&size=100&page=2', { headers })

  let i = 0
  for (const item of response.stellenangebote) {
    const refnr = item.refnr
    const encoded = Buffer.from(refnr).toString('base64')
    const detail = await $fetch<any>(`https://rest.arbeitsagentur.de/jobboerse/jobsuche-service/pc/v4/jobdetails/${encoded}`, { headers })

    const worktime = (() => {
      if (detail.arbeitszeitSchichtNachtWochenende)
        return 'PARTTIME'
      if (detail.arbeitszeitTeilzeitAbend)
        return 'PARTTIME'
      if (detail.arbeitszeitTeilzeitNachmittag)
        return 'PARTTIME'
      if (detail.arbeitszeitTeilzeitVormittag)
        return 'PARTTIME'
      if (detail.arbeitszeitTeilzeitFlexibel)
        return 'PARTTIME'
      if (detail.arbeitszeitVollzeit)
        return 'FULLTIME'
    })()

    const title = item.title ?? detail.stellenangebotsTitel
    const occupation = item.beruf ?? detail.hauptberuf
    const job: typeof jobs.$inferInsert = {
      id: refnr,
      title: (title ?? occupation)?.trim(),
      occupation: (occupation ?? title)?.trim() ?? null, // Default to null
      type: detail.stellenangebotsart ?? null,
      description: detail.stellenangebotsBeschreibung?.trim() ?? null,
      worktime: worktime ?? null,
      homeoffice: !!detail.arbeitszeitHeimarbeitTelearbeit,
      duration: detail.vertragsdauer ?? null,
      supervised: detail.istBetreut ?? false, // Default to false
      salary: detail.gehalt?.trim() ?? null,
      employer: detail.firma?.trim() ?? null,
      url: detail.allianzpartnerUrl?.trim() ?? null,
      publishAt: detail.eintrittszeitraum?.von ?? null,
      modifiedAt: detail.aenderungsdatum ?? null,
      street: item.arbeitsort?.strasse?.trim() ?? null,
      zip: item.arbeitsort?.plz?.trim() ?? null,
      city: item.arbeitsort?.stadt?.trim() ?? null,
      region: item.arbeitsort?.region?.trim() ?? null,
      country: item.arbeitsort?.land?.trim() ?? null,
      lat: item.arbeitsort?.koordinaten?.lat ?? null,
      lon: item.arbeitsort?.koordinaten?.lon ?? null,
    }

    const { data, error } = JobSchema.safeParse(job)
    // console.dir({ item, detail }, { depth: null })
    // console.dir({ data, error }, { depth: null })
    if (error) {
      console.log({ error, detail })
    }
    if (data) {
      console.log(i++)
      await db.insert(jobs).values(data).onConflictDoNothing({
        target: jobs.id,
      })

      const content = stringify(data as Job)
      const newJobEmbedding: NewJobEmbedding = {
        jobId: refnr,
        content,
        embedding: await embed(content, 'RETRIEVAL_DOCUMENT'),
      }
      await db.insert(jobEmbeddings).values(newJobEmbedding)
    }
  }

  return []
})
