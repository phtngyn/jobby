<script setup lang="ts">
const state = ref({
  chunk: {
    input: '',
    result: undefined as any,
  },
})

async function selectChunk() {
  const result = await $fetch('/api/chunks/select', {
    method: 'POST',
    body: { query: state.value.chunk.input },
  })
  state.value.chunk.result = result
}
</script>

<template>
  <UDashboardPanel
    :ui="{
      body: 'sm:p-4',
    }"
  >
    <template #header>
      <UDashboardNavbar title="Playground" :ui="{ root: 'sm:p-4' }">
        <template #leading>
          <UDashboardSidebarCollapse />
          <span class="h-5 w-[1px] bg-(--ui-text-muted) ml-1 mr-2" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="grid grid-cols-1">
        <UCard>
          <template #header>
            Chunk
          </template>
          <template #default>
            <form
              class="flex gap-2"
              @submit.prevent="selectChunk"
            >
              <UInput
                v-model="state.chunk.input"
                class="w-full"
                placeholder="Some input here..."
              />
              <UButton type="submit">
                send
              </UButton>
            </form>

            <ul class="text-xs mt-4 p-2 overflow-y-auto border rounded-md min-h-10 max-h-50 grid gap-2">
              <li v-for="(x, i) in state.chunk.result" :key="i">
                {{ x }}
              </li>
            </ul>
          </template>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>
