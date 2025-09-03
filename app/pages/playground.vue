<script setup lang="ts">
const state = ref({
  selectChunks: {
    input: '',
    result: undefined as any,
  },
  chunkText: {
    input: '',
    result: undefined as any,
  },
})

async function selectChunks() {
  const result = await $fetch('/api/chunks', {
    method: 'POST',
    body: { query: state.value.selectChunks.input },
  })
  result.sort((a, b) => b.score - a.score)
  state.value.selectChunks.result = result
}
</script>

<template>
  <Panel>
    <PanelHeader page>
      <span>Playground</span>
    </PanelHeader>

    <PanelBody>
      <div class="grid grid-cols-1 gap-4">
        <UCard>
          <template #header>
            Select Chunks
          </template>
          <template #default>
            <form
              class="flex gap-2 items-start"
              @submit.prevent="selectChunks"
            >
              <UTextarea
                v-model="state.selectChunks.input"
                class="w-full"
                placeholder="Some input here..."
              />
              <UButton type="submit">
                send
              </UButton>
            </form>

            <MDC
              cache-key="selectChunks"
              :parser-options="{ highlight: false }"
              :value="`\`\`\`json\n${JSON.stringify(state.selectChunks.result, null, 2)}\n\`\`\``"
            />
          </template>
        </UCard>
      </div>
    </PanelBody>
  </Panel>
</template>
