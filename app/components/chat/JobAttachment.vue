<script setup lang="ts">
import type { JobNoDescription } from '~~/shared/types'

const props = defineProps<{
  jobs: JobNoDescription[]
}>()

const emit = defineEmits<{
  delete: [id: string]
}>()
</script>

<template>
  <div
    class="w-full grid gap-1.5"
  >
    <div
      v-for="job of props.jobs"
      :key="job.id"
      class="rounded-md p-3 bg-sidebar-accent text-card-foreground border text-sm flex justify-between items-center"
    >
      <span>{{ job.title }}</span>
      <UButton
        variant="ghost" class="size-6"
        icon="i-lucide-x"
        @click="emit('delete', job.id)"
      />
    </div>
  </div>
</template>
