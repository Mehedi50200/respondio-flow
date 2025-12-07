<template>
  <div class="flow-canvas-container">
    <header 
      class="app-header" 
      :class="{ 'header-hidden': isHeaderHidden, 'header-visible': !isHeaderHidden }"
      @mouseenter="handleMouseEnter"
    >
      <div class="header-content">
        <div class="logo-section">
          <div class="logo-wrapper">
            <img src="/favicon.png" alt="Respond.io Logo" class="app-logo" />
          </div>
          <div class="title-section">
            <h1 class="app-title">Respond.io</h1>
            <span class="app-subtitle">Flow Chart</span>
          </div>
        </div>
        <div class="header-actions">
          <ThemeToggle />
        </div>
      </div>
    </header>
    <div class="canvas-wrapper">
      <VueFlow
        v-model:nodes="nodes"
        v-model:edges="edges"
        :node-types="nodeTypes"
        :fit-view-on-init="true"
        :min-zoom="0.2"
        :max-zoom="2"
        @nodes-change="onNodesChange"
        @node-click="onNodeClick"
      >
        <Background :pattern-color="patternColor" :gap="16" />
        <Controls />
      </VueFlow>
      
      <!-- Keyboard Shortcuts Info -->
      <div class="keyboard-shortcuts" v-if="!isDrawerOpen">
        <div class="shortcuts-title">Keyboard Shortcuts</div>
        <div class="shortcut-item">
          <kbd>↑</kbd><kbd>↓</kbd> Navigate nodes
        </div>
        <div class="shortcut-item">
          <kbd>Enter</kbd> Open node details
        </div>
        <div class="shortcut-item">
          <kbd>Ctrl</kbd>+<kbd>Z</kbd> Undo
        </div>
        <div class="shortcut-item">
          <kbd>Ctrl</kbd>+<kbd>Y</kbd> Redo
        </div>
      </div>
    </div>
    
    <NodeDetailsDrawer
      :is-open="isDrawerOpen"
      :node-id="selectedNodeId"
      @close="closeDrawer"
    />
    
    <CreateNodeModal
      :is-open="isCreateModalOpen"
      :selected-parent-id="selectedParentId"
      @close="closeCreateModal"
      @created="handleNodeCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, watch, ref, provide, onMounted, onUnmounted } from 'vue'
import { VueFlow, type NodeChange } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { useNodesStore } from '@/stores'
import { useNodesQuery } from '@/composables/useNodesQuery'
import { useRouter } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import { useHistory } from '@/composables/useHistory'
import { useKeyboardNavigation } from '@/composables/useKeyboardNavigation'
import type { VueFlowNode, VueFlowEdge } from '@/types'

import TriggerNode from './nodes/TriggerNode.vue'
import SendMessageNode from './nodes/SendMessageNode.vue'
import AddCommentNode from './nodes/AddCommentNode.vue'
import BusinessHoursNode from './nodes/BusinessHoursNode.vue'
import CreateNodeModal from './CreateNodeModal.vue'
import NodeDetailsDrawer from './NodeDetailsDrawer.vue'
import ThemeToggle from './ThemeToggle.vue'

const router = useRouter()
const store = useNodesStore()
const { theme } = useTheme()
const { canUndo, canRedo, undo, redo, saveState, initHistory } = useHistory()
const keyboardNav = useKeyboardNavigation()

const isHeaderHidden = ref(false)
let hideTimeout: ReturnType<typeof setTimeout> | null = null
let showTimeout: ReturnType<typeof setTimeout> | null = null

const handleUndoRedo = (event: KeyboardEvent) => {
  const target = event.target as HTMLElement
  if (
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.isContentEditable
  ) {
    return
  }

  if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
    event.preventDefault()
    if (canUndo.value) {
      undo()
    }
  } else if ((event.ctrlKey || event.metaKey) && (event.key === 'y' || (event.key === 'z' && event.shiftKey))) {
    event.preventDefault()
    if (canRedo.value) {
      redo()
    }
  }
}

const combinedKeyHandler = (event: KeyboardEvent) => {
  handleUndoRedo(event)
  if (keyboardNav.handleKeyDown) {
    keyboardNav.handleKeyDown(event)
  }
}

const handleMouseMove = (event: MouseEvent) => {
  const mouseY = event.clientY
  const headerHeight = 73
  
  if (hideTimeout) {
    clearTimeout(hideTimeout)
    hideTimeout = null
  }
  if (showTimeout) {
    clearTimeout(showTimeout)
    showTimeout = null
  }

  if (mouseY < headerHeight + 20) {
    showTimeout = setTimeout(() => {
      isHeaderHidden.value = false
    }, 100)
  } else if (mouseY > headerHeight + 50 && !isHeaderHidden.value) {
    hideTimeout = setTimeout(() => {
      isHeaderHidden.value = true
    }, 2000)
  }
}

const handleMouseEnter = () => {
  if (hideTimeout) {
    clearTimeout(hideTimeout)
    hideTimeout = null
  }
  if (showTimeout) {
    clearTimeout(showTimeout)
    showTimeout = null
  }
  isHeaderHidden.value = false
}

onMounted(() => {
  window.addEventListener('keydown', combinedKeyHandler)
  window.addEventListener('mousemove', handleMouseMove, { passive: true })
  
  setTimeout(() => {
    if (!isHeaderHidden.value) {
      hideTimeout = setTimeout(() => {
        isHeaderHidden.value = true
      }, 3000)
    }
  }, 2000)
})

onUnmounted(() => {
  window.removeEventListener('keydown', combinedKeyHandler)
  window.removeEventListener('mousemove', handleMouseMove)
  if (saveStateTimeout) {
    clearTimeout(saveStateTimeout)
    saveStateTimeout = null
  }
  if (hideTimeout) {
    clearTimeout(hideTimeout)
    hideTimeout = null
  }
  if (showTimeout) {
    clearTimeout(showTimeout)
    showTimeout = null
  }
})

const isCreateModalOpen = ref(false)
const selectedParentId = ref<string | number | null>(null)
const isDrawerOpen = computed(() => !!router.currentRoute.value.params.id)
const selectedNodeId = computed(() => router.currentRoute.value.params.id as string | undefined)

const patternColor = computed(() => {
  return theme.value === 'dark' ? '#374151' : '#9ca3af'
})

const handleAddNode = (nodeId: string) => {
  selectedParentId.value = nodeId
  isCreateModalOpen.value = true
}
provide('addNodeHandler', handleAddNode)
provide('keyboardFocusedNodeId', keyboardNav.focusedNodeId)

const { data: nodesData } = useNodesQuery()

let historyInitialized = false
watch(nodesData, (data) => {
  if (data?.nodes && data.nodes.length > 0 && !historyInitialized) {
    setTimeout(() => {
      if (store.nodes.length > 0) {
        initHistory()
        historyInitialized = true
      }
    }, 100)
  }
}, { immediate: true })

let saveStateTimeout: ReturnType<typeof setTimeout> | null = null
watch(
  [() => store.nodes, () => store.edges],
  () => {
    if (historyInitialized) {
      if (saveStateTimeout) {
        clearTimeout(saveStateTimeout)
      }
      saveStateTimeout = setTimeout(() => {
        saveState()
        saveStateTimeout = null
      }, 100)
    }
  },
  { deep: true }
)

const nodeTypes = {
  trigger: TriggerNode,
  sendMessage: SendMessageNode,
  addComment: AddCommentNode,
  businessHours: BusinessHoursNode,
}

const nodes = computed({
  get: () => {
    return store.nodes.map((node) => ({
      ...node,
      selected: String(node.id) === String(store.selectedNodeId),
    }))
  },
  set: (value: (VueFlowNode & { selected?: boolean })[]) => {
    const nodesWithoutSelected = value.map(({ selected, ...node }) => node)
    
    if (nodesWithoutSelected.length !== store.nodes.length) {
      store.setNodes(nodesWithoutSelected)
      return
    }
    
    const hasRealChanges = nodesWithoutSelected.some((newNode) => {
      const oldNode = store.nodes.find((n) => String(n.id) === String(newNode.id))
      if (!oldNode) return true
      
      if (oldNode.position.x !== newNode.position.x || oldNode.position.y !== newNode.position.y) {
        return true
      }
      
      const oldDataStr = JSON.stringify(oldNode.data)
      const newDataStr = JSON.stringify(newNode.data)
      if (oldDataStr !== newDataStr) {
        return true
      }
      
      return false
    })
    
    if (hasRealChanges) {
      store.setNodes(nodesWithoutSelected)
    }
  },
})

const edges = computed({
  get: () => store.edges,
  set: (value: VueFlowEdge[]) => store.setEdges(value),
})

const onNodesChange = (changes: NodeChange[]) => {
  changes.forEach((change) => {
    if (change.type === 'position' && 'dragging' in change && change.dragging === false && 'position' in change) {
      store.updateNodePosition(change.id, change.position)
    }
  })
}

const onNodeClick = (event: { node: VueFlowNode }) => {
  const node = event.node
  if (node.type === 'dateTimeConnector') {
    return
  }
  
  keyboardNav.focusedNodeId.value = null
  router.push(`/node/${node.id}`)
}

const closeDrawer = () => {
  router.push('/')
}

watch(
  () => router.currentRoute.value.params.id,
  (nodeId) => {
    if (nodeId) {
      store.setSelectedNode(nodeId as string)
    } else {
      store.clearSelectedNode()
      keyboardNav.focusedNodeId.value = null
    }
  },
  { immediate: true }
)

const closeCreateModal = () => {
  isCreateModalOpen.value = false
  selectedParentId.value = null
}

const handleNodeCreated = () => {
  closeCreateModal()
}
</script>

<style>
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';

.flow-canvas-container {
  width: 100%;
  height: 100vh;
  background: var(--color-surface);
  position: relative;
  display: flex;
  flex-direction: column;
  transition: background-color var(--transition-base);
}

.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: var(--color-surface-elevated);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color-border);
  padding: var(--spacing-md) var(--spacing-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 1000;
  flex-shrink: 0;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), 
              box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.app-header.header-hidden {
  transform: translateY(-100%);
}

.app-header.header-visible {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

[data-theme="dark"] .app-header {
  background: rgba(31, 41, 55, 0.8);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  border-bottom-color: transparent;
}

[data-theme="dark"] .app-header.header-visible {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  border-bottom-color: transparent;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 100%;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex: 1;
  min-width: 0;
}

.logo-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: var(--color-surface);
  padding: 6px;
  flex-shrink: 0;
}

[data-theme="dark"] .logo-wrapper {
  background: rgba(55, 65, 81, 0.5);
}

.app-logo {
  height: 100%;
  width: 100%;
  object-fit: contain;
}

.title-section {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.app-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1.2;
  letter-spacing: -0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.app-subtitle {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-secondary);
  line-height: 1.2;
  letter-spacing: 0.01em;
  text-transform: uppercase;
  opacity: 0.8;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-shrink: 0;
}

.canvas-wrapper {
  flex: 1;
  position: relative;
  overflow: hidden;
  margin-top: 73px;
  height: calc(100vh - 73px);
}

.keyboard-shortcuts {
  position: fixed;
  bottom: var(--spacing-md);
  right: var(--spacing-md);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  font-size: 12px;
  color: var(--color-text-secondary);
  box-shadow: var(--shadow-lg);
  z-index: 100;
  max-width: 200px;
  transition: opacity var(--transition-base);
}

.keyboard-shortcuts:hover {
  opacity: 0.9;
}

.shortcuts-title {
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
  color: var(--color-text-primary);
  font-size: 13px;
}

.shortcut-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-xs);
}

.shortcut-item:last-child {
  margin-bottom: 0;
}

kbd {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 2px 6px;
  font-size: 11px;
  font-family: monospace;
  color: var(--color-text-primary);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}
</style>
