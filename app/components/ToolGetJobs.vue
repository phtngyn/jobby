<script setup lang="ts">
import type { ToolUIPart } from 'ai'
import type { ChatToolSet } from '~~/shared/types'

type Part = Extract<ToolUIPart<ChatToolSet>, { type: 'tool-get_jobs' }>

const props = defineProps<{
  state: Part['state']
  input: Part['input']
  output: Part['output']
  errorText: Part['errorText']
}>()

const emit = defineEmits<{
  regenerate: []
}>()
</script>

<template>
  <template v-if="props.state === 'input-streaming' || props.state === 'input-available'">
    <ul class="grid gap-4">
      <li class="flex items-center gap-3">
        <UIcon name="i-lucide-rotate-cw" class="size-5 animate-spin" />
        <span class="text-muted">Searching...</span>
      </li>

      <li
        v-for="i in 3"
        :key="i"
        class="grid gap-4 p-4 bg border border-accented rounded-md"
      >
        <USkeleton class="w-1/4 h-4" />

        <USkeleton class="w-full h-4" />

        <USkeleton class="w-2/5 h-4" />
        <USkeleton class="w-3/5 h-4" />

        <div class="flex items-center gap-2">
          <USkeleton class="w-2/5 h-4" />
          <USkeleton class="w-1/5 h-4" />
          <USkeleton class="w-1/5 h-4" />
        </div>
      </li>
    </ul>
  </template>

  <template v-else-if="props.state === 'output-available'">
    <div class="grid gap-4">
      <div class="text-muted">
        Query for "{{ props.input?.query }}" - {{ props.output?.length }} results
      </div>

      <ul
        v-if="props.output"
        class="grid gap-4"
      >
        <li
          v-for="job in props.output"
          :key="job.id"
        >
          <div class="grid gap-4 p-4 bg border border-accented rounded-md has-[.active-link]:border-primary transition-colors">
            <div class="flex items-center justify-between">
              <UBadge
                size="md"
                variant="subtle"
                :color="job.score >= 75 ? 'success' : job.score >= 50 ? 'warning' : 'error'"
              >
                {{ `${job.score}% Match` }}
              </UBadge>

              <UButton
                variant="link"
                icon="i-lucide-external-link"
                square
                size="sm"
                color="neutral"
                active-color="primary"
                active-class="active-link"
                :to="`/jobs/${job.id}`"
              />
            </div>

            <p class="font-semibold text-lg leading-tight line-clamp-1">
              {{ job.title }}
            </p>

            <div class="grid gap-1.5 text-sm">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-building-2" /> {{ job.company }}
              </div>
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-map-pin" /> {{ job.location }}
              </div>

              <div class="flex items-center flex-wrap gap-2 my-1">
                <UBadge
                  v-for="typ in job.types.split('|')"
                  :key="typ"
                  color="neutral"
                  variant="subtle"
                >
                  <UIcon name="i-lucide-briefcase" /> {{ typ }}
                </UBadge>

                <UBadge color="neutral" variant="outline">
                  <UIcon name="i-lucide-clock" />
                  {{ job.worktime_min }}-{{ job.worktime_max }}h/week
                </UBadge>
                <UBadge color="neutral" variant="outline">
                  <UIcon name="i-lucide-house" /> {{ job.homeoffice }}
                </UBadge>
              </div>
            </div>

            <UAccordion
              v-if="job.chunks.length"
              :items="[{ label: `References (${job.chunks.length})`, icon: 'i-lucide-file-text' }]"
              :ui="{
                root: 'text-muted',
                trigger: 'pt-2 pb-4',
                leadingIcon: 'size-4 me-1',
              }"
            >
              <template #content>
                <ul class="grid gap-2">
                  <li
                    v-for="c in job.chunks"
                    :key="c.id"
                    class="text-sm text-default border border-accented px-2.5 py-1 rounded-sm"
                  >
                    <div class="flex gap-1">
                      <span class="font-medium">{{ c.type }}</span>
                      <span class="text-dimmed">({{ c.score.toFixed(2) }})</span>
                    </div>
                    <p class="text-muted">
                      {{ c.content }}
                    </p>
                  </li>
                </ul>
              </template>
            </UAccordion>
          </div>
        </li>
      </ul>
    </div>
  </template>

  <template v-else>
    <div class="flex justify-between items-center p-4 border border-error/20 rounded-md bg-error/10 text-error">
      <div>
        <span class="font-medium mr-1">Error:</span>
        <span>{{ props.errorText }}</span>
      </div>

      <UButton
        variant="subtle"
        color="neutral"
        class="w-fit shrink-0"
        @click="emit('regenerate')"
      >
        Try again
      </UButton>
    </div>
  </template>
</template>
