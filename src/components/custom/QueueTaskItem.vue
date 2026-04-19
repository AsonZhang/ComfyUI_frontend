<template>
  <div
    class="queue-task-item flex cursor-default items-center gap-3 px-4 py-3 hover:bg-secondary-background"
    :class="{ 'bg-primary-background/10': isRunning }"
  >
    <!-- 状态图标 -->
    <div class="task-status-icon">
      <i
        v-if="isRunning"
        class="icon-[lucide--loader-2] size-4 animate-spin text-primary"
      />
      <i
        v-else-if="isHistory && task.status === 'completed'"
        class="text-success icon-[lucide--check-circle] size-4"
      />
      <i
        v-else-if="isHistory && task.status === 'failed'"
        class="text-destructive icon-[lucide--x-circle] size-4"
      />
      <i v-else class="icon-[lucide--clock] size-4 text-muted-foreground" />
    </div>

    <!-- 任务信息 -->
    <div class="task-info min-w-0 flex-1">
      <div class="task-name truncate text-sm font-medium">
        {{ t('queue.defaultTaskName') }}
      </div>
      <div class="task-meta text-xs text-muted-foreground">
        <span v-if="isRunning">{{ t('queue.running') }}</span>
        <span v-else-if="isHistory">
          {{ formatTime(task.executionEndTimestamp) }}
        </span>
        <span v-else>{{ t('queue.waiting') }}</span>
      </div>
    </div>

    <!-- 进度条 (运行中时显示) -->
    <div v-if="isRunning" class="task-progress flex items-center gap-2">
      <div
        class="progress-bar h-1.5 w-24 overflow-hidden rounded-full bg-secondary-background"
      >
        <div
          class="progress-fill h-full animate-pulse rounded-full bg-primary transition-all"
          style="width: 50%"
        />
      </div>
      <span class="text-xs text-muted-foreground">{{
        t('queue.running')
      }}</span>
    </div>

    <!-- 操作按钮 -->
    <div class="task-actions flex items-center gap-1">
      <Button
        v-if="!isHistory"
        variant="textonly"
        size="icon"
        class="size-8"
        :aria-label="t('menu.interrupt')"
        @click="$emit('cancel', task.jobId)"
      >
        <i class="icon-[lucide--x] size-3" />
      </Button>
      <Button
        v-if="isHistory"
        variant="textonly"
        size="icon"
        class="size-8"
        :aria-label="t('queue.rerun')"
        @click="$emit('rerun', task.jobId)"
      >
        <i class="icon-[lucide--refresh-cw] size-3" />
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import Button from '@/components/ui/button/Button.vue'
import type { TaskItemImpl } from '@/stores/queueStore'

const props = defineProps<{
  task: TaskItemImpl
  isRunning?: boolean
  isHistory?: boolean
}>()

defineEmits<{
  (e: 'cancel', jobId: string): void
  (e: 'rerun', jobId: string): void
}>()

const { t } = useI18n()

const formatTime = (timestamp?: number) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleTimeString()
}
</script>

<style scoped>
.queue-task-item {
  display: flex;
  align-items: center;
}

.task-status-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.task-info {
  flex: 1;
  min-width: 0;
}

.task-actions {
  display: flex;
  align-items: center;
}
</style>
