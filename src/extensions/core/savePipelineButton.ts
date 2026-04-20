import { t } from '@/i18n'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useToastStore } from '@/platform/updates/common/toastStore'
import { useExtensionService } from '@/services/extensionService'
import { pipelineApi } from '@/services/custom/pipelineApi'
import type { ActionBarButton } from '@/types/comfy'
import { app } from '@/scripts/app'

console.log('[SavePipelineButton] Module loaded, pipelineApi:', pipelineApi)

interface PipelineState {
  id?: string
  title: string
}

const pipelineState: PipelineState = {
  id: undefined,
  title: 'Untitled Pipeline'
}

async function savePipelineToServer() {
  console.log('[SavePipelineButton] savePipelineToServer called')
  const workspaceStore = useWorkspaceStore()
  const toastStore = useToastStore()

  const activeWorkflow = workspaceStore.workflow.activeWorkflow
  if (!activeWorkflow) {
    toastStore.add({
      severity: 'warn',
      summary: t('pipelineSave.noWorkflow'),
      life: 3000
    })
    return
  }

  try {
    console.log('[SavePipelineButton] Calling app.graphToPrompt()')
    const promptData = await app.graphToPrompt()
    const workflowJson = promptData.workflow
    console.log('[SavePipelineButton] workflowJson:', workflowJson)

    console.log('[SavePipelineButton] Calling pipelineApi.savePipeline()')
    const result = await pipelineApi.savePipeline({
      id: pipelineState.id,
      title: activeWorkflow.filename || pipelineState.title,
      pipeline_json: workflowJson,
      is_public: 0
    })
    console.log('[SavePipelineButton] Result:', result)

    if (result.status === 0) {
      pipelineState.id = result.data.pipeline.id
      pipelineState.title = result.data.pipeline.title

      toastStore.add({
        severity: 'success',
        summary: result.data.is_new
          ? t('pipelineSave.created')
          : t('pipelineSave.updated'),
        life: 3000
      })
    } else {
      toastStore.add({
        severity: 'error',
        summary: t('pipelineSave.failed'),
        detail: result.message,
        life: 5000
      })
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    toastStore.add({
      severity: 'error',
      summary: t('pipelineSave.failed'),
      detail: message,
      life: 5000
    })
  }
}

const buttons: ActionBarButton[] = [
  {
    icon: 'icon-[lucide--save]',
    label: t('pipelineSave.save'),
    tooltip: t('pipelineSave.saveTooltip'),
    onClick: () => {
      void savePipelineToServer()
    }
  }
]

useExtensionService().registerExtension({
  name: 'Video.SavePipelineButton',
  get actionBarButtons() {
    return buttons
  }
})