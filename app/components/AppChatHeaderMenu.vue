<script setup lang="ts">
import type { Thread } from '~~/shared/types'

const props = defineProps<{
  threads: Thread[]
  thread: Thread
}>()

const emit = defineEmits<{
  remove: [id: string]
  change: [id: string]
}>()

const open = shallowRef(false)

async function remove(id: string) {
  open.value = false
  emit('remove', id)
}

async function change(id: string) {
  emit('change', id)
}

async function create() {
  await $fetch('/api/threads', {
    method: 'POST',
  })
  await refreshNuxtData('threads')
}
</script>

<template>
  <div>
    <UPopover :content="{ align: 'end' }">
      <UButton
        icon="i-lucide-menu"
        variant="ghost"
        color="neutral"
        class="text-muted hover:text-default"
      />
      <template #content>
        <div class="grid gap-2 p-2 min-w-64">
          <UButton
            block
            class="justify-center h-10"
            variant="subtle"
            color="neutral"
            @click="create"
          >
            New Thread
          </UButton>

          <div class="bg-accented h-px w-full my-0.5" />

          <ul class="grid">
            <li class="ml-2 mb-1">
              <span class="text-primary dark:text-primary/60 text-xs font-semibold">Today</span>
            </li>

            <li
              v-for="t in props.threads"
              :key="t.id"
              class="mb-0.5"
            >
              <UButton
                class="group justify-start"
                :variant="props.thread.id === t.id ? 'soft' : 'ghost'"
                block
                color="neutral"
                @click="change(t.id)"
              >
                <span class="truncate max-w-48">{{ t.title }}</span>

                <UModal
                  v-model:open="open"
                  title="Remove Thread"
                >
                  <UButton
                    icon="i-lucide-x"
                    size="sm"
                    variant="ghost"
                    color="error"
                    class="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                    @click.stop
                  />

                  <template #body>
                    <p>Are you sure you want to delete "{{ t.title }}"? This action cannot be undone.</p>
                  </template>

                  <template #footer>
                    <div class="flex w-full justify-end gap-2">
                      <UButton
                        color="neutral"
                        variant="ghost"
                        @click="open = false"
                      >
                        Cancel
                      </UButton>

                      <UButton
                        color="error"
                        @click="remove(t.id)"
                      >
                        Delete
                      </UButton>
                    </div>
                  </template>
                </UModal>
              </UButton>
            </li>

            <li class="ml-2 my-1">
              <span class="text-primary dark:text-primary/60 text-xs font-semibold">Yesterday</span>
            </li>

            <li class="ml-2 my-1">
              <span class="text-primary dark:text-primary/60 text-xs font-semibold">Last 7 Days</span>
            </li>
          </ul>
        </div>
      </template>
    </UPopover>
  </div>
</template>
