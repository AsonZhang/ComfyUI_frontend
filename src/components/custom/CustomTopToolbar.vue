<template>
  <div
    class="custom-top-toolbar flex h-14 items-center gap-2 px-4 border-b border-interface-stroke bg-comfy-menu-bg"
  >
    <!-- Logo/Brand -->
    <div class="flex items-center gap-2 mr-4">
      <i class="icon-[comfy--logo] size-6 text-primary" />
      <span class="text-sm font-semibold">ComfyUI</span>
    </div>

    <!-- 分隔线 -->
    <div class="h-6 w-px bg-interface-stroke mr-2" />

    <!-- 保存按钮 -->
    <Button
      v-tooltip.bottom="t('menu.save')"
      variant="secondary"
      class="toolbar-button"
      :aria-label="t('menu.save')"
      @click="handleSave"
    >
      <i class="icon-[lucide--save] size-4" />
      <span class="hidden md:inline ml-1">{{ t('menu.save') }}</span>
    </Button>

    <!-- 运行按钮 -->
    <Button
      v-tooltip.bottom="t('menu.run')"
      variant="primary"
      class="toolbar-button"
      :aria-label="t('menu.run')"
      @click="handleRun"
    >
      <i class="icon-[lucide--play] size-4" />
      <span class="hidden md:inline ml-1">{{ t('menu.run') }}</span>
    </Button>

    <!-- 中断按钮 -->
    <Button
      v-tooltip.bottom="t('menu.interrupt')"
      variant="destructive"
      size="icon"
      class="toolbar-button"
      :disabled="isExecutionIdle"
      :aria-label="t('menu.interrupt')"
      @click="handleInterrupt"
    >
      <i class="icon-[lucide--square] size-4" />
    </Button>

    <!-- 任务队列按钮 -->
    <Button
      v-tooltip.bottom="t('sideToolbar.queueProgressOverlay.viewJobHistory')"
      variant="secondary"
      class="toolbar-button relative"
      :aria-label="t('sideToolbar.queueProgressOverlay.viewJobHistory')"
      @click="toggleQueueDrawer"
    >
      <i class="icon-[lucide--list] size-4" />
      <span class="hidden md:inline ml-1">{{ t('sideToolbar.queueProgressOverlay.viewJobHistory') }}</span>
      <StatusBadge
        v-if="activeJobsCount > 0"
        data-testid="active-jobs-indicator"
        variant="dot"
        class="pointer-events-none absolute -top-0.5 -right-0.5 animate-pulse"
      />
    </Button>

    <!-- 分隔线 -->
    <div class="h-6 w-px bg-interface-stroke mx-2" />

    <!-- 导出工作流按钮 -->
    <Button
      v-tooltip.bottom="t('menu.exportWorkflow')"
      variant="secondary"
      class="toolbar-button"
      :aria-label="t('menu.exportWorkflow')"
      @click="handleExport"
    >
      <i class="icon-[lucide--download] size-4" />
      <span class="hidden md:inline ml-1">{{ t('menu.exportWorkflow') }}</span>
    </Button>

    <!-- 右侧占位 -->
    <div class="flex-1" />

    <!-- 右侧面板切换 -->
    <Button
      v-tooltip.bottom="t('rightSidePanel.togglePanel')"
      variant="secondary"
      size="icon"
      :aria-label="t('rightSidePanel.togglePanel')"
      @click="rightSidePanelStore.togglePanel"
    >
      <i class="icon-[lucide--panel-right] size-4" />
    </Button>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import Button from '@/components/ui/button/Button.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import { useCommandStore } from '@/stores/commandStore'
import { useExecutionStore } from '@/stores/executionStore'
import { useQueueStore } from '@/stores/queueStore'
import { useRightSidePanelStore } from '@/stores/workspace/rightSidePanelStore'
import { useQueueDrawerStore } from '@/stores/custom/queueDrawerStore'

const { t } = useI18n()
const commandStore = useCommandStore()
const executionStore = useExecutionStore()
const queueStore = useQueueStore()
const rightSidePanelStore = useRightSidePanelStore()
const queueDrawerStore = useQueueDrawerStore()

const { isIdle: isExecutionIdle } = storeToRefs(executionStore)
const { activeJobsCount } = storeToRefs(queueStore)

const handleSave = async () => {
  await commandStore.execute('Comfy.SaveWorkflow')
}

const handleRun = async () => {
  await commandStore.execute('Comfy.QueuePrompt')
}

const handleInterrupt = async () => {
  if (!isExecutionIdle.value) {
    await commandStore.execute('Comfy.Interrupt')
  }
}

const handleExport = async () => {
  await commandStore.execute('Comfy.ExportWorkflow')
}

const toggleQueueDrawer = () => {
  queueDrawerStore.toggleDrawer()
}
</script>

<style scoped>
.toolbar-button {
  min-width: 32px;
}
</style>