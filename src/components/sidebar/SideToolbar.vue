<template>
  <nav
    ref="sideToolbarRef"
    data-testid="side-toolbar"
    class="side-tool-bar-container flex h-full flex-col items-center bg-transparent [.floating-sidebar]:-mr-2"
    :class="{
      'small-sidebar': isSmall,
      'connected-sidebar pointer-events-auto': isConnected,
      'floating-sidebar': !isConnected,
      'overflowing-sidebar': isOverflowing,
      'border-r border-(--interface-stroke) shadow-interface': isConnected
    }"
  >
    <div
      :class="
        isOverflowing
          ? 'side-tool-bar-container overflow-y-auto'
          : 'flex h-full flex-col'
      "
    >
      <div ref="topToolbarRef" :class="groupClasses">
        <SidebarIcon
          v-for="tab in tabs"
          :key="tab.id"
          :icon="tab.icon"
          :icon-badge="tab.iconBadge"
          :tooltip="tab.tooltip"
          :tooltip-suffix="getTabTooltipSuffix(tab)"
          :label="tab.label || tab.title"
          :is-small="isSmall"
          :selected="tab.id === selectedTab?.id"
          :class="tab.id + '-tab-button'"
          @click="onTabClick(tab)"
        />
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core'
import { debounce } from 'es-toolkit/compat'
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch
} from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'

import SidebarIcon from './SidebarIcon.vue'
import { useSettingStore } from '@/platform/settings/settingStore'
import { useCanvasStore } from '@/renderer/core/canvas/canvasStore'
import { useCommandStore } from '@/stores/commandStore'
import { useKeybindingStore } from '@/platform/keybindings/keybindingStore'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useSidebarTabStore } from '@/stores/workspace/sidebarTabStore'
import type { SidebarTabExtension } from '@/types/extensionTypes'
import { cn } from '@/utils/tailwindUtil'

const { t } = useI18n()
const workspaceStore = useWorkspaceStore()
const settingStore = useSettingStore()
const commandStore = useCommandStore()
const canvasStore = useCanvasStore()
const sidebarTabStore = useSidebarTabStore()
const keybindingStore = useKeybindingStore()
const sideToolbarRef = ref<HTMLElement>()
const topToolbarRef = ref<HTMLElement>()

const isSmall = computed(
  () => settingStore.get('Comfy.Sidebar.Size') === 'small'
)
const sidebarLocation = computed<'left' | 'right'>(() =>
  settingStore.get('Comfy.Sidebar.Location')
)
const sidebarStyle = computed(() => settingStore.get('Comfy.Sidebar.Style'))
const { activeSidebarTab: selectedTab } = storeToRefs(sidebarTabStore)
const isConnected = computed(
  () =>
    selectedTab.value ||
    isOverflowing.value ||
    sidebarStyle.value === 'connected'
)

const tabs = computed(() => sidebarTabStore.sidebarTabs)

const onTabClick = async (item: SidebarTabExtension) => {
  await commandStore.commands
    .find((cmd) => cmd.id === `Workspace.ToggleSidebarTab.${item.id}`)
    ?.function?.()
}

const keybindingStore = useKeybindingStore()
const getTabTooltipSuffix = (tab: SidebarTabExtension) => {
  const shortcut = keybindingStore
    .getKeybindingByCommandId(`Workspace.ToggleSidebarTab.${tab.id}`)
    ?.combo.toString()
  return shortcut ? t('g.shortcutSuffix', { shortcut }) : ''
}

const isOverflowing = ref(false)
const groupClasses = computed(() =>
  cn(
    'sidebar-item-group flex shrink-0 flex-col items-center overflow-hidden',
    !isConnected.value && 'pointer-events-auto rounded-lg shadow-interface'
  )
)

const ENTER_OVERFLOW_MARGIN = 20
const EXIT_OVERFLOW_MARGIN = 50

const checkOverflow = debounce(() => {
  if (!sideToolbarRef.value || !topToolbarRef.value)
    return

  const containerHeight = sideToolbarRef.value.clientHeight
  const topHeight = topToolbarRef.value.scrollHeight

  if (isOverflowing.value) {
    isOverflowing.value = containerHeight < topHeight + EXIT_OVERFLOW_MARGIN
  } else {
    isOverflowing.value =
      containerHeight < topHeight + ENTER_OVERFLOW_MARGIN
  }
}, 16)

onMounted(() => {
  if (!sideToolbarRef.value) return

  const overflowObserver = useResizeObserver(
    sideToolbarRef.value,
    checkOverflow
  )

  checkOverflow()

  onBeforeUnmount(() => {
    overflowObserver.stop()
  })

  watch(
    [isSmall, sidebarLocation],
    async () => {
      if (canvasStore.canvas) {
        if (sidebarLocation.value === 'left') {
          await nextTick()
          canvasStore.canvas.fpsInfoLocation = [
            sideToolbarRef.value?.getBoundingClientRect()?.right,
            null
          ]
        } else {
          canvasStore.canvas.fpsInfoLocation = null
        }
        canvasStore.canvas.setDirty(false, true)
      }
    },
    { immediate: true }
  )
})
</script>

<style>
/* Global CSS variables for sidebar
 * These variables need to be global (not scoped) because they are used by
 * teleported components like WhatsNewPopup that render outside the sidebar
 * but need to reference sidebar dimensions for proper positioning.
 */
:root {
  --sidebar-padding: 4px;
  --sidebar-icon-size: 1rem;

  --sidebar-default-floating-width: 48px;
  --sidebar-default-connected-width: calc(
    var(--sidebar-default-floating-width) + var(--sidebar-padding) * 2
  );
  --sidebar-default-item-height: 56px;

  --sidebar-small-floating-width: 48px;
  --sidebar-small-connected-width: calc(
    var(--sidebar-small-floating-width) + var(--sidebar-padding) * 2
  );
  --sidebar-small-item-height: 48px;

  --sidebar-width: var(--sidebar-default-floating-width);
  --sidebar-item-height: var(--sidebar-default-item-height);
}

:root:has(.side-tool-bar-container.small-sidebar) {
  --sidebar-width: var(--sidebar-small-floating-width);
  --sidebar-item-height: var(--sidebar-small-item-height);
}

:root:has(.side-tool-bar-container.connected-sidebar) {
  --sidebar-width: var(--sidebar-default-connected-width);
}

:root:has(.side-tool-bar-container.small-sidebar.connected-sidebar) {
  --sidebar-width: var(--sidebar-small-connected-width);
}
</style>

<style scoped>
.floating-sidebar {
  padding: var(--sidebar-padding);
}

.floating-sidebar .sidebar-item-group {
  border-color: var(--p-panel-border-color);
}

.connected-sidebar {
  padding: var(--sidebar-padding) 0;
  background-color: var(--comfy-menu-bg);
}

.sidebar-item-group {
  background-color: var(--comfy-menu-bg);
  border: 1px solid transparent;
}

.overflowing-sidebar :deep(.comfy-menu-button-wrapper) {
  position: sticky;
  top: 0;
  z-index: 1;
  background-color: var(--comfy-menu-bg);
}
</style>
