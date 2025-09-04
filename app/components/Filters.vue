<script setup lang="ts">
import type { Filters } from '~~/shared/types'
import { t } from 'try'
import { JOB_CATEGORIES, JOB_FIELDS, JOB_HOMEOFFICES, JOB_TYPES, JOB_WORKINGTIMES } from '~~/shared/constants'

type Key = keyof Filters
type Value = Filters[Key]

const props = defineProps<{
  length: number
}>()

const toast = useToast()
const store = useGlobalStore()

const smart = shallowRef<string>()
const history = ref<string[]>([])

const finding = shallowRef(false)
async function find() {
  const input = smart.value?.trim()
  if (!input)
    return

  finding.value = true

  history.value.push(input)

  const [ok, error, value] = await t($fetch<Filters>('/api/filters', {
    method: 'POST',
    body: {
      prompt: input,
      history: history.value,
      filters: store.filters,
    },
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

  store.filters = value
}
</script>

<template>
  <div v-if="store.filters" class="grid gap-4">
    <div class="flex items-center gap-2">
      <UInput
        v-model="store.filters.search"
        leading-icon="i-lucide-search"
        placeholder="Search for title, company, keyword"
        class="w-full max-w-sm"
        variant="subtle"
      >
        <template v-if="store.filters?.search?.length" #trailing>
          <UButton
            color="neutral"
            variant="link"
            size="sm"
            icon="i-lucide-x"
            aria-label="Clear input"
            @click="store.filters.search = ''"
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
          <div class="px-4 pb-4 grid gap-4">
            <div class="-mx-4 px-4 flex justify-between gap-2 items-center border-b border-accented py-2">
              <p class="text-xs">
                <span class="text-success">{{ props.length }}</span> results
              </p>

              <UButton variant="ghost" size="xs" @click="store.clearFilters">
                Clear
              </UButton>
            </div>

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
              v-model="store.filters.types"
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
                v-model="store.filters.fields"
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
                v-model="store.filters.categories"
                placeholder="Select categories"
                class="w-80"
                multiple
                :items="JOB_CATEGORIES"
              />
            </fieldset>

            <UCheckboxGroup
              v-model="store.filters.homeoffices"
              size="lg"
              legend="Homeoffice"
              :items="JOB_HOMEOFFICES"
              :ui="{ item: 'mb-1', legend: 'mb-2' }"
            />

            <fieldset>
              <legend class="block font-medium text-sm mb-4">
                Working time
                <span class="text-dimmed">
                  ({{ store.filters?.workingtimes?.[0] }}-{{ store.filters?.workingtimes?.[1] }}h)
                </span>
              </legend>
              <USlider
                v-model="store.filters.workingtimes"
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
          v-if="store.filters.search"
          data-slot="badge"
          color="neutral"
          variant="subtle"
          size="lg"
        >
          Search: {{ store.filters.search }}
        </UBadge>

        <template
          v-for="[k, v] in Object.entries(store.filters) as [Key, Value][]"
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
                  @click="store.filters.workingtimes = [
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
                  @click="store.filters[k] = store.filters[k]?.filter(f => f !== x)"
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
          @click="store.clearFilters"
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
