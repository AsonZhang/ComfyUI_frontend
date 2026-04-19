<template>
  <Drawer
    v-model:visible="visible"
    position="right"
    class="queue-drawer"
    :pt="{
      root: { class: 'queue-drawer-root' },
      header: { class: 'queue-drawer-header' },
      content: { class: 'queue-drawer-content' }
    }"
  >
    <template #header>
      <div class="flex w-full items-center justify-between">
        <h3 class="text-lg font-semibold">
          {{ t('sideToolbar.queueProgressOverlay.viewJobHistory') }}
        </h3>
        <Button
          variant="secondary"
          size="icon"
          :aria-label="t('g.close')"
          @click="closeDrawer"
        >
          <i class="icon-[lucide--x] size-4" />
        </Button>
      </div>
    </template>

    <!-- 队列状态概览 -->
    <div class="queue-summary border-b border-interface-stroke p-4">
      <div class="flex items-center gap-4">
        <div class="summary-item">
          <span class="text-xs text-muted-foreground">{{
            t('queue.running')
          }}</span>
          <span class="text-lg font-semibold text-primary">{{
            runningCount
          }}</span>
        </div>
        <div class="summary-item">
          <span class="text-xs text-muted-foreground">{{
            t('queue.pending')
          }}</span>
          <span class="text-lg font-semibold">{{ pendingCount }}</span>
        </div>
        <div class="summary-item">
          <span class="text-xs text-muted-foreground">{{
            t('queue.completed')
          }}</span>
          <span class="text-success text-lg font-semibold">{{
            completedCount
          }}</span>
        </div>
      </div>
    </div>

    <!-- 任务列表 -->
    <div class="queue-list flex-1 overflow-y-auto">
      <!-- 运行中的任务 -->
      <div v-if="runningTasks.length > 0" class="queue-section">
        <div class="section-header bg-secondary-background px-4 py-2">
          <span class="text-xs font-medium text-muted-foreground">
            {{ t('queue.running') }} ({{ runningTasks.length }})
          </span>
        </div>
        <QueueTaskItem
          v-for="task in runningTasks"
          :key="task.jobId"
          :task="task"
          :is-running="true"
          @cancel="handleCancelTask"
        />
      </div>

      <!-- 等待中的任务 -->
      <div v-if="pendingTasks.length > 0" class="queue-section">
        <div class="section-header bg-secondary-background px-4 py-2">
          <span class="text-xs font-medium text-muted-foreground">
            {{ t('queue.pending') }} ({{ pendingTasks.length }})
          </span>
        </div>
        <QueueTaskItem
          v-for="task in pendingTasks"
          :key="task.jobId"
          :task="task"
          @cancel="handleCancelTask"
        />
      </div>

      <!-- 已完成的任务 -->
      <div v-if="historyTasks.length > 0" class="queue-section">
        <div class="section-header bg-secondary-background px-4 py-2">
          <span class="text-xs font-medium text-muted-foreground">
            {{ t('queue.history') }} ({{ historyTasks.length }})
          </span>
        </div>
        <QueueTaskItem
          v-for="task in historyTasks"
          :key="task.jobId"
          :task="task"
          :is-history="true"
          @rerun="handleRerunTask"
        />
      </div>

      <!-- 空状态 -->
      <div
        v-if="
          runningTasks.length === 0 &&
          pendingTasks.length === 0 &&
          historyTasks.length === 0
        "
        class="empty-state flex flex-col items-center justify-center py-12"
      >
        <i class="mb-2 icon-[lucide--inbox] size-12 text-muted-foreground" />
        <span class="text-sm text-muted-foreground">{{
          t('queue.empty')
        }}</span>
      </div>
    </div>

    <!-- 底部操作 -->
    <div class="queue-actions border-t border-interface-stroke p-4">
      <Button
        variant="secondary"
        class="w-full"
        :disabled="pendingTasks.length === 0"
        @click="handleClearQueue"
      >
        <i class="mr-2 icon-[lucide--trash-2] size-4" />
        {{ t('sideToolbar.queueProgressOverlay.clearQueueTooltip') }}
      </Button>
    </div>
  </Drawer>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import Drawer from 'primevue/drawer'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import Button from '@/components/ui/button/Button.vue'
import QueueTaskItem from '@/components/custom/QueueTaskItem.vue'
import { useQueueStore } from '@/stores/queueStore'
import { useQueueDrawerStore } from '@/stores/custom/queueDrawerStore'
import { useCommandStore } from '@/stores/commandStore'

const { t } = useI18n()
const queueStore = useQueueStore()
const queueDrawerStore = useQueueDrawerStore()
const commandStore = useCommandStore()

const { visible } = storeToRefs(queueDrawerStore)
const { runningTasks, pendingTasks, historyTasks } = storeToRefs(queueStore)

const runningCount = computed(() => runningTasks.value.length)
const pendingCount = computed(() => pendingTasks.value.length)
const completedCount = computed(() => historyTasks.value.length)

const closeDrawer = () => {
  queueDrawerStore.closeDrawer()
}

const handleCancelTask = async (_jobId: string) => {
  await commandStore.execute('Comfy.Interrupt')
}

const handleRerunTask = async (promptId: string) => {
  const history = queueStore.historyTasks.find((t) => t.jobId === promptId)
  if (history) {
    await commandStore.execute('Comfy.QueuePrompt')
  }
}

const handleClearQueue = async () => {
  await commandStore.execute('Comfy.ClearPendingTasks')
}
</script>

<style scoped>
.queue-drawer-root {
  width: 400px !important;
  max-width: 50vw;
}

.queue-drawer-header {
  padding: 16px 20px;
}

.queue-drawer-content {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 60px);
}

.queue-summary {
  display: flex;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.queue-section {
  border-bottom: 1px solid var(--interface-stroke);
}

.section-header {
  display: flex;
  align-items: center;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
