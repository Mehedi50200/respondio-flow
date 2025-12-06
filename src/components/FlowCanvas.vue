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
import { computed, watch, ref, provide } from 'vue'
import { VueFlow, type NodeChange } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { useNodesStore } from '@/stores'
import { useNodesQuery } from '@/composables/useNodesQuery'
import { useRouter } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import type { VueFlowNode, VueFlowEdge } from '@/types'

// Import custom node components
import TriggerNode from './nodes/TriggerNode.vue'
import SendMessageNode from './nodes/SendMessageNode.vue'
import AddCommentNode from './nodes/AddCommentNode.vue'
import BusinessHoursNode from './nodes/BusinessHoursNode.vue'

// Import create node components
import CreateNodeModal from './CreateNodeModal.vue'
import NodeDetailsDrawer from './NodeDetailsDrawer.vue'
import ThemeToggle from './ThemeToggle.vue'

const router = useRouter()
const store = useNodesStore()
const { theme } = useTheme()

const isCreateModalOpen = ref(false)
const selectedParentId = ref<string | number | null>(null)
const isDrawerOpen = computed(() => !!router.currentRoute.value.params.id)
const selectedNodeId = computed(() => router.currentRoute.value.params.id as string | undefined)

// Dynamic pattern color based on theme
const patternColor = computed(() => {
  return theme.value === 'dark' ? '#374151' : '#9ca3af'
})

// Provide add-node handler to all nodes
const handleAddNode = (nodeId: string) => {
  selectedParentId.value = nodeId
  isCreateModalOpen.value = true
}
provide('addNodeHandler', handleAddNode)

// Fetch nodes data (triggers query and updates store)
useNodesQuery()

// Register custom node types
// Note: dateTimeConnector nodes are not rendered - they only exist as edge labels
const nodeTypes = {
  trigger: TriggerNode,
  sendMessage: SendMessageNode,
  addComment: AddCommentNode,
  businessHours: BusinessHoursNode,
}

// Computed nodes and edges from store
// Add selected state to nodes based on store.selectedNodeId
const nodes = computed({
  get: () => {
    return store.nodes.map((node) => ({
      ...node,
      selected: String(node.id) === String(store.selectedNodeId),
    }))
  },
  set: (value: (VueFlowNode & { selected?: boolean })[]) => {
    // Remove selected property before comparing
    const nodesWithoutSelected = value.map(({ selected, ...node }) => node)
    
    // Check if this is only a selection change by comparing node data
    // We need to check if nodes are the same except for selection state
    if (nodesWithoutSelected.length !== store.nodes.length) {
      // Node count changed, update store
      store.setNodes(nodesWithoutSelected)
      return
    }
    
    // Check if any node actually changed (position, data, etc.)
    const hasRealChanges = nodesWithoutSelected.some((newNode) => {
      const oldNode = store.nodes.find((n) => String(n.id) === String(newNode.id))
      if (!oldNode) return true // New node
      
      // Check if position changed (this is handled by onNodesChange, but we still need to sync)
      if (oldNode.position.x !== newNode.position.x || oldNode.position.y !== newNode.position.y) {
        return true // Position change
      }
      
      // Check if data changed (deep comparison)
      const oldDataStr = JSON.stringify(oldNode.data)
      const newDataStr = JSON.stringify(newNode.data)
      if (oldDataStr !== newDataStr) {
        return true // Data change
      }
      
      return false // No change
    })
    
    // Only update store if there are real changes (not just selection state)
    // Position changes are also handled by onNodesChange, but we sync here too for consistency
    if (hasRealChanges) {
    store.setNodes(nodesWithoutSelected)
    }
    // If it's only a selection change, we ignore it - Vue Flow manages selection internally
  },
})

const edges = computed({
  get: () => store.edges,
  set: (value: VueFlowEdge[]) => store.setEdges(value),
})

// Handle node position changes (dragging)
const onNodesChange = (changes: NodeChange[]) => {
  changes.forEach((change) => {
    if (change.type === 'position' && 'dragging' in change && change.dragging === false && 'position' in change) {
      // Node was dragged and released
      store.updateNodePosition(change.id, change.position)
    }
  })
}

// Handle node click - open drawer
const onNodeClick = (event: { node: VueFlowNode }) => {
  const node = event.node
  // Skip connector nodes (display only)
  if (node.type === 'dateTimeConnector') {
    return
  }
  
  // Navigate to node details drawer
  router.push(`/node/${node.id}`)
}

// Close drawer
const closeDrawer = () => {
  router.push('/')
}

// Watch for route changes to handle drawer opening
watch(
  () => router.currentRoute.value.params.id,
  (nodeId) => {
    if (nodeId) {
      store.setSelectedNode(nodeId as string)
    } else {
      store.clearSelectedNode()
    }
  },
  { immediate: true }
)

// Create node modal handlers
const closeCreateModal = () => {
  isCreateModalOpen.value = false
  selectedParentId.value = null
}

const handleNodeCreated = () => {
  // Node was created successfully
  // The mutation already updates the store, so nodes will refresh automatically
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

/* Edge label styling - Vue Flow uses SVG for labels */
.vue-flow__edge-label {
  font-size: 12px !important;
  font-weight: 500 !important;
  fill: #ffffff !important;
  pointer-events: none;
  padding-left: 12px !important;
  padding-right: 12px !important;
}

/* Add padding to label wrapper for better spacing */
.vue-flow__edge-labelwrapper {
  padding: 0 12px !important;
}

/* Success label background color - rx/ry are set via labelBgStyle in edge config */
.vue-flow__edge[data-label*="Success"] .vue-flow__edge-labelbg,
.vue-flow__edge[data-label="Success"] .vue-flow__edge-labelbg {
  fill: var(--color-node-success) !important;
}

/* Failure label background color */
.vue-flow__edge[data-label*="Failure"] .vue-flow__edge-labelbg,
.vue-flow__edge[data-label="Failure"] .vue-flow__edge-labelbg {
  fill: var(--color-node-failure) !important;
}

/* Ensure label text is white for both success and failure */
.vue-flow__edge[data-label*="Success"] .vue-flow__edge-label,
.vue-flow__edge[data-label="Success"] .vue-flow__edge-label,
.vue-flow__edge[data-label*="Failure"] .vue-flow__edge-label,
.vue-flow__edge[data-label="Failure"] .vue-flow__edge-label {
  fill: #ffffff !important;
}
</style>
