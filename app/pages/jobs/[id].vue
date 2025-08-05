<script setup lang="ts">
const route = useRoute()

const { data } = await useFetch(`/api/jobs/${route.params.id}`, {
  cache: 'force-cache',
})
</script>

<template>
  <UDashboardPanel
    :ui="{
      body: 'sm:p-4',
    }"
  >
    <template #header>
      <UDashboardNavbar title="Home" :ui="{ root: 'sm:p-4' }">
        <template #leading>
          <UDashboardSidebarCollapse />
          <span class="h-5 w-[1px] bg-(--ui-text-muted) ml-1 mr-2" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      {{ data }}
    </template>
  </UDashboardPanel>
</template>
