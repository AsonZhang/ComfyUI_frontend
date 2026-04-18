<template>
  <div
    class="queue-task-item flex items-center gap-3 px-4 py-3 hover:bg-secondary-background cursor-default"
    :class="{ 'bg-primary-background/10': isRunning }"
  >
    <!-- 状态图标 -->
    <div class="task-status-icon">
      <i
        v-if="isRunning"
        class="icon-[lucide--loader-2] size-4 animate-spin text-primary"
      />
      <i
        v-else-if="isHistory && task.status === 'success'"
        class="icon-[lucide--check-circle] size-4 text-success"
      />
      <i
        v-else-if="isHistory && task.status === 'error'"
        class="icon-[lucide--x-circle] size-4 text-destructive"
      />
      <i
        v-else
        class="icon-[lucide--clock] size-4 text-muted-foreground"
      />
    </div>

    <!-- 任务信息 -->
    <div class="task-info flex-1 min-w-0">
      <div class="task-name text-sm font-medium truncate">
        {{ task.promptName || t('queue.defaultTaskName') }}
      </div>
      <div class="task-meta text-xs text-muted-foreground">
        <span v-if="isRunning">{{ t('queue.running') }}</span>
        <span v-else-if="isHistory">
          {{ formatTime(task.completionTime) }}
        </span>
        <span v-else>{{ t('queue.waiting') }}</span>
      </div>
    </div>

    <!-- 进度条 (运行中时显示) -->
    <div v-if="isRunning && progress" class="task-progress flex items-center gap-2">
      <div class="progress-bar w-24 h-1.5 bg-secondary-background rounded-full overflow-hidden">
        <div
          class="progress-fill h-full bg-primary rounded-full transition-all"
          :style="{ width: `${progress.percent}%` }"
        />
      </div>
      <span class="text-xs text-muted-foreground">{{ progress.percent }}%</span>
    </div>

    <!-- 操作按钮 -->
    <div class="task-actions flex items-center gap-1">
      <Button
        v-if="!isHistory"
        variant="ghost"
        size="icon"
        class="h-8 w-8"
        :aria-label="t('menu.interrupt')"
        @click="$emit('cancel', task.jobId)"
      >
        <i class="icon-[lucide--x] size-3" />
      </Button>
      <Button
        v-if="isHistory"
        variant="ghost"
        size="icon"
        class="h-8 w-8"
        :aria-label="t('queue.rerun')"
        @click="$emit('rerun', task.jobId)"
      >
        <i class="icon-[lucide--refresh-cw] size-3" />
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import Button from '@/components/ui/button/Button.vue'
import type { TaskItem } from '@/stores/queueStore'

const props = defineProps<{
  task: TaskItem
  isRunning?: boolean
  isHistory?: boolean
}>()

defineEmits<{
  (e: 'cancel', jobId: string): void
  (e: 'rerun', jobId: string): void
}>()

const { t } = useI18n()

const progress = computed(() => {
  if (!props.isRunning) return null
  // 从任务中获取进度信息
  return {
    percent: props.task.progress ?? 0
  }
})

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