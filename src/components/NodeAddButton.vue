<template>
  <div class="node-add-button" @click.stop="handleClick">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
      <path d="M12 8v8M8 12h8" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    </svg>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (e: 'click'): void
}>()

const handleClick = () => {
  emit('click')
}
</script>

<style scoped>
.node-add-button {
  position: absolute;
  bottom: -16px;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 24px;
  background: white;
  border: 2px solid #3b82f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #3b82f6;
  z-index: 10;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.node-add-button:hover {
  background: #3b82f6;
  color: white;
  transform: translateX(-50%) scale(1.1);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
}

.node-add-button svg {
  width: 12px;
  height: 12px;
}
</style>

