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
            <select id="node-type" v-model="formData.type" required>
              <option value="">Select a type</option>
              <option value="sendMessage">Send Message</option>
              <option value="addComment">Add Comment</option>
              <option value="businessHours">Business Hours</option>
            </select>
          </div>

          <div class="form-group">
            <label for="node-title">Title *</label>
            <input
              id="node-title"
              v-model="formData.title"
              type="text"
              placeholder="Enter node title"
              required
              maxlength="100"
            />
          </div>

          <div class="form-group">
            <label for="node-description">Description</label>
            <textarea
              id="node-description"
              v-model="formData.description"
              placeholder="Enter description"
              rows="4"
              maxlength="500"
            ></textarea>
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
  isSubmitting.value = false
}

const handleSubmit = async () => {
  error.value = ''

  if (!formData.value.type || !formData.value.title.trim()) {
    error.value = 'Please fill in all required fields'
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

    await createNodeMutation.mutateAsync(nodeData)
    
    resetForm()
    emit('created')
    emit('close')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to create node. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

// Reset form when modal closes
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
  animation: fadeIn 0.2s;
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
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: slideUp 0.2s;
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
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.close-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-button:hover {
  background: #f3f4f6;
  color: #111827;
}

.modal-form {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.parent-info {
  padding: 10px 12px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  color: #6b7280;
}

.error-message {
  padding: 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: #dc2626;
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
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}
</style>

