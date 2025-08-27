<script setup lang="ts">
import type { Filters, Job } from '~~/shared/types'
import { JOB_DOMAINS, JOB_FIELDS, JOB_HOMEOFFICES, JOB_TYPES, JOB_WORKINGTIMES } from '~~/shared/constants'

const { user } = useUserSession()

const store = useGlobalStore()

const filters = ref<Filters>({
  search: '',
  types: [],
  fields: [],
  domains: [],
  homeoffices: [],
  workingtimes: [JOB_WORKINGTIMES.min, JOB_WORKINGTIMES.max],
})

const { data, status, error, execute } = await useAsyncData(
  'jobs',
  () => $fetch<Job[]>('/api/jobs/select', {
    method: 'POST',
    body: { filters: filters.value },
  }),
  {
    lazy: true,
    immediate: false,
  },
)

watchThrottled(
  filters,
  async () => {
    await execute({ dedupe: 'cancel' })
  },
  { throttle: 1000, deep: true, immediate: true, flush: 'post' },
)

function dragstart(event: DragEvent) {
  const target = event.target as HTMLAnchorElement
  const id = target.dataset.id

  if (!id || !event.dataTransfer) {
    event.preventDefault()
    return
  }

  store.dragging = true
  event.dataTransfer.setData('text/plain', id)
}

function dragend() {
  store.dragging = false
}

function clearFilters() {
  filters.value = {
    search: '',
    types: [],
    fields: [],
    domains: [],
    homeoffices: [],
    workingtimes: [JOB_WORKINGTIMES.min, JOB_WORKINGTIMES.max],
  }
}
</script>

<template>
  <Panel>
    <PanelHeader page>
      <span>Open Jobs</span>
    </PanelHeader>

    <PanelBody>
      <LazyModalRegister v-if="!user" />

      <div class="@container grid gap-4">
        <div class="flex items-center">
          <UInput
            v-model="filters.search"
            leading-icon="i-lucide-search"
            placeholder="Search for title, company, keyword"
            class="w-full max-w-sm"
            variant="subtle"
          >
            <template v-if="filters?.search?.length" #trailing>
              <UButton
                color="neutral"
                variant="link"
                size="sm"
                icon="i-lucide-x"
                aria-label="Clear input"
                @click="filters.search = ''"
              />
            </template>
          </UInput>

          <UPopover
            :content="{ align: 'end' }"
          >
            <UButton
              label="Filter"
              color="neutral"
              variant="subtle"
              class="ml-auto"
              icon="i-lucide-funnel"
            />

            <template #content>
              <div class="p-4 grid gap-4">
                <UCheckboxGroup
                  v-model="filters.types"
                  size="lg"
                  legend="Types"
                  :items="JOB_TYPES"
                  :ui="{ item: 'mb-1', legend: 'mb-2' }"
                />

                <fieldset>
                  <legend class="block font-medium text-sm mb-2">
                    Fields
                  </legend>
                  <USelectMenu
                    v-model="filters.fields"
                    placeholder="Select fields"
                    class="w-80"
                    icon="i-lucide-search"
                    multiple
                    :items="JOB_FIELDS"
                  />
                </fieldset>

                <fieldset>
                  <legend class="block font-medium text-sm mb-2">
                    Domains
                  </legend>
                  <USelectMenu
                    v-model="filters.domains"
                    placeholder="Select domains"
                    class="w-80"
                    icon="i-lucide-search"
                    multiple
                    :items="JOB_DOMAINS"
                  />
                </fieldset>

                <UCheckboxGroup
                  v-model="filters.homeoffices"
                  size="lg"
                  legend="Homeoffice"
                  :items="JOB_HOMEOFFICES"
                  :ui="{ item: 'mb-1', legend: 'mb-2' }"
                />

                <fieldset>
                  <legend class="block font-medium text-sm mb-4">
                    Working time
                    <span class="text-dimmed">
                      ({{ filters?.workingtimes?.[0] }}-{{ filters?.workingtimes?.[1] }}h)
                    </span>
                  </legend>
                  <USlider
                    v-model="filters.workingtimes"
                    :min="JOB_WORKINGTIMES.min"
                    :max="JOB_WORKINGTIMES.max"
                  />
                </fieldset>
              </div>
            </template>
          </UPopover>
        </div>

        <div class="group flex items-center">
          <div class="group flex items-center gap-2 h-7">
            <UBadge
              v-if="filters.search"
              data-slot="badge"
              color="neutral"
              variant="subtle"
              size="lg"
            >
              Search: {{ filters.search }}
            </UBadge>

            <template
              v-for="[k, v] in Object.entries(filters) as [keyof Filters, Filters[keyof Filters]][]"
              :key="k"
            >
              <template v-if="k === 'search'" />
              <template v-else-if="k === 'workingtimes'">
                <UBadge
                  v-if="v?.[0] !== JOB_WORKINGTIMES.min || v?.[1] !== JOB_WORKINGTIMES.max "
                  data-slot="badge"
                  class="items-center"
                  color="neutral"
                  variant="subtle"
                  size="lg"
                >
                  {{ `${v?.[0]} - ${v?.[1]}h` }}

                  <template #trailing>
                    <button
                      class="flex-center"
                      @click="filters.workingtimes = [
                        JOB_WORKINGTIMES.min,
                        JOB_WORKINGTIMES.max,
                      ]"
                    >
                      <UIcon name="i-lucide-x" />
                    </button>
                  </template>
                </UBadge>
              </template>

              <template
                v-for="x in v"
                v-else
                :key="x"
              >
                <UBadge
                  data-slot="badge"
                  class="items-center"
                  color="neutral"
                  variant="subtle"
                  size="lg"
                >
                  {{ x }}

                  <template #trailing>
                    <button
                      class="flex-center"
                      @click="filters[k] = filters[k]?.filter(f => f !== x)"
                    >
                      <UIcon name="i-lucide-x" />
                    </button>
                  </template>
                </UBadge>
              </template>
            </template>

            <UButton
              size="sm"
              variant="ghost"
              class="hidden group-has-[[data-slot=badge]]:inline-flex"
              @click="clearFilters"
            >
              Clear all
            </UButton>
          </div>

          <span
            v-if="data"
            class="group-has-[[data-slot=badge]]:ml-auto text-sm text-muted font-medium"
            data-allow-mismatch
          >
            Show {{ data.length }} results
          </span>
        </div>

        <template v-if="status === 'pending' || status === 'idle'">
          <ul class="grid grid-cols-1 @min-3xl:grid-cols-2 @min-6xl:grid-cols-3 gap-4">
            <li
              v-for="j in 10"
              :key="j"
              class="p-4 flex flex-col bg-default border border-accented rounded-md h-full"
            >
              <div class="flex gap-2 mb-2">
                <USkeleton
                  v-for="t in 2"
                  :key="t"
                  class="w-1/4 h-4"
                />
              </div>

              <USkeleton class="w-full h-4 mb-4" />

              <div class="grid gap-1.5 text-sm mb-4">
                <USkeleton class="w-2/5 h-4" />
                <USkeleton class="w-3/5 h-4" />

                <div class="flex items-center gap-2 my-1">
                  <USkeleton class="w-1/5 h-4" />
                  <USkeleton class="w-1/5 h-4" />
                </div>
              </div>

              <div class="grid gap-2 mb-4">
                <USkeleton class="w-full h-4" />
                <USkeleton class="w-full h-4" />
              </div>

              <div class="mt-auto border-t border-accented pt-4">
                <USkeleton class="w-1/2 h-4" />
              </div>
            </li>
          </ul>
        </template>

        <template v-else-if="status === 'success'">
          <div
            v-if="data?.length"
            class="grid grid-cols-1 @min-3xl:grid-cols-2 @min-6xl:grid-cols-3 gap-4"
          >
            <NuxtLink
              v-for="job in data"
              :key="job.jobId"
              class="group relative p-4 flex flex-col bg-default border border-accented rounded-md h-full hover:border-inverted/80 transition-colors"
              :to="`/jobs/${job.jobId}`"
              :data-id="job.jobId"
              draggable="true"
              @dragstart="dragstart"
              @dragend="dragend"
            >
              <div class="absolute top-4 right-4">
                <UIcon name="i-lucide-grip-vertical" class="text-dimmed group-hover:text-(--ui-text) transition-colors" />
              </div>

              <div class="flex flex-wrap gap-2 -ml-1 mb-2">
                <UBadge
                  v-for="(typ, i) in job.jobtypen.split('|')"
                  :key="typ"
                  :color="i === 0 ? 'primary' : 'neutral'"
                  variant="subtle"
                >
                  {{ typ }}
                </UBadge>
              </div>

              <h2 class="font-semibold text-lg leading-tight line-clamp-2 text-balance h-[calc(1.125rem*var(--leading-tight)*2)] mb-4">
                {{ job.angebotstitel }}
              </h2>

              <div class="grid gap-1.5 text-sm mb-4">
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-building-2" /> {{ job.firma }}
                </div>
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-map-pin" /> {{ job.arbeitsort }}
                </div>

                <div class="flex items-center gap-2 my-1">
                  <UBadge color="neutral" variant="outline">
                    <UIcon name="i-lucide-clock" />
                    <template v-if="job.arbeitszeitMin >= job.arbeitszeitMax">
                      {{ job.arbeitszeitMax }}h/week
                    </template>
                    <template v-else>
                      {{ job.arbeitszeitMin }}-{{ job.arbeitszeitMax }}h/week
                    </template>
                  </UBadge>
                  <UBadge color="neutral" variant="outline">
                    <UIcon name="i-lucide-house" /> {{ job.homeoffice }}
                  </UBadge>
                </div>
              </div>

              <div class="text-sm text-muted line-clamp-2 mb-4">
                {{ job.kurzbeschreibung }}
              </div>

              <div class="mt-auto border-t border-accented pt-4">
                <div class="flex items-center gap-2 text-xs text-dimmed">
                  <UIcon name="i-lucide-calendar" /> Updated {{ job.freigabedatum }}
                </div>
              </div>
            </NuxtLink>
          </div>

          <div
            v-else
            class="flex-center mt-10"
          >
            <UCard class="w-full max-w-100 text-center" :ui="{ body: 'flex-center flex-col gap-2' }">
              <div class="size-16 rounded-full bg-accented flex-center">
                <UIcon name="i-lucide-funnel" class="size-6" />
              </div>
              <p class="text-lg font-medium">
                No jobs match your filters
              </p>
              <p class="text-sm text-muted text-pretty">
                Try adjusting your search criteria or clearing some filters to see more results.
              </p>

              <UButton
                class="mt-2"
                variant="subtle"
                @click="clearFilters"
              >
                Clear all filters
              </UButton>
            </UCard>
          </div>
        </template>

        <template v-else>
          <div class="flex-center mt-10">
            <UCard class="w-full max-w-100 text-center" :ui="{ body: 'flex-center flex-col gap-2' }">
              <div class="size-16 rounded-full bg-accented flex-center">
                <UIcon name="i-lucide-ban" class="size-6" />
              </div>
              <p class="text-lg font-medium">
                Error
              </p>
              <p class="text-sm text-muted text-pretty">
                {{ error }}
              </p>

              <UButton
                class="mt-2"
                variant="subtle"
                color="error"
                @click="reloadNuxtApp()"
              >
                Reload Page
              </UButton>
            </UCard>
          </div>
        </template>
      </div>
    </PanelBody>
  </Panel>
</template>
