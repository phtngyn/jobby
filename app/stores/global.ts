export const useGlobalStore = defineStore('global', () => {
  const layout = useCookie('app:layout', { default: () => [50, 50] })
  const collapsed = useCookie('app:sidebar:collapsed', { default: () => false })
  const dragging = shallowRef(false)

  return {
    layout,
    collapsed,
    dragging,
  }
})
