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
  <Panel v-if="job">
    <PanelHeader page>
      <div class="flex items-center gap-2">
        <NuxtLink to="/" class="underline underline-offset-2">
          Open Jobs
        </NuxtLink>
        <UIcon name="i-lucide-chevron-right" class="size-4.5" />
        <span class="text-muted">#{{ job.jobId }}</span>
      </div>
    </PanelHeader>

    <PanelBody>
      <div>
        <div class="flex justify-between">
          <div>
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

            <h2 class="font-semibold text-2xl leading-tight text-balance mb-4">
              {{ job.angebotstitel }}
            </h2>

            <div class="grid gap-1.5 text-sm mb-4">
              <div class="flex items-center gap-2 *:shrink-0">
                <UIcon name="i-lucide-building-2" /> {{ job.firma }}
              </div>
              <div class="flex items-center gap-2 *:shrink-0">
                <UIcon name="i-lucide-map-pin" /> {{ job.arbeitsort }}
              </div>

              <div class="flex flex-wrap items-center gap-2 my-1">
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

        <div>
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
    </PanelBody>
  </Panel>
</template>
