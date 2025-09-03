<script setup lang="ts">
import type { Filters } from '~~/shared/types'
import { t } from 'try'
import { DEFAULT_FILTER, JOB_CATEGORIES, JOB_FIELDS, JOB_HOMEOFFICES, JOB_TYPES, JOB_WORKINGTIMES } from '~~/shared/constants'

type Key = keyof Filters
type Value = Filters[Key]

const props = defineProps<{
  length: number
}>()

const toast = useToast()

const filters = defineModel({ default: structuredClone(DEFAULT_FILTER) })

function clear() {
  filters.value = structuredClone(DEFAULT_FILTER)
}

const smart = shallowRef<string>()
const finding = shallowRef(false)
async function find() {
  finding.value = true
  const input = `
The user is refining their job search filters.

Context:
- Previous filters (already applied):
${JSON.stringify(filters.value, null, 2)}

- Current user input (new preferences, higher priority):
"${smart.value}"

Task:
- Combine the previous filters with the new input.
- The new input always overrides or updates previous filters if there is a conflict.
- If the new input adds details, merge them with the previous filters.
- If the user explicitly asks to "remove all filters", "reset filters", or similar,
  then return this (${JSON.stringify(DEFAULT_FILTER, null, 2)}).
- Return only the combined preferences as plain text, without explanations.
  `

  const [ok, error, value] = await t($fetch<Omit<Filters, 'search'>>('/api/filters', {
    method: 'POST',
    body: { input },
  }))
  finding.value = false

  if (ok)
    smart.value = ''

  if (error || !value) {
    toast.add({
      title: 'No matching filters found',
      description: 'Try rephrasing your search or adding more details.',
      color: 'warning',
    })
    return
  }

  filters.value = value
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
            <form @submit.prevent="find">
              <fieldset>
                <legend class="block font-medium text-sm mb-2">
                  Smart filters
                </legend>
                <UInput
                  v-model="smart"
                  class="w-full"
                  trailing-icon="i-lucide-sparkle"
                  :loading="finding"
                  :ui="{ trailingIcon: 'size-4 bg-gradient-to-tr from-warning via-success to-info inline-block animate-pulse' }"
                  placeholder="Describe what you want to filter"
                />
              </fieldset>
            </form>

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
                multiple
                :items="JOB_FIELDS"
              />
            </fieldset>

            <fieldset>
              <legend class="block font-medium text-sm mb-2">
                Categories
              </legend>
              <USelectMenu
                v-model="filters.categories"
                placeholder="Select categories"
                class="w-80"
                multiple
                :items="JOB_CATEGORIES"
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

    <div class="group flex items-start gap-2">
      <div class="group flex items-center flex-wrap gap-2 min-h-7">
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

      <span class="group-has-[[data-slot=badge]]:ml-auto my-0.5 text-sm text-muted text-nowrap">
        Show <span class="text-success">{{ props.length }}</span> results
      </span>
    </div>
  </div>
</template>
