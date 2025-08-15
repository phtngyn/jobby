<script setup lang="ts">
import type { NavigationMenuItem } from '#ui/types'

const isSidebarCollapsed = useCookie('sidebar-collapsed', { default: () => false })
const colorMode = useColorMode()
const isDark = computed(() => colorMode.preference === 'dark')
const items = computed<NavigationMenuItem[]>(() => [

  {
    label: 'Home',
    icon: 'i-lucide-house',
    to: '/',
  },
  {
    label: 'Profile',
    icon: 'i-lucide-user',
    to: '/profile',
  },
  {
    label: 'Ingest',
    icon: 'i-lucide-import',
    to: '/ingest',
  },
  {
    label: 'Playground',
    icon: 'i-lucide-construction',
    to: '/playground',
  },
],
)
</script>

<template>
  <UApp>
    <UDashboardGroup>
      <UDashboardSidebar
        v-model:collapsed="isSidebarCollapsed"
        collapsible
        :resizable="false"
        :ui="{
          root: 'min-w-20',
          header: isSidebarCollapsed ? 'gap-3 justify-center' : 'gap-3',
          body: isSidebarCollapsed ? 'py-4 items-center' : 'py-4',
        }"
      >
        <template #header="{ collapsed }">
          <div
            class="bg-primary/80 dark:bg-primary rounded-md size-10 flex-center shrink-0"
          >
            <UIcon name="i-lucide-briefcase-business" class="text-inverted size-4.5" />
          </div>
          <p v-if="!collapsed" class="tracking-wide font-semibold">
            Jobby
          </p>
        </template>

        <template #default="{ collapsed }">
          <UNavigationMenu
            :collapsed="collapsed"
            :items="items"
            orientation="vertical"
            :ui="{
              list: 'grid gap-3',
              item: collapsed ? 'size-10 aspect-square' : '',
              link: collapsed ? 'size-full flex-center' : 'h-10 gap-3',
            }"
          />

          <div class="mt-auto">
            <UButton
              :icon="isDark ? 'i-lucide-moon' : 'i-lucide-sun'"
              :block="collapsed"
              class="truncate h-10"
              color="neutral"
              variant="ghost"
              @click="colorMode.preference = isDark ? 'light' : 'dark'"
            >
              {{ collapsed ? '' : (isDark ? 'Dark Mode' : 'Light Mode') }}
            </UButton>
          </div>
        </template>
      </UDashboardSidebar>

      <NuxtPage />

      <!-- <AppChat /> -->
    </UDashboardGroup>
  </UApp>
</template>
