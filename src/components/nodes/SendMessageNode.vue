<template>
  <div class="send-message-node node-base" :class="{ 'node-selected': selected }">
    <div class="node-header">
      <div class="node-icon-container">
        <div class="node-icon">
          <img :src="sendMessageIcon" alt="Send Message" />
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
import sendMessageIcon from '@/assets/icons/send-message-icon.svg?url'

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
@import '@/styles/nodes.css';

.send-message-node .node-icon-container {
  background: var(--color-node-send-message);
}
</style>

