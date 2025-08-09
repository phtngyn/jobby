<script setup lang="ts">
const route = useRoute()

const { data: job } = await useFetch(`/api/jobs/${route.params.id}`, {
  cache: 'force-cache',
})

if (!job.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Job not found!',
    fatal: true,
  })
}
</script>

<template>
  <UDashboardPanel
    v-if="job"
    :ui="{
      body: 'sm:p-4',
    }"
  >
    <template #header>
      <UDashboardNavbar :ui="{ root: 'sm:p-4' }">
        <template #title>
          <div class="flex items-center gap-2">
            <NuxtLink to="/" class="underline">
              Open Jobs
            </NuxtLink>
            <UIcon name="i-lucide-chevron-right" class="size-4.5" />
            <span class="text-muted">{{ job.id }}</span>
          </div>
        </template>
        <template #leading>
          <UDashboardSidebarCollapse />
          <span class="h-5 w-[1px] bg-(--ui-text-muted) ml-1 mr-2" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <h2 class="font-semibold text-2xl leading-tight">
        {{ job.title }}
      </h2>

      <MDCCached
        v-if="job.description"
        :value="job.description"
        :cache-key="job.id"
      />
    </template>
  </UDashboardPanel>
</template>
