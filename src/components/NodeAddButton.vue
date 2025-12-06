<template>
  <div class="node-add-button" @click.stop="handleClick">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
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
  bottom: -40px;
  left: 50%;
  transform: translateX(-50%);
  width: 28px;
  height: 28px;
  background: var(--color-surface-elevated);
  border: none;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-primary);
  z-index: 10;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.12),
    0 1px 3px rgba(0, 0, 0, 0.08);
}

.node-add-button:hover {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  transform: translateX(-50%) scale(1.15);
  box-shadow: 
    0 4px 12px rgba(59, 130, 246, 0.4),
    0 2px 4px rgba(0, 0, 0, 0.1);
}

.node-add-button svg {
  width: 14px;
  height: 14px;
}
</style>

