<template>
  <button 
    class="theme-toggle" 
    @click="toggleTheme" 
    :aria-label="`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`"
    :class="{ 'is-dark': theme === 'dark' }"
  >
    <div class="toggle-track">
      <div class="toggle-thumb">
        <svg v-if="theme === 'light'" class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="2" fill="none" />
          <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
        <svg v-else class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            fill="currentColor"
          />
        </svg>
      </div>
    </div>
  </button>
</template>

<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'

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

