export const useGlobalStore = defineStore('global', () => {
  const layout = useCookie('app:layout', { default: () => [50, 50] })
  const collapsed = useCookie('app:sidebar:collapsed', { default: () => false })
  const dragging = shallowRef(false)

  const panelLeft = shallowRef<any>()
  const panelRight = shallowRef<any>()

  return {
    layout,
    collapsed,
    dragging,
    panelLeft,
    panelRight,
  }
})
