<template>
  <div class="send-message-node">
    <div class="node-icon">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    <div class="node-content">
      <div class="node-title">{{ data.label || 'Send Message' }}</div>
      <div class="node-description">{{ truncatedDescription }}</div>
    </div>
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
  padding: 16px;
  background: #10b981;
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

