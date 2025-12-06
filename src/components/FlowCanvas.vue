<template>
  <div class="flow-canvas-container">
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
    
    <ThemeToggle />
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

onMounted(() => {
  window.addEventListener('keydown', combinedKeyHandler)
})

onUnmounted(() => {
  window.removeEventListener('keydown', combinedKeyHandler)
  if (saveStateTimeout) {
    clearTimeout(saveStateTimeout)
    saveStateTimeout = null
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
  transition: background-color var(--transition-base);
}

.canvas-wrapper {
  flex: 1;
  position: relative;
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

.vue-flow__edge-label {
  font-size: 12px !important;
  font-weight: 500 !important;
  fill: #ffffff !important;
  pointer-events: none;
  padding: 0 12px !important;
}

.vue-flow__edge-labelwrapper {
  padding: 0 12px !important;
}

.vue-flow__edge[data-label*="Success"] .vue-flow__edge-labelbg,
.vue-flow__edge[data-label="Success"] .vue-flow__edge-labelbg {
  fill: var(--color-node-success) !important;
}

.vue-flow__edge[data-label*="Failure"] .vue-flow__edge-labelbg,
.vue-flow__edge[data-label="Failure"] .vue-flow__edge-labelbg {
  fill: var(--color-node-failure) !important;
}

.vue-flow__edge[data-label*="Success"] .vue-flow__edge-label,
.vue-flow__edge[data-label="Success"] .vue-flow__edge-label,
.vue-flow__edge[data-label*="Failure"] .vue-flow__edge-label,
.vue-flow__edge[data-label="Failure"] .vue-flow__edge-label {
  fill: #ffffff !important;
}
</style>
