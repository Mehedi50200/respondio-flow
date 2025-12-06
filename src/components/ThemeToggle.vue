<template>
  <button 
    class="theme-toggle" 
    @click="toggleTheme" 
    :aria-label="`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`"
    :class="{ 'is-dark': theme === 'dark' }"
  >
    <div class="toggle-track">
      <div class="toggle-thumb">
        <img v-if="theme === 'light'" :src="sunIcon" alt="Sun" class="icon" />
        <img v-else :src="moonIcon" alt="Moon" class="icon" />
      </div>
    </div>
  </button>
</template>

<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'
import sunIcon from '@/assets/icons/sun-icon.svg?url'
import moonIcon from '@/assets/icons/moon-icon.svg?url'

const { theme, toggleTheme } = useTheme()
</script>

<style scoped>
.theme-toggle {
  position: fixed;
  bottom: var(--spacing-md);
  right: var(--spacing-md);
  z-index: 1000;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  outline: none;
}

.toggle-track {
  width: 56px;
  height: 32px;
  background: var(--color-border);
  border-radius: 16px;
  position: relative;
  transition: background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 2px;
}

.theme-toggle.is-dark .toggle-track {
  background: var(--color-primary);
}

.toggle-thumb {
  width: 28px;
  height: 28px;
  background: var(--color-surface-elevated);
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  color: var(--color-text-primary);
}

.theme-toggle.is-dark .toggle-thumb {
  transform: translateX(24px);
}

.theme-toggle:hover .toggle-thumb {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.theme-toggle:active .toggle-thumb {
  transform: translateX(0) scale(0.95);
}

.theme-toggle.is-dark:active .toggle-thumb {
  transform: translateX(24px) scale(0.95);
}

.icon {
  width: 16px;
  height: 16px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.theme-toggle:hover .icon {
  transform: scale(1.1);
}
</style>

