<template>
  <div class="flow-chart-view">
    <FlowCanvas v-if="!isLoading && !isError" />
    <div v-if="isLoading" class="loading-state">
      <p>Loading flow chart...</p>
    </div>
    <div v-if="isError" class="error-state">
      <p>Error loading flow chart. Please try again.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import FlowCanvas from '@/components/FlowCanvas.vue'
import { useNodesQuery } from '@/composables/useNodesQuery'

const { isLoading, isError } = useNodesQuery()
</script>

<style scoped>
.flow-chart-view {
  width: 100%;
  height: 100vh;
  position: relative;
}

.loading-state,
.error-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  font-size: 18px;
  color: var(--color-text-secondary);
}

.error-state {
  color: var(--color-error);
}
</style>
