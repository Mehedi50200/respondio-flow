<template>
  <div class="trigger-node">
    <div class="node-icon">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          fill="currentColor"
        />
      </svg>
    </div>
    <div class="node-content">
      <div class="node-title">{{ data.label || 'Trigger' }}</div>
      <div class="node-description">{{ data.description || 'Conversation Opened' }}</div>
    </div>
    <NodeAddButton @click="handleAddClick" />
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import type { NodeProps } from '@vue-flow/core'
import NodeAddButton from '../NodeAddButton.vue'

interface TriggerNodeData {
  label?: string
  description?: string
}

const props = defineProps<NodeProps<TriggerNodeData>>()

const addNodeHandler = inject<(nodeId: string) => void>('addNodeHandler')

const handleAddClick = () => {
  if (addNodeHandler) {
    addNodeHandler(props.id)
  }
}
</script>

<style scoped>
.trigger-node {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 16px;
  background: #8b5cf6;
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

