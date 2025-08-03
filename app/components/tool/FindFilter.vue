<script setup lang="ts">
import type { FindFilterToolUIPart } from '#shared/types'

const props = defineProps<{
  state: FindFilterToolUIPart['state']
  input: FindFilterToolUIPart['input']
  output: FindFilterToolUIPart['output']
  errorText: FindFilterToolUIPart['errorText']
}>()
</script>

<template>
  <div
    class="w-full grid gap-3"
    data-tool
  >
    <template v-if="props.state === 'input-streaming'">
      <div class="rounded-lg py-1.5">
        <div class="leading-none text-muted-foreground flex items-center gap-3">
          <RotateCw class="size-4 animate-spin" />
          <span>{{ (props.input as any)?.input ?? 'Preparing request' }}</span>
        </div>
      </div>
    </template>

    <template v-else-if="props.state === 'input-available'">
      <div class="grid gap-3 py-1.5">
        <div class="leading-none text-muted-foreground flex items-center gap-3">
          <RotateCw class="size-4 animate-spin" />
          <span>{{ (props.input as any)?.input ?? 'Preparing request' }}</span>
        </div>
      </div>
    </template>

    <template v-else-if="props.state === 'output-available'">
      <div>{{ props.output?.summary }}</div>
    </template>

    <template v-else>
      <div class="rounded-lg p-3 border border-accent-foreground/50 grid gap-3 bg-accent">
        <div class="grid gap-1.5">
          <div class="font-medium leading-none text-destructive">
            Error
          </div>
          <div class="text-muted-foreground leading-none">
            {{ props.errorText }}
          </div>
        </div>

        <div class="flex justify-end gap-2">
          <Button size="sm">
            Try again
          </Button>
        </div>
      </div>
    </template>
  </div>
</template>
