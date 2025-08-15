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
    body: { input: state.value.chunk.input },
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
      <div class="grid grid-cols-3">
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
                class="w-full"
                placeholder="Some input here..."
                name="input"
              />
              <UButton type="submit">
                Submit
              </UButton>
            </form>

            <pre>{{ state.chunk.result }}</pre>
          </template>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>
