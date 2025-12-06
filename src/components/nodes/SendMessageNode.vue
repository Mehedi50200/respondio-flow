<template>
  <div class="send-message-node">
    <div class="node-header">
      <div class="node-icon-container">
        <div class="node-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              fill="none"
            />
          </svg>
        </div>
      </div>
      <div class="node-title">{{ data.label || 'Send Message' }}</div>
    </div>
    <div class="node-description">{{ truncatedDescription }}</div>
    <NodeAddButton @click="handleAddClick" />
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import type { NodeProps } from '@vue-flow/core'
import NodeAddButton from '../NodeAddButton.vue'

interface SendMessageNodeData {
  label?: string
  description?: string
  payload?: Array<{ type: string; text?: string; attachment?: string }>
}

const props = defineProps<NodeProps<SendMessageNodeData>>()

const addNodeHandler = inject<(nodeId: string) => void>('addNodeHandler')

const handleAddClick = () => {
  if (addNodeHandler) {
    addNodeHandler(props.id)
  }
}

const truncatedDescription = computed(() => {
  if (props.data.description) {
    return props.data.description.length > 50
      ? props.data.description.substring(0, 50) + '...'
      : props.data.description
  }
  
  // Extract text from payload
  const textPayload = props.data.payload?.find((p) => p.type === 'text')
  if (textPayload?.text) {
    return textPayload.text.length > 50
      ? textPayload.text.substring(0, 50) + '...'
      : textPayload.text
  }
  
  return 'No message text'
})
</script>

<style scoped>
.send-message-node {
  position: relative;
  display: flex;
  flex-direction: column;
  background: var(--color-surface-elevated);
  color: var(--color-text-primary);
  border-radius: 12px;
  width: 240px;
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--color-border);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  overflow: visible;
}

.send-message-node:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.12),
    0 2px 4px rgba(0, 0, 0, 0.08);
  border-color: var(--color-border-light);
}

.node-header {
  display: flex;
  align-items: center;
  gap: 0;
  background: var(--color-surface-elevated);
  border-radius: 12px 12px 0 0;
  padding: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

[data-theme="dark"] .node-header {
  border-bottom-color: rgba(0, 0, 0, 0.3);
}

.node-icon-container {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-node-send-message);
  border-radius: 6px;
  margin-right: 12px;
}

.node-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  color: white;
}

.node-icon svg {
  width: 100%;
  height: 100%;
}

.node-title {
  flex: 1;
  font-weight: 600;
  font-size: 14px;
  line-height: 1.4;
  word-wrap: break-word;
  letter-spacing: -0.01em;
  color: var(--color-text-primary);
}

.node-description {
  padding: 12px;
  font-size: 12px;
  line-height: 1.4;
  word-wrap: break-word;
  font-weight: 400;
  color: var(--color-text-secondary);
  background: var(--color-surface-elevated);
  border-radius: 0 0 12px 12px;
}
</style>

