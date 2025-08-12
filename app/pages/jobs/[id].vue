<script setup lang="ts">
import type { Job } from '~~/shared/types'

const route = useRoute()

const { data: job } = await useFetch<Job>(`/api/jobs/${route.params.id}`, {
  cache: 'force-cache',
})

if (!job.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Job not found!',
    fatal: true,
  })
}

const favorited = shallowRef(false)
</script>

<template>
  <UDashboardPanel
    v-if="job"
    :ui="{
      body: 'sm:p-4',
    }"
  >
    <template #header>
      <UDashboardNavbar :ui="{ root: 'sm:p-4' }">
        <template #title>
          <div class="flex items-center gap-2">
            <NuxtLink to="/" class="underline underline-offset-2">
              Open Jobs
            </NuxtLink>
            <UIcon name="i-lucide-chevron-right" class="size-4.5" />
            <span class="text-muted">#{{ job.jobId }}</span>
          </div>
        </template>
        <template #leading>
          <UDashboardSidebarCollapse />
          <span class="h-5 w-[1px] bg-(--ui-text-muted) ml-1 mr-2" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div>
        <div class="flex justify-between">
          <div>
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

            <h2 class="font-semibold text-2xl leading-tight text-balance mb-4">
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
          </div>

          <div>
            <UButton
              icon="i-lucide-heart"
              :variant="favorited ? 'subtle' : 'ghost'"
              @click="favorited = !favorited"
            >
              {{ favorited ? 'Favorited' : 'Favorite' }}
            </UButton>
          </div>
        </div>

        <div class="text-sm">
          <template
            v-for="key in ['anzeigeText',
                           'einleitungTitel',
                           'einleitungText',
                           'aufgabenTitel',
                           'aufgabenText',
                           'erwartungenTitel',
                           'erwartungenText',
                           'angebotTitel',
                           'angebotText',
                           'kontaktTitel',
                           'kontaktText',
            ] as (keyof typeof job)[]"
            :key="key"
          >
            <MDCCached
              v-if="job[key]"
              :value="job[key].toString()"
              :cache-key="`${job.jobId}-${key}`"
            />
          </template>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
