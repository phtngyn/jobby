<script setup lang="ts">
const { data, status } = await useFetch('/api/jobs', {
  key: 'jobs',
  body: { ids: [] },
  method: 'POST',
  lazy: true,
})

function dragstart(event: DragEvent) {
  const target = event.target as HTMLAnchorElement
  const id = target.dataset.id

  if (!id || !event.dataTransfer)
    return

  event.dataTransfer.setData('text/plain', id)
}
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
      <template v-if="status === 'success'">
        <div class="grid grid-cols-2 gap-4">
          <NuxtLink
            v-for="job in data"
            :key="job.id"
            class="group p-4 flex flex-col bg-default border border-accented rounded-md h-full hover:border-inverted transition-colors"
            :to="`/jobs/${job.id}`"
            :data-id="job.id"
            draggable="true"
            @dragstart="dragstart"
          >
            <div class="grid gap-2.5 mb-6">
              <div class="flex items-center justify-between">
                <UBadge
                  color="neutral"
                  :variant="job.type === 'ARBEIT' ? 'solid' : 'subtle'"
                >
                  {{ job.type }}
                </UBadge>

                <UIcon name="i-lucide-grip-vertical" class="size-4 text-dimmed group-hover:text-(--ui-text) transition-colors" />
              </div>

              <h3 class="font-semibold text-lg leading-tight line-clamp-2 text-balance">
                {{ job.title }}
              </h3>
            </div>

            <div class="grid gap-1.5 text-sm mb-4">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-building-2" /> {{ job.employer }}
              </div>
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-map-pin" /> {{ job.region }}, {{ job.country }}
              </div>

              <div class="flex items-center gap-2 my-1">
                <UBadge v-if="job.worktime" color="neutral" variant="outline">
                  <UIcon name="i-lucide-clock" /> {{ job.worktime === 'FULLTIME' ? 'Full-time' : 'Part-time' }}
                </UBadge>
                <UBadge v-if="job.homeoffice" color="neutral" variant="outline">
                  <UIcon name="i-lucide-house" /> Homeoffice
                </UBadge>
              </div>
            </div>

            <div class="mt-auto">
              <div class="text-sm line-clamp-2 text-balance">
                {{ job.description?.substring(0, 250) }}
              </div>

              <div class="w-full h-px mt-4 mb-3 bg-accented" />

              <div class="flex items-center gap-2 text-xs text-muted">
                <UIcon name="i-lucide-calendar" /> Modified at {{ job.modifiedAt }}
              </div>
            </div>
          </NuxtLink>
        </div>
      </template>

      <template v-else-if="status === 'error'">
        <p class="text-error">
          error
        </p>
      </template>

      <template v-else>
        loading...
      </template>
    </template>
  </UDashboardPanel>
</template>
