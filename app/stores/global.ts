import { DEFAULT_FILTER, JOB_WORKINGTIMES } from '~~/shared/constants'

export const useGlobalStore = defineStore('global', () => {
  // UI
  const layout = useCookie('app:layout', { default: () => [50, 50] })
  const collapsed = useCookie('app:sidebar:collapsed', { default: () => false })
  const dragging = shallowRef(false)

  const panelLeft = shallowRef<any>()
  const panelRight = shallowRef<any>()

  // State
  const filters = ref((() => DEFAULT_FILTER)())

  function clearFilters() {
    filters.value.search = ''
    filters.value.types = []
    filters.value.categories = []
    filters.value.fields = []
    filters.value.homeoffices = []
    filters.value.workingtimes = [JOB_WORKINGTIMES.min, JOB_WORKINGTIMES.max]
  }

  return {
    // UI
    layout,
    collapsed,
    dragging,
    panelLeft,
    panelRight,

    // State
    filters,
    clearFilters,
  }
})
