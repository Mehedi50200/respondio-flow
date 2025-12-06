<template>
  <div class="add-comment-node">
    <div class="node-header">
      <div class="node-icon-container">
        <div class="node-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
      </div>
      <div class="node-title">{{ data.label || 'Add Comment' }}</div>
    </div>
    <div class="node-description">{{ truncatedDescription }}</div>
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

.add-comment-node:hover {
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
  background: var(--color-node-add-comment);
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

