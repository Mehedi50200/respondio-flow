<template>
  <div class="business-hours-node">
    <div class="node-icon">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2" />
        <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
    </div>
    <div class="node-content">
      <div class="node-title">{{ data.label || 'Business Hours' }}</div>
      <div class="node-description">{{ data.description || `Business Hours - ${timezone}` }}</div>
    </div>
    <NodeAddButton @click="handleAddClick" />
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import type { NodeProps } from '@vue-flow/core'
import NodeAddButton from '../NodeAddButton.vue'

interface BusinessHoursNodeData {
  label?: string
  description?: string
  timezone?: string
  times?: Array<{ day: string; startTime: string; endTime: string }>
}

const props = defineProps<NodeProps<BusinessHoursNodeData>>()

const addNodeHandler = inject<(nodeId: string) => void>('addNodeHandler')

const handleAddClick = () => {
  if (addNodeHandler) {
    addNodeHandler(props.id)
  }
}

const timezone = computed(() => props.data.timezone || 'UTC')
</script>

<style scoped>
.business-hours-node {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 16px;
  background: #f59e0b;
  color: white;
  border-radius: 8px;
  width: 240px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.node-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 12px;
  width: 24px;
  height: 24px;
}

.node-icon svg {
  width: 100%;
  height: 100%;
}

.node-content {
  flex: 1;
  min-width: 0;
}

.node-title {
  font-weight: 600;
  font-size: 15px;
  margin-bottom: 6px;
  line-height: 1.3;
  word-wrap: break-word;
  letter-spacing: -0.01em;
}

.node-description {
  font-size: 13px;
  opacity: 0.85;
  line-height: 1.4;
  word-wrap: break-word;
}
</style>

