<script setup lang="ts">
import type { Job } from '~~/shared/types'
import { DEFAULT_FILTER } from '~~/shared/constants'

const { user } = useUserSession()

const store = useGlobalStore()

const filters = ref(structuredClone(DEFAULT_FILTER))

const { data, status, error } = await useFetch<Job[]>('/api/jobs/select', {
  method: 'POST',
  key: 'jobs',
  body: { filters, limit: 100 },
  lazy: true,
  immediate: true,
  dedupe: 'cancel',
  default: () => [] as Job[],
})

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
</script>

<template>
  <Panel>
    <PanelHeader page>
      <span>Open Jobs</span>
    </PanelHeader>

    <PanelBody>
      <LazyModalRegister v-if="!user" />

      <div class="@container grid gap-4">
        <JobsFilter v-model="filters" :length="data.length" />

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
              :key="job.id"
              class="group relative p-4 flex flex-col bg-default border border-accented rounded-md h-full hover:border-inverted/80 transition-colors"
              :to="`/jobs/${job.id}`"
              :data-id="job.id"
              draggable="true"
              @dragstart="dragstart"
              @dragend="dragend"
            >
              <div class="absolute top-4 right-4">
                <UIcon name="i-lucide-grip-vertical" class="text-dimmed group-hover:text-(--ui-text) transition-colors" />
              </div>

              <div class="flex flex-wrap gap-2 -ml-1 mb-2">
                <UBadge
                  v-for="(typ, i) in job.categories.split('|')"
                  :key="typ"
                  :color="i === 0 ? 'primary' : 'neutral'"
                  variant="subtle"
                >
                  {{ typ }}
                </UBadge>
              </div>

              <h2 class="font-semibold text-lg leading-tight line-clamp-2 text-balance h-[calc(1.125rem*var(--leading-tight)*2)] mb-4">
                {{ job.title }}
              </h2>

              <div class="grid gap-1.5 text-sm mb-4">
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-building-2" /> {{ job.company }}
                </div>
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-map-pin" /> {{ job.location }}
                </div>

                <div class="flex flex-wrap items-center gap-2 my-1">
                  <UBadge v-if="job.types" color="neutral" variant="outline">
                    <UIcon name="i-lucide-briefcase-business" /> {{ job.types }}
                  </UBadge>

                  <UBadge color="neutral" variant="outline">
                    <UIcon name="i-lucide-clock" />
                    {{ job.worktime_min }}-{{ job.worktime_max }}h/week
                  </UBadge>

                  <UBadge v-if="job.homeoffice" color="neutral" variant="outline">
                    <UIcon name="i-lucide-house" /> {{ job.homeoffice }}
                  </UBadge>
                </div>
              </div>

              <div class="text-sm text-muted line-clamp-2 mb-4">
                {{ job.short_description }}
              </div>

              <div class="mt-auto border-t border-accented pt-4">
                <div class="flex items-center gap-2 text-xs text-dimmed">
                  <UIcon name="i-lucide-calendar" /> Updated {{ job.updated_at }}
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
