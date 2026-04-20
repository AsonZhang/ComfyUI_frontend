import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePipelineStore = defineStore('custom-pipeline', () => {
  const pipelineId = ref<string | undefined>()
  const pipelineTitle = ref<string>('Untitled Pipeline')

  return { pipelineId, pipelineTitle }
})
