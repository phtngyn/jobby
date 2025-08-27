<script setup lang="ts">
import type { NavigationMenuItem } from '#ui/types'
import { SplitterGroup, SplitterPanel, SplitterResizeHandle } from 'reka-ui'

const { user } = useUserSession()

const store = useGlobalStore()

const colorMode = useColorMode()
const isDark = computed(() => colorMode.preference === 'dark')

const items = computed<NavigationMenuItem[]>(() => [
  {
    label: 'Home',
    icon: 'i-lucide-house',
    to: '/',
  },
  user.value
    ? {
        label: 'Profile',
        icon: 'i-lucide-user',
        to: '/profile',
      }
    : undefined,
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
].filter(Boolean) as NavigationMenuItem[])
</script>

<template>
  <UApp>
    <div class="w-full h-screen flex">
      <div
        :data-collapsed="store.collapsed"
        class="w-75 data-[collapsed=true]:w-18 overflow-hidden border-r border-default transition-[width]"
      >
        <div class="relative flex flex-col min-w-0 min-h-svh flex-1">
          <PanelHeader class="gap-3">
            <div class="bg-primary rounded-md size-9 flex-center shrink-0">
              <UIcon name="i-lucide-briefcase-business" class="text-inverted size-4.5" />
            </div>
            <p v-if="!store.collapsed" class="font-medium">
              Jobby
            </p>
          </PanelHeader>

          <div class="flex flex-col gap-4 flex-1 overflow-hidden p-4">
            <UNavigationMenu
              :collapsed="store.collapsed"
              :items="items"
              orientation="vertical"
              :ui="{
                list: 'grid gap-3',
                item: store.collapsed ? 'size-10 aspect-square' : '',
                link: store.collapsed ? 'size-full flex-center' : 'h-10 gap-3',
              }"
            />

            <div class="mt-auto flex flex-col gap-8">
              <UButton
                :icon="isDark ? 'i-lucide-moon' : 'i-lucide-sun'"
                block
                class="truncate h-10 justify-start"
                :class="{ 'w-10': store.collapsed }"
                color="neutral"
                variant="ghost"
                @click="colorMode.preference = isDark ? 'light' : 'dark'"
              >
                {{ store.collapsed ? '' : (isDark ? 'Dark Mode' : 'Light Mode') }}
              </UButton>

              <div v-if="user" class="flex gap-3 items-center -m-4 p-4 border-t border-default">
                <span class="rounded-md overflow-hidden shrink-0">
                  <Avatar :name="user.id" :size="36" square />
                </span>
                <div v-if="!store.collapsed" class="grid">
                  <span class="font-medium text-sm line-clamp-1">{{ user.username }}</span>
                  <span class="text-dimmed text-xs">{{ user.shortId }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SplitterGroup
        id="splitter-group"
        direction="horizontal"
        @layout="v => store.layout = v"
      >
        <SplitterPanel
          id="splitter-panel-1"
          collapsible
          :default-size="store.layout[0]"
          :min-size="33"
          :collapsed-size="0"
        >
          <NuxtPage />
        </SplitterPanel>

        <SplitterResizeHandle
          id="splitter-handle"
          class="w-px border border-accented flex-center"
        />

        <SplitterPanel
          id="splitter-panel-2"
          collapsible
          :default-size="store.layout[1]"
          :min-size="33"
          :collapsed-size="0"
        >
          <AppChat />
        </SplitterPanel>
      </SplitterGroup>
    </div>
  </UApp>
</template>
