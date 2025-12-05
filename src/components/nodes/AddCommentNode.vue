<template>
  <div class="add-comment-node">
    <div class="node-icon">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          fill="none"
        />
        <polyline
          points="14 2 14 8 20 8"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        <polyline points="10 9 9 9 8 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </div>
    <div class="node-content">
      <div class="node-title">{{ data.label || 'Add Comment' }}</div>
      <div class="node-description">{{ truncatedDescription }}</div>
    </div>
    <NodeAddButton @click="handleAddClick" />
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import type { NodeProps } from '@vue-flow/core'
import NodeAddButton from '../NodeAddButton.vue'

interface AddCommentNodeData {
  label?: string
  description?: string
  comment?: string
}

const props = defineProps<NodeProps<AddCommentNodeData>>()

const addNodeHandler = inject<(nodeId: string) => void>('addNodeHandler')

const handleAddClick = () => {
  if (addNodeHandler) {
    addNodeHandler(props.id)
  }
}

const truncatedDescription = computed(() => {
  const comment = props.data.comment || props.data.description || ''
  return comment.length > 50 ? comment.substring(0, 50) + '...' : comment || 'No comment'
})
</script>

<style scoped>
.add-comment-node {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 16px;
  background: #3b82f6;
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

