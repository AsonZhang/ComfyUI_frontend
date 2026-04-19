<template>
  <div v-if="!workspaceStore.focusMode" class="ml-1 flex flex-col gap-1 pt-1">
    <div class="flex gap-x-0.5">
      <div class="min-w-0 flex-1">
        <SubgraphBreadcrumb />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWorkspaceStore } from '@/stores/workspaceStore'
import SubgraphBreadcrumb from '@/components/breadcrumb/SubgraphBreadcrumb.vue'

const workspaceStore = useWorkspaceStore()
</script>
