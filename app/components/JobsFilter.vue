<script setup lang="ts">
import type { Filters } from '~~/shared/types'
import { DEFAULT_FILTER, JOB_DOMAINS, JOB_FIELDS, JOB_HOMEOFFICES, JOB_TYPES, JOB_WORKINGTIMES } from '~~/shared/constants'

type Key = keyof Filters
type Value = Filters[Key]

const props = defineProps<{
  length: number
}>()

const filters = defineModel({ default: structuredClone(DEFAULT_FILTER) })

function clear() {
  filters.value = structuredClone(DEFAULT_FILTER)
}
</script>

<template>
  <div v-if="filters" class="grid gap-4">
    <div class="flex items-center gap-2">
      <UInput
        v-model="filters.search"
        leading-icon="i-lucide-search"
        placeholder="Search for title, company, keyword"
        class="w-full max-w-sm"
        variant="subtle"
      >
        <template v-if="filters?.search?.length" #trailing>
          <UButton
            color="neutral"
            variant="link"
            size="sm"
            icon="i-lucide-x"
            aria-label="Clear input"
            @click="filters.search = ''"
          />
        </template>
      </UInput>

      <UPopover
        :content="{ align: 'end' }"
      >
        <UButton
          label="Filter"
          color="neutral"
          variant="subtle"
          class="ml-auto"
          icon="i-lucide-funnel"
        />

        <template #content>
          <div class="p-4 grid gap-4">
            <UCheckboxGroup
              v-model="filters.types"
              size="lg"
              legend="Types"
              :items="JOB_TYPES"
              :ui="{ item: 'mb-1', legend: 'mb-2' }"
            />

            <fieldset>
              <legend class="block font-medium text-sm mb-2">
                Fields
              </legend>
              <USelectMenu
                v-model="filters.fields"
                placeholder="Select fields"
                class="w-80"
                icon="i-lucide-search"
                multiple
                :items="JOB_FIELDS"
              />
            </fieldset>

            <fieldset>
              <legend class="block font-medium text-sm mb-2">
                Domains
              </legend>
              <USelectMenu
                v-model="filters.domains"
                placeholder="Select domains"
                class="w-80"
                icon="i-lucide-search"
                multiple
                :items="JOB_DOMAINS"
              />
            </fieldset>

            <UCheckboxGroup
              v-model="filters.homeoffices"
              size="lg"
              legend="Homeoffice"
              :items="JOB_HOMEOFFICES"
              :ui="{ item: 'mb-1', legend: 'mb-2' }"
            />

            <fieldset>
              <legend class="block font-medium text-sm mb-4">
                Working time
                <span class="text-dimmed">
                  ({{ filters?.workingtimes?.[0] }}-{{ filters?.workingtimes?.[1] }}h)
                </span>
              </legend>
              <USlider
                v-model="filters.workingtimes"
                :min="JOB_WORKINGTIMES.min"
                :max="JOB_WORKINGTIMES.max"
              />
            </fieldset>
          </div>
        </template>
      </UPopover>
    </div>

    <div class="group flex items-center">
      <div class="group flex items-center gap-2 h-7">
        <UBadge
          v-if="filters.search"
          data-slot="badge"
          color="neutral"
          variant="subtle"
          size="lg"
        >
          Search: {{ filters.search }}
        </UBadge>

        <template
          v-for="[k, v] in Object.entries(filters) as [Key, Value][]"
          :key="k"
        >
          <template v-if="k === 'search'" />

          <template v-else-if="k === 'workingtimes'">
            <UBadge
              v-if="v?.[0] !== JOB_WORKINGTIMES.min || v?.[1] !== JOB_WORKINGTIMES.max "
              data-slot="badge"
              class="items-center"
              color="neutral"
              variant="subtle"
              size="lg"
            >
              {{ `${v?.[0]} - ${v?.[1]}h` }}

              <template #trailing>
                <button
                  class="flex-center"
                  @click="filters.workingtimes = [
                    JOB_WORKINGTIMES.min,
                    JOB_WORKINGTIMES.max,
                  ]"
                >
                  <UIcon name="i-lucide-x" />
                </button>
              </template>
            </UBadge>
          </template>

          <template
            v-for="x in v"
            v-else
            :key="x"
          >
            <UBadge
              data-slot="badge"
              class="items-center"
              color="neutral"
              variant="subtle"
              size="lg"
            >
              {{ x }}

              <template #trailing>
                <button
                  class="flex-center"
                  @click="filters[k] = filters[k]?.filter(f => f !== x)"
                >
                  <UIcon name="i-lucide-x" />
                </button>
              </template>
            </UBadge>
          </template>
        </template>

        <UButton
          size="sm"
          variant="ghost"
          class="hidden group-has-[[data-slot=badge]]:inline-flex"
          @click="clear"
        >
          Clear all
        </UButton>
      </div>

      <span class="group-has-[[data-slot=badge]]:ml-auto text-sm text-muted font-medium">
        Show {{ props.length }} results
      </span>
    </div>
  </div>
</template>
