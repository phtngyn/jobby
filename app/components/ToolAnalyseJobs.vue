<script setup lang="ts">
import type { ToolUIPart } from 'ai'
import type { ChatToolSet } from '~~/shared/types'

type Part = Extract<ToolUIPart<ChatToolSet>, { type: 'tool-analyze_jobs' }>

const props = defineProps<{
  state: Part['state']
  input: Part['input']
  output: Part['output']
  errorText: Part['errorText']
  cacheKey: string
}>()

const emit = defineEmits<{
  regenerate: []
}>()
</script>

<template>
  <template v-if="props.state === 'input-streaming' || props.state === 'input-available'">
    <div class="flex items-center gap-3">
      <UIcon name="i-lucide-rotate-cw" class="size-5 animate-spin" />
      <span class="text-muted">Analyzing...</span>
    </div>
  </template>

  <template v-if="props.state === 'output-available'">
    <MDCCached
      v-if="props.output"
      class="[&>:first-child]:mt-0"
      :value="props.output"
      :cache-key="props.cacheKey"
      :parser-options="{ highlight: false }"
    />
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
