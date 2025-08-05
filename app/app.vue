<script setup lang="ts">
import type { NavigationMenuItem } from '#ui/types'

const collapsed = useCookie('sidebar-collapsed', { default: () => false })
const colorMode = useColorMode()
const isDark = computed(() => colorMode.preference === 'dark')
const items = computed<NavigationMenuItem[]>(() => [

  {
    label: 'Home',
    icon: 'i-lucide-house',
    to: '/',
    tooltip: true,
  },
  {
    label: 'Profile',
    icon: 'i-lucide-user',
    tooltip: true,
    to: '/profile',
  },
  {
    label: 'TODO',
    icon: 'i-lucide-construction',
    tooltip: true,
    to: '/todo',
  },
],
)
</script>

<template>
  <UApp>
    <UDashboardGroup>
      <UDashboardSidebar
        v-model:collapsed="collapsed"
        collapsible
        :resizable="false"
        :ui="{
          root: 'min-w-20',
          header: collapsed ? 'gap-3 justify-center' : 'gap-3',
          body: collapsed ? 'py-4 items-center' : 'py-4',
        }"
      >
        <template #header="{ collapsed }">
          <div
            class="bg-primary rounded-lg size-10 flex-center shrink-0"
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

      <AppChat />
    </UDashboardGroup>
  </UApp>
</template>
