<script setup lang="ts">
import type { FindJobToolUIPart } from '#shared/types'

const props = defineProps<{
  state: FindJobToolUIPart['state']
  input: FindJobToolUIPart['input']
  output: FindJobToolUIPart['output']
  errorText: FindJobToolUIPart['errorText']
}>()

const open = shallowRef(false)
const result = shallowRef<NonNullable<FindJobToolUIPart['output']>['results'][number]>()

function seeDetail(r: typeof result['value']) {
  if (!r)
    return

  result.value = r
  open.value = true
  $fetch(`/api/jobs/${r.job.id}`).then((res) => {
    if (!res)
      return

    result.value!.job.description = res.description
  })
}
</script>

<template>
  <div
    class="w-full grid gap-3"
    data-tool
  >
    <template v-if="props.state === 'input-streaming'">
      <div class="rounded-md py-1.5">
        <div class="leading-none text-muted-foreground flex items-center gap-3">
          <RotateCw class="size-4 animate-spin" />
          <span>{{ (props?.input as any)?.input ?? 'Preparing request' }}</span>
        </div>
      </div>
    </template>

    <template v-else-if="props.state === 'input-available'">
      <div class="grid gap-3 py-1.5">
        <div class="leading-none text-muted-foreground flex items-center gap-3">
          <RotateCw class="size-4 animate-spin" />
          <span>{{ (props.input as any)?.input ?? 'Preparing request' }}</span>
        </div>

        <div
          v-for="i in 2"
          :key="i"
          class="rounded-md p-3 border border-accent-foreground/50 grid gap-3"
        >
          <div class="grid gap-1.5">
            <Skeleton class="h-4 w-80" />
            <Skeleton class="h-4 w-60" />
          </div>

          <div class="flex justify-end gap-2">
            <Toggle size="sm" disabled>
              <Heart class="size-4" />
            </Toggle>
            <Button size="sm" disabled>
              Detail
            </Button>
          </div>
        </div>
      </div>
    </template>

    <template v-else-if="props.state === 'output-available' && props.output?.results">
      <ul class="grid gap-3 py-1.5">
        <li
          v-for="r of props.output.results"
          :key="r.job.id"
          class="rounded-md p-3 border border-accent-foreground/50 grid gap-3 bg-accent"
        >
          <div class="grid gap-1.5">
            <span class="font-medium leading-none">{{ r.job.title }}</span>
            <span class="text-muted-foreground leading-none">{{ r.job.occupation }}</span>
          </div>

          <div class="flex justify-end gap-2">
            <Toggle size="sm" class="group">
              <Heart class="size-4 group-data-[state=on]:fill-primary transition-[fill]" />
            </Toggle>
            <Button size="sm" @click="seeDetail(r)">
              Detail
            </Button>
          </div>
        </li>

        <li>
          {{ props.output.summary }}
        </li>
      </ul>
    </template>

    <template v-else>
      <div class="rounded-md p-3 border border-accent-foreground/50 grid gap-3 bg-accent">
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
