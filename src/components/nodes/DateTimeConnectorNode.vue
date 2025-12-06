<template>
  <div class="connector-node" :class="connectorClass">
    <div class="connector-label">{{ connectorLabel }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { NodeProps } from '@vue-flow/core'
import type { PayloadNode } from '@/types'

interface DateTimeConnectorNodeData {
  connectorType?: 'success' | 'failure'
  label?: string
  originalData?: PayloadNode
}

const props = defineProps<NodeProps<DateTimeConnectorNodeData>>()

const connectorType = computed(() => {
  return props.data.connectorType || 
         props.data.originalData?.data?.connectorType || 
         'success'
})

const connectorLabel = computed(() => {
  return props.data.label || 
         (connectorType.value === 'success' ? 'Success' : 'Failure')
})

const connectorClass = computed(() => {
  return connectorType.value === 'success' ? 'success' : 'failure'
})
</script>

<style scoped>
.connector-node {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  min-width: 100px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: default;
  user-select: none;
}

.connector-node.success {
  background: #10b981;
  color: white;
}

.connector-node.failure {
  background: #ef4444;
  color: white;
}

.connector-label {
  white-space: nowrap;
}
</style>

