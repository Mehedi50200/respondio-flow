<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
      <div class="modal-container">
        <div class="modal-header">
          <h2>Create New Node</h2>
          <button class="close-button" @click="closeModal">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="modal-form">
          <div class="form-group">
            <label for="node-type">Node Type *</label>
            <select 
              id="node-type" 
              v-model="formData.type" 
              required
              @change="clearFieldError('type')"
              :class="{ 'input-error': fieldErrors.type }"
            >
              <option value="">Select a type</option>
              <option value="sendMessage">Send Message</option>
              <option value="addComment">Add Comment</option>
              <option value="businessHours">Business Hours</option>
            </select>
            <span v-if="fieldErrors.type" class="field-error">{{ fieldErrors.type }}</span>
          </div>

          <div class="form-group">
            <label for="node-title">Title *</label>
            <input
              id="node-title"
              v-model="formData.title"
              type="text"
              placeholder="Enter node title"
              required
              minlength="1"
              maxlength="100"
              @blur="validateTitle"
              @input="clearFieldError('title')"
              :class="{ 'input-error': fieldErrors.title }"
            />
            <span v-if="fieldErrors.title" class="field-error">{{ fieldErrors.title }}</span>
            <span v-else class="field-hint">Minimum 1 character, maximum 100 characters</span>
          </div>

          <div class="form-group">
            <label for="node-description">Description</label>
            <textarea
              id="node-description"
              v-model="formData.description"
              placeholder="Enter description"
              rows="4"
              maxlength="500"
              @input="clearFieldError('description')"
              :class="{ 'input-error': fieldErrors.description }"
            ></textarea>
            <span v-if="fieldErrors.description" class="field-error">{{ fieldErrors.description }}</span>
            <span v-else class="field-hint">{{ formData.description.length }}/500 characters</span>
          </div>

          <div v-if="formData.type === 'businessHours'" class="form-group">
            <label for="timezone">Timezone</label>
            <select id="timezone" v-model="formData.timezone">
              <option value="UTC">UTC</option>
              <option value="America/New_York">America/New_York</option>
              <option value="America/Los_Angeles">America/Los_Angeles</option>
              <option value="Europe/London">Europe/London</option>
              <option value="Asia/Tokyo">Asia/Tokyo</option>
              <option value="Asia/Dubai">Asia/Dubai</option>
            </select>
          </div>

          <div v-if="selectedParentId" class="form-group">
            <label>Parent Node</label>
            <div class="parent-info">
              <span>{{ parentNodeLabel }}</span>
            </div>
          </div>

          <div v-if="error" class="error-message">
            {{ error }}
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="closeModal">
              Cancel
            </button>
            <button type="submit" class="btn-primary" :disabled="isSubmitting">
              {{ isSubmitting ? 'Creating...' : 'Create Node' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useNodesStore } from '@/stores'
import { useCreateNodeMutation } from '@/composables/useNodesQuery'
import { useHistory } from '@/composables/useHistory'
import type { NodeCreationData } from '@/types'

interface Props {
  isOpen: boolean
  selectedParentId?: string | number | null
}

const props = withDefaults(defineProps<Props>(), {
  selectedParentId: null,
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'created'): void
}>()

const store = useNodesStore()
const createNodeMutation = useCreateNodeMutation()
const { saveState } = useHistory()

const formData = ref<{
  type: NodeCreationData['type'] | ''
  title: string
  description: string
  timezone: string
}>({
  type: '',
  title: '',
  description: '',
  timezone: 'UTC',
})

const error = ref<string>('')
const isSubmitting = ref(false)
const fieldErrors = ref<{
  type?: string
  title?: string
  description?: string
}>({})

const parentNodeLabel = computed(() => {
  if (!props.selectedParentId) return 'None (Root)'
  const parent = store.getNodeById(props.selectedParentId)
  return parent?.data?.label || `Node ${props.selectedParentId}`
})

const closeModal = () => {
  if (isSubmitting.value) return
  resetForm()
  emit('close')
}

const resetForm = () => {
  formData.value = {
    type: '',
    title: '',
    description: '',
    timezone: 'UTC',
  }
  error.value = ''
  fieldErrors.value = {}
  isSubmitting.value = false
}

const validateTitle = () => {
  const title = formData.value.title.trim()
  if (!title) {
    fieldErrors.value.title = 'Title is required'
    return false
  }
  if (title.length < 1) {
    fieldErrors.value.title = 'Title must be at least 1 character'
    return false
  }
  if (title.length > 100) {
    fieldErrors.value.title = 'Title must not exceed 100 characters'
    return false
  }
  clearFieldError('title')
  return true
}

const validateForm = (): boolean => {
  fieldErrors.value = {}
  let isValid = true

  if (!formData.value.type) {
    fieldErrors.value.type = 'Please select a node type'
    isValid = false
  }

  if (!validateTitle()) {
    isValid = false
  }

  const description = formData.value.description.trim()
  if (description.length > 500) {
    fieldErrors.value.description = 'Description must not exceed 500 characters'
    isValid = false
  }

  return isValid
}

const clearFieldError = (field: keyof typeof fieldErrors.value) => {
  if (fieldErrors.value[field]) {
    delete fieldErrors.value[field]
  }
}

const handleSubmit = async () => {
  error.value = ''

  if (!validateForm()) {
    error.value = 'Please fix the errors above'
    return
  }

  isSubmitting.value = true

  try {
    const nodeData: NodeCreationData = {
      type: formData.value.type as NodeCreationData['type'],
      title: formData.value.title.trim(),
      description: formData.value.description.trim(),
      parentId: props.selectedParentId || undefined,
    }

    if (formData.value.type === 'businessHours') {
      ;(nodeData as any).timezone = formData.value.timezone
    }

    await createNodeMutation.mutateAsync(nodeData)
    saveState()
    resetForm()
    emit('created')
    emit('close')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to create node. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

watch(() => props.isOpen, (isOpen) => {
  if (!isOpen) {
    resetForm()
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn var(--transition-base);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-container {
  background: var(--color-surface-elevated);
  border-radius: var(--radius-xl);
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-xl);
  animation: slideUp var(--transition-base);
  transition: background-color var(--transition-base);
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.close-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--spacing-xs);
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  transition: all var(--transition-base);
}

.close-button:hover {
  background: var(--color-surface);
  color: var(--color-text-primary);
}

.modal-form {
  padding: var(--spacing-lg);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: var(--spacing-sm);
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px 12px;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 14px;
  font-family: inherit;
  color: var(--color-text-primary);
  transition: border-color var(--transition-base), background-color var(--transition-base);
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.form-group input.input-error,
.form-group textarea.input-error,
.form-group select.input-error {
  border-color: var(--color-error);
}

.form-group input.input-error:focus,
.form-group textarea.input-error:focus,
.form-group select.input-error:focus {
  border-color: var(--color-error);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
}

.field-error {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: var(--color-error);
}

.field-hint {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.parent-info {
  padding: 10px 12px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 14px;
  color: var(--color-text-secondary);
}

.error-message {
  padding: 12px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--color-error);
  border-radius: var(--radius-md);
  color: var(--color-error);
  font-size: 14px;
  margin-bottom: 20px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.btn-primary,
.btn-secondary {
  padding: 10px 20px;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-base);
  border: none;
}

.btn-primary {
  background: var(--color-primary);
  color: var(--color-text-inverse);
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--color-surface);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover {
  background: var(--color-border-light);
}
</style>

