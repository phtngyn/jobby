<script setup lang="ts">
import type { Job } from '~~/shared/types'

const filters = ref({
  search: '',
})

const { data: jobs, status, error, execute } = await useAsyncData(
  'jobs',
  () => $fetch<Job[]>('/api/jobs', {
    method: 'POST',
    body: { filters: filters.value },
  }),
  {
    default: () => [] as Job[],
    lazy: true,
    immediate: false,
  },
)

watchThrottled(
  filters,
  () => { execute() },
  { throttle: 1000, deep: true, immediate: true },
)

function dragstart(event: DragEvent) {
  const target = event.target as HTMLAnchorElement
  const id = target.dataset.id

  if (!id || !event.dataTransfer)
    return

  event.dataTransfer.setData('text/plain', id)
}

function clearFilters() {
  // for (const [k, v] of Object.entries(filters.value)) {
  //   if (typeof v === 'string') {
  //     filters.value[k as keyof typeof filters['value']] = '' as any
  //   }
  //   else if ('children' in v) {
  //     for (const c of v.children) {
  //       c.checked = false
  //     }
  //   }
  //   else {
  //     v.checked = false
  //   }
  // }
}
</script>

<template>
  <UDashboardPanel :ui="{ body: 'sm:p-4' }">
    <template #header>
      <UDashboardNavbar title="Open Jobs" :ui="{ root: 'sm:p-4' }">
        <template #leading>
          <UDashboardSidebarCollapse />
          <span class="h-5 w-px bg-(--ui-text-dimmed) ml-1 mr-2" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="@container grid gap-4">
        <div class="flex items-center">
          <UInput
            v-model="filters.search"
            leading-icon="i-lucide-search"
            placeholder="Search: title, company, keyword"
            class="w-full max-w-sm"
            variant="subtle"
          >
            <template v-if="filters.search.length" #trailing>
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

          <UPopover :content="{ align: 'end' }">
            <UButton
              label="Filter"
              color="neutral"
              variant="subtle"
              class="ml-auto"
              icon="i-lucide-funnel"
            />

            <template #content>
              <div class="p-4 max-w-96 grid gap-2">
                <!-- <template
                  v-for="[k, v] in Object.entries(filters)"
                  :key="k"
                >
                </template> -->
              </div>
            </template>
          </UPopover>
        </div>

        <div class="flex items-center">
          <div class="group flex items-center gap-2 h-7">
            <UBadge
              v-if="filters.search"
              variant="subtle"
              size="lg"
              data-slot="badge"
            >
              Search: {{ filters.search }}
            </UBadge>

            <!-- <template
              v-for="[k, v] in Object.entries(filters)"
              :key="k"
            >
              <template v-if="typeof v !== 'string'">
                <template v-if="'children' in v">
                  <template
                    v-for="c in v.children"
                    :key="c.label"
                  >
                    <UBadge
                      v-if="c.checked"
                      variant="subtle"
                      size="lg"
                      data-slot="badge"
                      class="items-center"
                    >
                      {{ c.label }}

                      <template #trailing>
                        <button
                          class="flex-center"
                          @click="c.checked = false"
                        >
                          <UIcon name="i-lucide-x" />
                        </button>
                      </template>
                    </UBadge>
                  </template>
                </template>

                <template v-else>
                  <UBadge
                    v-if="v.checked"
                    variant="subtle"
                    size="lg"
                    data-slot="badge"
                  >
                    {{ v.label }}

                    <template #trailing>
                      <button
                        class="flex-center"
                        @click="v.checked = false"
                      >
                        <UIcon name="i-lucide-x" />
                      </button>
                    </template>
                  </UBadge>
                </template>
              </template>
            </template> -->

            <UButton
              size="sm"
              variant="ghost"
              class="hidden group-has-[[data-slot=badge]]:inline-flex "
              @click="clearFilters"
            >
              Clear all
            </UButton>
          </div>

          <span class="ml-auto text-sm text-muted font-medium">Show {{ jobs?.length }} results</span>
        </div>

        <template v-if="status === 'success'">
          <div class="grid grid-cols-2 @min-6xl:grid-cols-3 gap-4">
            <NuxtLink
              v-for="job in jobs"
              :key="job.jobId"
              class="group relative p-4 flex flex-col bg-default border border-accented rounded-md h-full hover:border-inverted/80 transition-colors"
              :to="`/jobs/${job.jobId}`"
              :data-id="job.jobId"
              draggable="true"
              @dragstart="dragstart"
            >
              <div class="absolute top-4 right-4">
                <UIcon name="i-lucide-grip-vertical" class="text-dimmed group-hover:text-(--ui-text) transition-colors" />
              </div>

              <div class="flex gap-2 -ml-1 mb-2">
                <UBadge
                  v-for="(typ, i) in job.jobtypen"
                  :key="typ"
                  :color="i === 0 ? 'primary' : 'neutral'"
                  :variant="i === 0 ? 'subtle' : 'subtle'"
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
                      {{ job.arbeitszeitMax }}h
                    </template>
                    <template v-else>
                      {{ job.arbeitszeitMin }}-{{ job.arbeitszeitMax }}h
                    </template>
                  </UBadge>
                  <UBadge v-if="job.homeoffice" color="neutral" variant="outline">
                    <UIcon name="i-lucide-house" /> {{ job.homeoffice[0] }}
                  </UBadge>
                </div>
              </div>

              <div class="text-sm text-muted line-clamp-2 mb-4">
                {{ job.kurzbeschreibung }}
              </div>

              <div class="mt-auto border-t border-accented pt-4">
                <div class="flex items-center gap-2 text-xs text-dimmed">
                  <UIcon name="i-lucide-calendar" /> Update {{ job.freigabedatum }}
                </div>
              </div>
            </NuxtLink>
          </div>
        </template>

        <template v-else-if="status === 'error'">
          <p class="text-error">
            {{ error }}
          </p>
        </template>

        <template v-else>
          <div class="grid grid-cols-2 @min-6xl:grid-cols-3 gap-4">
            <div
              v-for="i in 10"
              :key="i"
              class="p-4 flex flex-col bg-default border border-accented rounded-md"
            >
              <USkeleton class="h-4 w-full mb-4" />

              <div class="grid gap-1.5 text-sm mb-4">
                <USkeleton class="h-4 w-50" />

                <USkeleton class="h-4 w-50" />

                <div class="flex items-center gap-2 my-1">
                  <USkeleton class="h-4 w-25" />

                  <USkeleton class="h-4 w-25" />

                  <USkeleton class="h-4 w-25" />
                </div>
              </div>

              <div class="mt-auto">
                <USkeleton class="h-4 w-full mb-2" />
                <USkeleton class="h-4 w-full" />

                <div class="w-full h-px mt-4 mb-3 bg-accented" />

                <USkeleton class="h-4 w-60" />
              </div>
            </div>
          </div>
        </template>
      </div>
    </template>
  </UDashboardPanel>
</template>
