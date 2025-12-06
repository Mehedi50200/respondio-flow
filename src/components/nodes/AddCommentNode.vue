<template>
  <div class="add-comment-node" :class="{ 'node-selected': selected }">
    <div class="node-header">
      <div class="node-icon-container">
        <div class="node-icon">
          <img :src="addCommentIcon" alt="Add Comment" />
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
import addCommentIcon from '@/assets/icons/add-comment-icon.svg?url'

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

.add-comment-node.node-selected {
  border: 2px solid var(--color-primary);
  box-shadow: 
    0 0 0 4px var(--color-primary-light),
    0 4px 12px rgba(0, 0, 0, 0.12),
    0 2px 4px rgba(0, 0, 0, 0.08);
}

[data-theme="dark"] .add-comment-node.node-selected {
  box-shadow: 
    0 0 0 4px rgba(96, 165, 250, 0.2),
    0 4px 12px rgba(0, 0, 0, 0.12),
    0 2px 4px rgba(0, 0, 0, 0.08);
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

.node-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
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

