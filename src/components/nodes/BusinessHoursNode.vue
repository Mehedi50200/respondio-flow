<template>
  <div 
    class="business-hours-node node-base" 
    :class="{ 
      'node-selected': selected,
      'node-keyboard-focused': keyboardFocused 
    }"
  >
    <div class="node-header">
      <div class="node-icon-container">
        <div class="node-icon">
          <img :src="businessHoursIcon" alt="Business Hours" />
        </div>
      </div>
      <div class="node-title">{{ data.label || 'Business Hours' }}</div>
    </div>
    <div class="node-description">{{ data.description || `Business Hours - ${timezone}` }}</div>
    <NodeAddButton @click="handleAddClick" />
  </div>
</template>

<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import type { NodeProps } from '@vue-flow/core'
import NodeAddButton from '../NodeAddButton.vue'
import businessHoursIcon from '@/assets/icons/business-hours-icon.svg?url'

interface BusinessHoursNodeData {
  label?: string
  description?: string
  timezone?: string
  times?: Array<{ day: string; startTime: string; endTime: string }>
}

const props = defineProps<NodeProps<BusinessHoursNodeData>>()

// Get keyboard focused node ID from parent
const keyboardFocusedNodeId = inject<{ value: string | number | null }>('keyboardFocusedNodeId', ref(null))
const keyboardFocused = computed(() => {
  return keyboardFocusedNodeId && String(props.id) === String(keyboardFocusedNodeId.value)
})

const addNodeHandler = inject<(nodeId: string) => void>('addNodeHandler')

const handleAddClick = () => {
  if (addNodeHandler) {
    addNodeHandler(props.id)
  }
}

const timezone = computed(() => props.data.timezone || 'UTC')
</script>

<style scoped>
@import '@/styles/nodes.css';

.business-hours-node .node-icon-container {
  background: var(--color-node-business-hours);
}
</style>

