<script setup lang="ts">
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
          <span class="h-4 w-[1px] bg-(--ui-text-muted)  mr-1" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      asdf
    </template>
  </UDashboardPanel>
</template>
