<script setup lang="ts">
import type { TabsItem } from '#ui/types'
import type { Job } from '~~/shared/types'
import { JobSchema } from '~~/shared/schemas'

const state = ref<{
  file: File | undefined
  raw: string | undefined
  parsed: Job[] | undefined
}>({
  file: undefined,
  raw: undefined,
  parsed: undefined,
})

const container = useTemplateRef('container')

const tabs = ref<TabsItem[]>([
  {
    slot: 'parsed',
    label: 'Parsed',
  },
  {
    slot: 'raw',
    label: 'Raw',
  },
])

async function change() {
  const file = state.value.file
  if (!file)
    return

  const raw = await file.text()
  const parsed = JSON.parse(raw)

  if (!raw || !parsed || !Array.isArray(parsed))
    return

  state.value.raw = raw

  const _jobs: Job[] = parsed.map(x => ({
    jobId: String(x.Job_ID || ''),
    angebotstitel: String(x.Angebotstitel || ''),
    kurzbeschreibung: String(x.Kurzbeschreibung || ''),
    firma: String(x.Firma || ''),
    emailAnsprechpartner: String(x['E-Mail Ansprechpartner'] || ''),
    freigabedatum: new Date(x.Freigabedatum).toISOString(),
    arbeitsort: String(x.Arbeitsort || ''),
    anzeigeText: String(x.Anzeige_Text || ''),
    country: String(x.country || ''),
    einleitungTitel: x.EinleitungTitel ? String(x.EinleitungTitel) : undefined,
    einleitungText: x.EinleitungText ? String(x.EinleitungText) : undefined,
    aufgabenTitel: x.AufgabenTitel ? String(x.AufgabenTitel) : undefined,
    aufgabenText: x.AufgabenText ? String(x.AufgabenText) : undefined,
    erwartungenTitel: x.ErwartungenTitel ? String(x.ErwartungenTitel) : undefined,
    erwartungenText: x.ErwartungenText ? String(x.ErwartungenText) : undefined,
    angebotTitel: x.AngebotTitel ? String(x.AngebotTitel) : undefined,
    angebotText: x.AngebotText ? String(x.AngebotText) : undefined,
    kontaktTitel: x.KontaktTitel ? String(x.KontaktTitel) : undefined,
    kontaktText: x.KontaktText ? String(x.KontaktText) : undefined,
    spracheDeutsch: String(x.SpracheDeutsch) === '1',
    spracheLand: String(x.SpracheLand) === '1',
    arbeitszeitMin: Number(x.ArbeitszeitMin || 0),
    arbeitszeitMax: Number(x.ArbeitszeitMax || 0),
    berufsfelder: Array.isArray(x.berufsfelder) ? x.berufsfelder.map(String) : [],
    fachbereiche: Array.isArray(x.fachbereiche) ? x.fachbereiche.map(String) : [],
    homeoffice: (Array.isArray(x.homeoffice)
      ? (x.homeoffice as any[]).map(v => String(v).trim() as any)
      : []),
    jobtypen: Array.isArray(x.jobtypen)
      ? (x.jobtypen as any[]).map(v => String(v).trim() as any)
      : [],
  }))

  const result = JobSchema.array().safeParse(_jobs)
  if (!result.data)
    return

  state.value.parsed = result.data
}

async function ingest() {
  if (!state.value.parsed)
    return

  await $fetch('/api/jobs/create', {
    method: 'POST',
    body: {
      jobs: state.value.parsed,
    },
  })
}
</script>

<template>
  <UDashboardPanel
    :ui="{
      body: 'sm:p-4',
    }"
  >
    <template #header>
      <UDashboardNavbar title="Ingest" :ui="{ root: 'sm:p-4' }">
        <template #leading>
          <UDashboardSidebarCollapse />
          <span class="h-5 w-[1px] bg-(--ui-text-muted) ml-1 mr-2" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div ref="container" class="grid gap-2">
        <div class="flex justify-between">
          <p class="font-medium">
            Upload JSON for JOBS table
          </p>

          <UButton
            :disabled="!state.file"
            class="w-fit"
            variant="subtle"
            @click="ingest"
          >
            Ingest
          </UButton>
        </div>

        <UFileUpload
          v-model="state.file"
          label="Drag and drop a JSON file here, or click to browse"
          class="w-full"
          accept="application/json"
          layout="list"
          @change="change"
        />

        <UTabs
          :items="tabs"
          class="max-h-125"
          :style="{
            maxWidth: container?.offsetWidth ? `${container!.offsetWidth}px` : 'none',
          }"
          color="neutral"
        >
          <template
            v-if="state.parsed"
            #parsed
          >
            <div class="overflow-auto border rounded-md">
              <UTable :data="state.parsed" />
            </div>
          </template>

          <template
            v-if="state.raw"
            #raw
          >
            <MDCCached :value="`<pre>${state.raw}</pre>`" />
          </template>
        </UTabs>
      </div>
    </template>
  </UDashboardPanel>
</template>
