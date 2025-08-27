<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { z } from 'zod'

const open = shallowRef(true)

const schema = z.object({
  username: z.string().trim().min(3, 'Must be at least 3 characters'),
})
const state = ref({ username: '' })

async function submit(event: FormSubmitEvent<z.infer<typeof schema>>) {
  await $fetch('/api/auth', {
    method: 'POST',
    body: { username: event.data.username },
  })
  open.value = false
  reloadNuxtApp()
}
</script>

<template>
  <UModal
    v-model:open="open"
    title="Create Account"
    description="Choose a username to get personalized experience"
  >
    <template #body>
      <UForm
        :schema="schema"
        :state="state"
        class="grid gap-4"
        @submit="submit"
      >
        <UFormField label="Username" name="username">
          <UInput v-model="state.username" class="w-full" />
        </UFormField>

        <div class="flex justify-end gap-2">
          <UButton
            type="button"
            variant="outline"
            color="neutral"
            @click="open = false"
          >
            Cancel
          </UButton>

          <UButton type="submit">
            Create
          </UButton>
        </div>
      </UForm>
    </template>
  </UModal>
</template>
