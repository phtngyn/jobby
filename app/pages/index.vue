<script setup lang="ts">
import type { Job } from '~~/shared/schemas'
import type { Filters } from '~~/shared/types'

const filters = ref<Filters>({
  search: '',
  type: {
    label: 'Type',
    children: [
      { label: 'Arbeit', value: 'ARBEIT', checked: false },
      { label: 'Ausbildung', value: 'AUSBILDUNG', checked: false },
      { label: 'Praktikum', value: 'PRAKTIKUM_TRAINEE', checked: false },
      { label: 'Selbständigkeit', value: 'SELBSTAENDIGKEIT', checked: false },
      { label: 'Künstler', value: 'KUENSTLER', checked: false },
    ],
  },
  worktime: {
    label: 'Worktime',
    children: [
      { label: 'Full-time', value: 'FULLTIME', checked: false },
      { label: 'Part-time', value: 'PARTTIME', checked: false },
    ],
  },
  duration: {
    label: 'Duration',
    children: [
      { label: 'Temporary', value: 'BEFRISTET', checked: false },
      { label: 'Permanent', value: 'UNBEFRISTET', checked: false },
    ],
  },
  homeoffice: {
    label: 'Homeoffice',
    value: 'true',
    checked: false,
  },
})

const { data: jobs, status, error, execute } = await useAsyncData(
  'jobs',
  () => $fetch('/api/jobs', {
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
  for (const [k, v] of Object.entries(filters.value)) {
    if (typeof v === 'string') {
      filters.value[k as keyof typeof filters['value']] = '' as any
    }
    else if ('children' in v) {
      for (const c of v.children) {
        c.checked = false
      }
    }
    else {
      v.checked = false
    }
  }
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
                <template
                  v-for="[k, v] in Object.entries(filters)"
                  :key="k"
                >
                  <template v-if="typeof v !== 'string'">
                    <template v-if="'children' in v">
                      <div class="grid gap-1">
                        <span class="text-xs font-medium">{{ v.label }}</span>
                        <div class="grid gap-1.5">
                          <UCheckbox
                            v-for="c in v.children"
                            :key="c.label"
                            v-model="c.checked"
                            :label="c.label"
                            :value="c.value"
                          />
                        </div>
                      </div>
                    </template>

                    <template v-else>
                      <UCheckbox
                        v-model="v.checked"
                        :label="v.label"
                        :value="v.value"
                      />
                    </template>

                    <USeparator orientation="horizontal" class="h-1 last:hidden" :ui="{ container: 'my-0' }" />
                  </template>
                </template>
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

            <template
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
            </template>

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
              :key="job.id"
              class="p-4 flex flex-col bg-default border border-accented rounded-md h-full hover:border-inverted/80 transition-colors"
              :to="`/jobs/${job.id}`"
              :data-id="job.id"
              draggable="true"
              @dragstart="dragstart"
            >
              <h2 class="font-semibold text-lg leading-tight line-clamp-2 text-balance h-[calc(1.125rem*var(--leading-tight)*2)] mb-4">
                {{ job.title }}
              </h2>

              <div class="grid gap-1.5 text-sm mb-4">
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-building-2" /> {{ job.employer }}
                </div>
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-map-pin" /> {{ job.region }}, {{ job.country }}
                </div>

                <div class="flex items-center gap-2 my-1">
                  <UBadge v-if="job.type" color="neutral" variant="outline">
                    <UIcon name="i-lucide-briefcase-business" /> {{ job.type }}
                  </UBadge>
                  <UBadge v-if="job.worktime" color="neutral" variant="outline">
                    <UIcon name="i-lucide-hourglass" /> {{ job.worktime }}
                  </UBadge>
                  <UBadge v-if="job.duration" color="neutral" variant="outline">
                    <UIcon name="i-lucide-briefcase-business" /> {{ job.duration }}
                  </UBadge>
                  <UBadge v-if="job.homeoffice" color="neutral" variant="outline">
                    <UIcon name="i-lucide-house" /> Homeoffice
                  </UBadge>
                </div>
              </div>

              <div class="mt-auto">
                <div class="text-sm line-clamp-2 text-balance">
                  {{ job.description?.substring(0, 250) }}
                </div>

                <div class="w-full h-px my-4 bg-accented" />

                <div class="flex items-center gap-2 text-xs text-muted">
                  <UIcon name="i-lucide-calendar" /> Update {{ job.modifiedAt }}
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
