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
        <Background pattern-color="#e5e7eb" :gap="16" />
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
import type { VueFlowNode, VueFlowEdge } from '@/types'

// Import custom node components
import TriggerNode from './nodes/TriggerNode.vue'
import SendMessageNode from './nodes/SendMessageNode.vue'
import AddCommentNode from './nodes/AddCommentNode.vue'
import BusinessHoursNode from './nodes/BusinessHoursNode.vue'
import DateTimeConnectorNode from './nodes/DateTimeConnectorNode.vue'

// Import create node components
import CreateNodeModal from './CreateNodeModal.vue'
import NodeDetailsDrawer from './NodeDetailsDrawer.vue'

const router = useRouter()
const store = useNodesStore()

const isCreateModalOpen = ref(false)
const selectedParentId = ref<string | number | null>(null)
const isDrawerOpen = computed(() => !!router.currentRoute.value.params.id)
const selectedNodeId = computed(() => router.currentRoute.value.params.id as string | undefined)

// Provide add-node handler to all nodes
const handleAddNode = (nodeId: string) => {
  selectedParentId.value = nodeId
  isCreateModalOpen.value = true
}
provide('addNodeHandler', handleAddNode)

// Fetch nodes data (triggers query and updates store)
useNodesQuery()

// Register custom node types with add-node handler
const nodeTypes = {
  trigger: TriggerNode,
  sendMessage: SendMessageNode,
  addComment: AddCommentNode,
  businessHours: BusinessHoursNode,
  dateTimeConnector: DateTimeConnectorNode,
}

// Handle add-node events from nodes
const handleAddNode = (nodeId: string) => {
  selectedParentId.value = nodeId
  isCreateModalOpen.value = true
}

// Computed nodes and edges from store
const nodes = computed({
  get: () => store.nodes,
  set: (value: VueFlowNode[]) => store.setNodes(value),
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
const openCreateModal = (parentId?: string | number | null) => {
  selectedParentId.value = parentId || store.selectedNodeId
  isCreateModalOpen.value = true
}

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
  background: #f9fafb;
  position: relative;
  display: flex;
}

.canvas-wrapper {
  flex: 1;
  position: relative;
}
</style>
