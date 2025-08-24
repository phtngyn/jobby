<script setup lang="ts">
import type { ChatDataPart } from '~~/shared/types'

const props = defineProps<{
  data: ChatDataPart['classification']
}>()
</script>

<template>
  <UAccordion
    v-if="props.data.status === 'loading'"
    :items="[{ label: 'Classifying', icon: 'i-lucide-rotate-cw' }]"
    :ui="{
      root: 'text-muted',
      leadingIcon: 'size-5 animate-spin',
      trailingIcon: 'hidden',
      trigger: 'gap-3 text-base',
    }"
  />

  <UAccordion
    v-else
    :items="[{ label: `Classified as '${props.data.type}' - ${props.data.confidence}` }]"
    :ui="{
      root: 'text-muted',
      leadingIcon: 'size-5',
      trigger: 'gap-3 text-base',
    }"
  >
    <template #content>
      <p class="text-dimmed">
        {{ props.data.reason }}
      </p>
    </template>
  </UAccordion>
</template>
