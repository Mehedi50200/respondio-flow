<template>
  <div class="flow-canvas-container">
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
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
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

const router = useRouter()
const store = useNodesStore()

// Fetch nodes data (triggers query and updates store)
useNodesQuery()

// Register custom node types
const nodeTypes = {
  trigger: TriggerNode,
  sendMessage: SendMessageNode,
  addComment: AddCommentNode,
  businessHours: BusinessHoursNode,
  dateTimeConnector: DateTimeConnectorNode,
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
</script>

<style>
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';

.flow-canvas-container {
  width: 100%;
  height: 100vh;
  background: #f9fafb;
}
</style>
