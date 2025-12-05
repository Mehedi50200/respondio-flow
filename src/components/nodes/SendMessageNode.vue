<template>
  <div class="send-message-node">
    <div class="node-icon">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </div>
    <div class="node-content">
      <div class="node-title">{{ data.label || 'Send Message' }}</div>
      <div class="node-description">{{ truncatedDescription }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { NodeProps } from '@vue-flow/core'

interface SendMessageNodeData {
  label?: string
  description?: string
  payload?: Array<{ type: string; text?: string; attachment?: string }>
}

const props = defineProps<NodeProps<SendMessageNodeData>>()

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
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #10b981;
  color: white;
  border-radius: 8px;
  min-width: 200px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.node-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.node-content {
  flex: 1;
  min-width: 0;
}

.node-title {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.node-description {
  font-size: 12px;
  opacity: 0.9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>

