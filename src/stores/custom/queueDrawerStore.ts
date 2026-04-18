import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useQueueDrawerStore = defineStore('queueDrawer', () => {
  const visible = ref(false)

  const openDrawer = () => {
    visible.value = true
  }

  const closeDrawer = () => {
    visible.value = false
  }

  const toggleDrawer = () => {
    visible.value = !visible.value
  }

  return {
    visible,
    openDrawer,
    closeDrawer,
    toggleDrawer
  }
})