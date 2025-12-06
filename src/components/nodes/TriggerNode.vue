<template>
  <div class="trigger-node node-base" :class="{ 'node-selected': selected }">
    <div class="node-header">
      <div class="node-icon-container">
        <div class="node-icon">
          <img :src="triggerIcon" alt="Trigger" />
        </div>
      </div>
      <div class="node-title">{{ data.label || 'Trigger' }}</div>
    </div>
    <div class="node-description">{{ data.description || 'Conversation Opened' }}</div>
    <NodeAddButton @click="handleAddClick" />
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import type { NodeProps } from '@vue-flow/core'
import NodeAddButton from '../NodeAddButton.vue'
import triggerIcon from '@/assets/icons/trigger-icon.svg?url'

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
@import '@/styles/nodes.css';

.trigger-node .node-icon-container {
  background: var(--color-node-trigger);
}
</style>

