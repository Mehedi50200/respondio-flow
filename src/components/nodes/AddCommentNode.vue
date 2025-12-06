<template>
  <div 
    class="add-comment-node node-base" 
    :class="{ 
      'node-selected': selected,
      'node-keyboard-focused': keyboardFocused 
    }"
  >
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
import { computed, inject, ref } from 'vue'
import type { NodeProps } from '@vue-flow/core'
import NodeAddButton from '../NodeAddButton.vue'
import addCommentIcon from '@/assets/icons/add-comment-icon.svg?url'

interface AddCommentNodeData {
  label?: string
  description?: string
  comment?: string
}

const props = defineProps<NodeProps<AddCommentNodeData>>()

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

const truncatedDescription = computed(() => {
  const comment = props.data.comment || props.data.description || ''
  return comment.length > 50 ? comment.substring(0, 50) + '...' : comment || 'No comment'
})
</script>

<style scoped>
@import '@/styles/nodes.css';

.add-comment-node .node-icon-container {
  background: var(--color-node-add-comment);
}
</style>

