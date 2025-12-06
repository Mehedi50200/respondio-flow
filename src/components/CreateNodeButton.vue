<template>
  <button class="create-node-button" @click="openModal">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    </svg>
    <span>Create Node</span>
  </button>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (e: 'click'): void
}>()

const openModal = () => {
  emit('click')
}
</script>

<style scoped>
.create-node-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.create-node-button:hover {
  background: #2563eb;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

.create-node-button:active {
  transform: translateY(0);
}

.create-node-button svg {
  flex-shrink: 0;
}
</style>

