<template>
  <div class="business-hours-node">
    <div class="node-icon">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
        <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
    </div>
    <div class="node-content">
      <div class="node-title">{{ data.label || 'Business Hours' }}</div>
      <div class="node-description">{{ data.description || `Business Hours - ${timezone}` }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { NodeProps } from '@vue-flow/core'

interface BusinessHoursNodeData {
  label?: string
  description?: string
  timezone?: string
  times?: Array<{ day: string; startTime: string; endTime: string }>
}

const props = defineProps<NodeProps<BusinessHoursNodeData>>()

const timezone = computed(() => props.data.timezone || 'UTC')
</script>

<style scoped>
.business-hours-node {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #f59e0b;
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

