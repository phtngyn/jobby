export const useGlobalStore = defineStore('global', () => {
  const isJobDragging = shallowRef(false)

  return { isJobDragging }
})
