<template>
  <div v-if="isOpen && node" class="node-drawer-overlay" @click.self="handleClose">
    <div class="node-drawer" @click.stop>
      <div class="drawer-header">
        <div class="header-content">
          <div class="header-top-row">
            <div class="node-icon-header" :class="nodeIconClass">
              <img :src="nodeIconSrc" :alt="nodeTitle" />
            </div>
            <h2 class="node-title-header">{{ nodeTitle }}</h2>
            <button class="close-button" @click="handleClose" aria-label="Close drawer">
              <img :src="closeIcon" alt="Close" />
            </button>
          </div>
          <p class="node-description-header">{{ nodeDescription || 'No description' }}</p>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div v-if="showDeleteConfirm" class="delete-confirm-overlay" @click.self="cancelDelete">
        <div class="delete-confirm-modal">
          <h3>Delete Node</h3>
          <p>Are you sure you want to delete "{{ editableTitle }}"?</p>
          <p class="delete-warning">This will also delete all child nodes. This action cannot be undone.</p>
          <div class="delete-confirm-actions">
            <button class="cancel-button" @click="cancelDelete">Cancel</button>
            <button class="confirm-delete-button" @click="confirmDelete">Delete</button>
          </div>
        </div>
      </div>

      <div class="drawer-content">
        <!-- Common Fields: Title (for all nodes) -->
        <div class="form-group">
          <label>Title</label>
          <input
            v-model="editableTitle"
            @change="saveTitle"
            @blur="validateTitle"
            @input="clearFieldError('title')"
            class="form-input"
            :class="{ 'input-error': fieldErrors.title }"
            placeholder="Enter node title..."
            maxlength="100"
          />
          <span v-if="fieldErrors.title" class="field-error">{{ fieldErrors.title }}</span>
          <span v-else class="field-hint">{{ editableTitle.length }}/100 characters</span>
        </div>
        
        <!-- Description field only for Business Hours (shows help text) -->
        <div v-if="node.type === 'businessHours'" class="form-group">
          <label>Description</label>
          <textarea
            v-model="editableDescription"
            @change="saveDescription"
            class="message-textarea"
            rows="3"
            placeholder="Enter description..."
          ></textarea>
        </div>

        <!-- Business Hours Node -->
        <div v-if="node.type === 'businessHours'" class="node-config">
          <div v-if="fieldErrors.businessHours" class="business-hours-error">
            <span class="field-error">{{ fieldErrors.businessHours }}</span>
          </div>
          <div class="business-hours-table">
            <div class="table-header">
              <div class="header-cell">
                <img :src="calendarIcon" alt="Calendar" />
                Day
              </div>
              <div class="header-cell">
                <img :src="clockIcon" alt="Clock" />
                Time
              </div>
            </div>
            <div class="table-body">
              <div v-for="day in daysOfWeek" :key="day.key" class="table-row">
                <div class="cell day-cell">{{ day.label }}</div>
                <div class="cell time-cell">
                  <div class="time-inputs">
                    <input
                      v-model="businessHours[day.key].startTime"
                      type="time"
                      class="time-input"
                      @change="updateBusinessHours"
                    />
                    <span class="time-separator">to</span>
                    <input
                      v-model="businessHours[day.key].endTime"
                      type="time"
                      class="time-input"
                      @change="updateBusinessHours"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="timezone-selector">
            <label>Time Zone</label>
            <select v-model="timezone" @change="updateTimezone" class="timezone-select">
              <option value="UTC">(GMT+00:00) UTC</option>
              <option value="America/New_York">(GMT-05:00) America/New_York</option>
              <option value="America/Los_Angeles">(GMT-08:00) America/Los_Angeles</option>
              <option value="Europe/London">(GMT+00:00) Europe/London</option>
              <option value="Asia/Tokyo">(GMT+09:00) Asia/Tokyo</option>
              <option value="Asia/Dubai">(GMT+04:00) Asia/Dubai</option>
            </select>
          </div>
        </div>

        <!-- Send Message Node -->
        <div v-else-if="node.type === 'sendMessage'" class="node-config">
          <div class="form-group">
            <label>Message Text</label>
            <textarea
              v-model="messageText"
              class="message-textarea"
              :class="{ 'input-error': fieldErrors.messageText }"
              rows="6"
              placeholder="Enter message text..."
              @change="updateMessage"
              @input="clearFieldError('messageText')"
              maxlength="1000"
            ></textarea>
            <span v-if="fieldErrors.messageText" class="field-error">{{ fieldErrors.messageText }}</span>
            <span v-else class="field-hint">
              {{ messageText.length }}/1000 characters. 
              <span v-if="!messageText.trim() && attachments.length === 0" class="field-warning">
                Message text or attachment is recommended
              </span>
            </span>
          </div>

          <div class="form-group">
            <label>Attachments</label>
            <div v-if="attachments.length > 0" class="attachments-grid">
              <div v-for="(attachment, index) in attachments" :key="index" class="attachment-tile">
                <div class="attachment-preview">
                  <img 
                    v-if="isImage(attachment.attachment)" 
                    :src="attachment.attachment" 
                    :alt="`Attachment ${index + 1}`"
                    @error="() => handleImageError(index)"
                    @load="handleImageLoad"
                    class="attachment-image"
                  />
                  <div v-else class="attachment-placeholder">
                    <img :src="fileIcon" alt="File" />
                  </div>
                </div>
                <button class="remove-attachment-button" @click="removeAttachment(index)" aria-label="Remove attachment">
                  <img :src="removeIcon" alt="Remove" />
                </button>
              </div>
            </div>
            <div v-else class="no-attachments">
              <p>No attachments</p>
            </div>
            <div class="upload-section">
              <label for="attachment-upload" class="upload-button">
                <img :src="uploadIcon" alt="Upload" />
                <span class="upload-button-text">Upload Attachment</span>
              </label>
              <input
                id="attachment-upload"
                type="file"
                accept="image/*"
                class="file-input"
                @change="handleFileUpload"
              />
            </div>
          </div>
        </div>

        <!-- Add Comment Node -->
        <div v-else-if="node.type === 'addComment'" class="node-config">
          <div class="form-group">
            <label>Comment</label>
            <textarea
              v-model="commentText"
              class="message-textarea"
              :class="{ 'input-error': fieldErrors.comment }"
              rows="6"
              placeholder="Enter comment..."
              @change="updateComment"
              @input="clearFieldError('comment')"
              maxlength="1000"
            ></textarea>
            <span v-if="fieldErrors.comment" class="field-error">{{ fieldErrors.comment }}</span>
            <span v-else class="field-hint">{{ commentText.length }}/1000 characters</span>
          </div>
        </div>

        <!-- Trigger Node -->
        <div v-else-if="node.type === 'trigger'" class="node-config">
          <div class="form-group">
            <label>Trigger Type</label>
            <select v-model="triggerType" @change="updateTrigger" class="form-select">
              <option value="conversationOpened">Conversation Opened</option>
              <option value="messageReceived">Message Received</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Drawer Footer -->
      <div class="drawer-footer">
        <button 
          class="delete-button-footer" 
          @click="handleDeleteClick" 
          :disabled="isRootNode"
        >
          <img :src="deleteIcon" alt="Delete" />
          Delete Node
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useNodesStore } from '@/stores'
import { useUpdateNodeMutation, useDeleteNodeMutation } from '@/composables/useNodesQuery'
import { useHistory } from '@/composables/useHistory'
import triggerIcon from '@/assets/icons/trigger-icon.svg?url'
import sendMessageIcon from '@/assets/icons/send-message-icon.svg?url'
import addCommentIcon from '@/assets/icons/add-comment-icon.svg?url'
import businessHoursIcon from '@/assets/icons/business-hours-icon.svg?url'
import closeIcon from '@/assets/icons/close-icon.svg?url'
import deleteIcon from '@/assets/icons/delete-icon.svg?url'
import calendarIcon from '@/assets/icons/calendar-icon.svg?url'
import clockIcon from '@/assets/icons/clock-icon.svg?url'
import fileIcon from '@/assets/icons/file-icon.svg?url'
import removeIcon from '@/assets/icons/remove-icon.svg?url'
import uploadIcon from '@/assets/icons/upload-icon.svg?url'

interface Props {
  isOpen: boolean
  nodeId?: string | number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const router = useRouter()
const store = useNodesStore()
const updateNodeMutation = useUpdateNodeMutation()
const deleteNodeMutation = useDeleteNodeMutation()
const { saveState } = useHistory()

const businessHours = ref<Record<string, { startTime: string; endTime: string }>>({})
const timezone = ref('UTC')
const messageText = ref('')
const commentText = ref('')
const triggerType = ref('conversationOpened')
const attachments = ref<Array<{ type: string; attachment: string }>>([])

const editableTitle = ref('')
const editableDescription = ref('')
const showDeleteConfirm = ref(false)
const fieldErrors = ref<{
  title?: string
  messageText?: string
  comment?: string
  businessHours?: string
}>({})

const daysOfWeek = [
  { key: 'mon', label: 'Mon' },
  { key: 'tue', label: 'Tue' },
  { key: 'wed', label: 'Wed' },
  { key: 'thu', label: 'Thu' },
  { key: 'fri', label: 'Fri' },
  { key: 'sat', label: 'Sat' },
  { key: 'sun', label: 'Sun' },
]

const node = computed(() => {
  if (!props.nodeId) return null
  return store.getNodeById(props.nodeId)
})

const nodeTitle = computed(() => node.value?.data?.label || 'Node')
const nodeDescription = computed(() => {
  if (!node.value) return ''
  if (node.value.type === 'businessHours') {
    return 'Allows a branch to be created based on date & time conditions. Use it to set business hours or date range conditions.'
  }
  return node.value.data?.description || ''
})

const isRootNode = computed(() => {
  if (!node.value) return false
  const originalData = node.value.data?.originalData
  const parentId = originalData?.parentId ?? node.value.data?.parentId
  return parentId === -1 || parentId === undefined || parentId === null
})

const nodeIconClass = computed(() => {
  const type = node.value?.type || ''
  return {
    'icon-trigger': type === 'trigger',
    'icon-send-message': type === 'sendMessage',
    'icon-add-comment': type === 'addComment',
    'icon-business-hours': type === 'businessHours',
  }
})

const nodeIconSrc = computed(() => {
  const type = node.value?.type || ''
  switch (type) {
    case 'trigger':
      return triggerIcon
    case 'sendMessage':
      return sendMessageIcon
    case 'addComment':
      return addCommentIcon
    case 'businessHours':
      return businessHoursIcon
    default:
      return ''
  }
})

const handleClose = () => {
  emit('close')
}

// Validation functions
const validateTitle = (): boolean => {
  const title = editableTitle.value.trim()
  if (!title) {
    fieldErrors.value.title = 'Title is required'
    return false
  }
  if (title.length > 100) {
    fieldErrors.value.title = 'Title must not exceed 100 characters'
    return false
  }
  clearFieldError('title')
  return true
}

const clearFieldError = (field: keyof typeof fieldErrors.value) => {
  if (fieldErrors.value[field]) {
    delete fieldErrors.value[field]
  }
}

const saveTitle = async () => {
  if (!node.value) return
  
  if (!validateTitle()) {
    return
  }
  
  if (editableTitle.value.trim() === '') {
    editableTitle.value = nodeTitle.value
    return
  }

  await updateNodeMutation.mutateAsync({
    nodeId: node.value.id,
    updates: {
      data: {
        ...node.value.data,
        label: editableTitle.value.trim(),
      },
    },
  })
  
  saveState()
}

const saveDescription = async () => {
  if (!node.value) return

  await updateNodeMutation.mutateAsync({
    nodeId: node.value.id,
    updates: {
      data: {
        ...node.value.data,
        description: editableDescription.value.trim(),
      },
    },
  })
  
  saveState()
}

const handleDeleteClick = () => {
  if (isRootNode.value) return
  showDeleteConfirm.value = true
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
}

const confirmDelete = async () => {
  if (!node.value || isRootNode.value) return
  
  try {
    await deleteNodeMutation.mutateAsync(node.value.id)
    saveState()
    showDeleteConfirm.value = false
    router.push('/')
  } catch (error) {
    console.error('Failed to delete node:', error)
  }
}

const updateBusinessHours = async () => {
  if (!node.value) return
  
  const invalidDays: string[] = []
  daysOfWeek.forEach((day) => {
    const start = businessHours.value[day.key].startTime
    const end = businessHours.value[day.key].endTime
    if (start && end && start >= end) {
      invalidDays.push(day.label)
    }
  })

  if (invalidDays.length > 0) {
    fieldErrors.value.businessHours = `End time must be after start time for: ${invalidDays.join(', ')}`
    return
  }

  clearFieldError('businessHours')
  
  const times = daysOfWeek.map((day) => ({
    day: day.key,
    startTime: businessHours.value[day.key].startTime,
    endTime: businessHours.value[day.key].endTime,
  }))

  await updateNodeMutation.mutateAsync({
    nodeId: node.value.id,
    updates: {
      data: {
        ...node.value.data,
        times,
        timezone: timezone.value,
      },
    },
  })
  
  saveState()
}

const updateTimezone = async () => {
  await updateBusinessHours()
}

const updateMessage = async () => {
  if (!node.value) return
  
  const payload = []
  
  // Add text if present
  if (messageText.value.trim()) {
    payload.push({
      type: 'text',
      text: messageText.value,
    })
  }
  
  // Add attachments
  payload.push(...attachments.value)
  
  await updateNodeMutation.mutateAsync({
    nodeId: node.value.id,
    updates: {
      data: {
        ...node.value.data,
        payload,
      },
    },
  })
  
  saveState()
}

const isImage = (url: string): boolean => {
  if (!url) return false
  if (url.startsWith('data:image/')) return true
  const urlWithoutQuery = url.split('?')[0]
  return /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/i.test(urlWithoutQuery)
}

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    fieldErrors.value.messageText = 'Please upload an image file (jpg, png, gif, webp, etc.)'
    target.value = ''
    return
  }

  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    fieldErrors.value.messageText = 'File size must be less than 5MB'
    target.value = ''
    return
  }

  clearFieldError('messageText')

  const reader = new FileReader()
  reader.onerror = () => {
    fieldErrors.value.messageText = 'Failed to read file. Please try again.'
    target.value = ''
  }
  reader.onload = (e) => {
    const dataUrl = e.target?.result as string
    attachments.value.push({
      type: 'attachment',
      attachment: dataUrl,
    })
    updateMessage()
  }
  reader.readAsDataURL(file)
  target.value = ''
}

const removeAttachment = async (index: number) => {
  attachments.value.splice(index, 1)
  await updateMessage()
}

const handleImageError = (index: number) => {
  console.warn(`Failed to load attachment image at index ${index}`)
}

const handleImageLoad = () => {
}

const updateComment = async () => {
  if (!node.value) return
  
  await updateNodeMutation.mutateAsync({
    nodeId: node.value.id,
    updates: {
      data: {
        ...node.value.data,
        comment: commentText.value,
      },
    },
  })
  
  saveState()
}

const updateTrigger = async () => {
  if (!node.value) return
  
  const description = triggerType.value === 'messageReceived' 
    ? 'Message Received' 
    : 'Conversation Opened'
  
  await updateNodeMutation.mutateAsync({
    nodeId: node.value.id,
    updates: {
      data: {
        ...node.value.data,
        type: triggerType.value,
        description,
      },
    },
  })
  
  saveState()
}

watch(
  () => node.value,
  (newNode) => {
    if (!newNode) return

    editableTitle.value = nodeTitle.value
    
    if (newNode.type === 'businessHours') {
      editableDescription.value = nodeDescription.value
    } else {
      editableDescription.value = ''
    }

    if (newNode.type === 'businessHours') {
      const times = newNode.data?.times || []
      const timesMap: Record<string, { startTime: string; endTime: string }> = {}
      
      daysOfWeek.forEach((day) => {
        const dayTime = times.find((t: { day: string; startTime: string; endTime: string }) => t.day === day.key)
        timesMap[day.key] = {
          startTime: dayTime?.startTime || '09:00',
          endTime: dayTime?.endTime || '17:00',
        }
      })
      
      businessHours.value = timesMap
      timezone.value = newNode.data?.timezone || 'UTC'
    } else if (newNode.type === 'sendMessage') {
      const textPayload = newNode.data?.payload?.find((p: any) => p.type === 'text')
      messageText.value = textPayload?.text || ''
      attachments.value = newNode.data?.payload?.filter((p: any) => p.type === 'attachment') || []
    } else if (newNode.type === 'addComment') {
      commentText.value = newNode.data?.comment || ''
    } else if (newNode.type === 'trigger') {
      triggerType.value = newNode.data?.type || 'conversationOpened'
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.node-drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
  animation: fadeIn 0.2s;
}

.node-drawer {
  width: 400px;
  max-width: 90vw;
  height: 100vh;
  background: var(--color-surface-elevated);
  box-shadow: var(--shadow-xl);
  display: flex;
  flex-direction: column;
  animation: slideIn 0.3s;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

.drawer-header {
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-md);
  background: var(--color-surface-elevated);
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.header-top-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  justify-content: space-between;
}

.node-icon-header {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.node-icon-header img {
  width: 16px;
  height: 16px;
  object-fit: contain;
  filter: brightness(0) invert(1);
}

.node-icon-header.icon-trigger {
  background: #8b5cf6;
  color: white;
}

.node-icon-header.icon-send-message {
  background: #10b981;
  color: white;
}

.node-icon-header.icon-add-comment {
  background: #3b82f6;
  color: white;
}

.node-icon-header.icon-business-hours {
  background: #f59e0b;
  color: white;
}

.node-title-header {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  flex: 1;
}

.node-description-header {
  margin: var(--spacing-sm) 0 0 0;
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

/* Drawer Footer */
.drawer-footer {
  padding: var(--spacing-md) var(--spacing-lg);
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
  background: var(--color-surface-elevated);
}

[data-theme="dark"] .drawer-footer {
  border-top-color: var(--color-border-light);
}

.delete-button-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: transparent;
  color: var(--color-error);
  border: 1px solid var(--color-error);
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-base);
}

.delete-button-footer img {
  width: 16px;
  height: 16px;
  display: block;
  filter: brightness(0) saturate(100%) invert(27%) sepia(95%) saturate(1352%) hue-rotate(340deg) brightness(99%) contrast(96%);
  transition: filter var(--transition-base);
}

.delete-button-footer:hover:not(:disabled) {
  background: var(--color-error);
  color: #ffffff;
  border-color: var(--color-error);
}

.delete-button-footer:hover:not(:disabled) img {
  filter: brightness(0) saturate(100%) invert(1) !important;
}

.delete-button-footer:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  border-color: var(--color-border);
  color: var(--color-text-tertiary);
}


.drawer-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-lg);
  background: var(--color-surface-elevated);
}


.business-hours-table {
  margin-bottom: var(--spacing-lg);
  border: 1px solid var(--color-table-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--color-surface-elevated);
}

.table-header {
  display: grid;
  grid-template-columns: 80px 1fr;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-table-border);
}

.header-cell {
  padding: 10px 12px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-primary);
  text-align: left;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.header-cell img {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  display: block;
  filter: brightness(0) saturate(100%) invert(var(--icon-invert, 0));
}

[data-theme="dark"] .header-cell img {
  --icon-invert: 1;
}

.table-body {
  display: flex;
  flex-direction: column;
}

.table-row {
  display: grid;
  grid-template-columns: 80px 1fr;
  border-bottom: 1px solid var(--color-table-border);
}

.table-row:last-child {
  border-bottom: none;
}

.cell {
  padding: 10px 12px;
  font-size: 13px;
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
}

.day-cell {
  font-weight: 500;
  min-width: 0;
}

.time-cell {
  justify-content: flex-start;
  min-width: 0;
}

.time-inputs {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 0;
}

.time-inputs svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  color: #6b7280;
}

.time-input {
  padding: 8px 12px;
  border: 2px solid var(--color-input-border);
  border-radius: var(--radius-md);
  font-size: 13px;
  font-family: inherit;
  width: 100px;
  min-width: 0;
  background: var(--color-surface-elevated);
  color: var(--color-text-primary);
  transition: all var(--transition-base);
  box-shadow: none;
}

.time-input:hover {
  border-color: var(--color-border-light);
}

.time-input:focus {
  outline: none;
  border-color: var(--color-input-border-focus);
  box-shadow: 0 0 0 3px var(--color-primary-light);
  background: var(--color-surface-elevated);
}

.time-separator {
  font-size: 12px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  flex-shrink: 0;
}

.timezone-selector {
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-border);
}

.timezone-selector label {
  display: block;
  margin-bottom: var(--spacing-sm);
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.timezone-select {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--color-input-border);
  border-radius: var(--radius-md);
  font-size: 14px;
  font-family: inherit;
  background: var(--color-surface-elevated);
  color: var(--color-text-primary);
  transition: all var(--transition-base);
  box-shadow: none;
  cursor: pointer;
}

.timezone-select:hover {
  border-color: var(--color-border-light);
}

.timezone-select:focus {
  outline: none;
  border-color: var(--color-input-border-focus);
  box-shadow: 0 0 0 3px var(--color-primary-light);
  background: var(--color-surface-elevated);
}

.field-error {
  font-weight: 500;
}

.field-warning {
  color: var(--color-warning);
}

.business-hours-error {
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-sm);
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--color-error);
  border-radius: var(--radius-md);
}

/* Delete Confirmation Modal */
.delete-confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s;
}

.delete-confirm-modal {
  background: var(--color-surface-elevated);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  max-width: 400px;
  width: 90%;
  box-shadow: var(--shadow-xl);
  animation: slideUp 0.3s;
}


.delete-confirm-modal h3 {
  margin: 0 0 var(--spacing-md) 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.delete-confirm-modal p {
  margin: 0 0 var(--spacing-sm) 0;
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.delete-warning {
  color: var(--color-error) !important;
  font-weight: 500;
  margin-top: var(--spacing-md) !important;
}

.delete-confirm-actions {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
  justify-content: flex-end;
}

.cancel-button,
.confirm-delete-button {
  padding: 10px 20px;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-base);
  border: none;
}

.cancel-button {
  background: var(--color-surface);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.cancel-button:hover {
  background: var(--color-border-light);
}

.confirm-delete-button {
  background: var(--color-error);
  color: var(--color-text-inverse);
}

.confirm-delete-button:hover {
  background: var(--color-error);
  opacity: 0.9;
}

/* Attachments Styles */
.attachments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.attachment-tile {
  position: relative;
  aspect-ratio: 1;
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  transition: all var(--transition-base);
}

.attachment-tile:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
}

.attachment-preview {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.attachment-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.attachment-image {
  max-width: 100%;
  max-height: 100%;
}

.attachment-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-tertiary);
}

.attachment-placeholder img {
  width: 24px;
  height: 24px;
  display: block;
  filter: brightness(0) saturate(100%) invert(var(--icon-invert, 0));
}

[data-theme="dark"] .attachment-placeholder img {
  --icon-invert: 1;
}

.remove-attachment-button {
  position: absolute;
  top: var(--spacing-xs);
  right: var(--spacing-xs);
  width: 24px;
  height: 24px;
  border-radius: var(--radius-full);
  background: rgba(239, 68, 68, 0.9);
  color: var(--color-text-inverse);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-base);
  padding: 0;
  box-shadow: var(--shadow-sm);
}

.remove-attachment-button img {
  width: 16px;
  height: 16px;
  display: block;
  filter: brightness(0) saturate(100%) invert(1);
}

.remove-attachment-button:hover {
  background: rgba(220, 38, 38, 1);
  transform: scale(1.1);
  box-shadow: var(--shadow-md);
}

.no-attachments {
  padding: var(--spacing-lg);
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 14px;
  margin-bottom: var(--spacing-md);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  border-style: dashed;
}

.upload-section {
  margin-top: var(--spacing-md);
}

.upload-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 12px var(--spacing-md);
  background: var(--color-surface-elevated);
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
  transition: all var(--transition-base);
  line-height: 1;
}

.upload-button-text {
  margin-left: var(--spacing-md);
}

[data-theme="dark"] .upload-button {
  border-color: var(--color-border-light);
}

.upload-button img {
  width: 16px;
  height: 16px;
  display: inline-block;
  flex-shrink: 0;
  object-fit: contain;
  vertical-align: middle;
  filter: brightness(0) saturate(100%) invert(var(--icon-invert, 0));
  transition: transform var(--transition-base);
}

[data-theme="dark"] .upload-button img {
  --icon-invert: 1;
}

.upload-button:hover {
  background: var(--color-surface);
  border-color: var(--color-primary);
  border-style: solid;
  color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.upload-button:hover img {
  transform: translateY(-2px);
}

.file-input {
  display: none;
}
</style>

