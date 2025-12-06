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
          </div>
          <p class="node-description-header">{{ nodeDescription }}</p>
        </div>
        <button class="close-button" @click="handleClose">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        </button>
      </div>

      <div class="drawer-content">
        <!-- Business Hours Node -->
        <div v-if="node.type === 'businessHours'" class="node-config">
          <div class="business-hours-table">
            <div class="table-header">
              <div class="header-cell">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" stroke-width="2" />
                </svg>
                Day
              </div>
              <div class="header-cell">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
                  <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                </svg>
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
              rows="6"
              placeholder="Enter message text..."
              @change="updateMessage"
            ></textarea>
          </div>
        </div>

        <!-- Add Comment Node -->
        <div v-else-if="node.type === 'addComment'" class="node-config">
          <div class="form-group">
            <label>Comment</label>
            <textarea
              v-model="commentText"
              class="message-textarea"
              rows="6"
              placeholder="Enter comment..."
              @change="updateComment"
            ></textarea>
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useNodesStore } from '@/stores'
import { useUpdateNodeMutation } from '@/composables/useNodesQuery'
import triggerIcon from '@/assets/icons/trigger-icon.svg?url'
import sendMessageIcon from '@/assets/icons/send-message-icon.svg?url'
import addCommentIcon from '@/assets/icons/add-comment-icon.svg?url'
import businessHoursIcon from '@/assets/icons/business-hours-icon.svg?url'

interface Props {
  isOpen: boolean
  nodeId?: string | number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const store = useNodesStore()
const updateNodeMutation = useUpdateNodeMutation()

const businessHours = ref<Record<string, { startTime: string; endTime: string }>>({})
const timezone = ref('UTC')
const messageText = ref('')
const commentText = ref('')
const triggerType = ref('conversationOpened')

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

const updateBusinessHours = async () => {
  if (!node.value) return
  
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
}

const updateTimezone = async () => {
  await updateBusinessHours()
}

const updateMessage = async () => {
  if (!node.value) return
  
  await updateNodeMutation.mutateAsync({
    nodeId: node.value.id,
    updates: {
      data: {
        ...node.value.data,
        payload: [
          {
            type: 'text',
            text: messageText.value,
          },
        ],
      },
    },
  })
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
}

// Initialize form data when node changes
watch(
  () => node.value,
  (newNode) => {
    if (!newNode) return

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

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.node-drawer {
  width: 400px;
  max-width: 90vw;
  height: 100vh;
  background: white;
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.15);
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
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
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
  gap: 12px;
}

.node-icon-header {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.node-icon-header img {
  width: 16px;
  height: 16px;
  object-fit: contain;
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
  color: #111827;
}

.node-description-header {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
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
  flex-shrink: 0;
}

.close-button:hover {
  background: #f3f4f6;
  color: #111827;
}

.drawer-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}


.business-hours-table {
  margin-bottom: 24px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 80px 1fr;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.header-cell {
  padding: 10px 12px;
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 6px;
}

.header-cell svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.table-body {
  display: flex;
  flex-direction: column;
}

.table-row {
  display: grid;
  grid-template-columns: 80px 1fr;
  border-bottom: 1px solid #e5e7eb;
}

.table-row:last-child {
  border-bottom: none;
}

.cell {
  padding: 10px 12px;
  font-size: 13px;
  color: #374151;
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
  padding: 6px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  font-family: inherit;
  width: 100px;
  min-width: 0;
}

.time-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.time-separator {
  font-size: 12px;
  color: #6b7280;
  white-space: nowrap;
  flex-shrink: 0;
}

.timezone-selector {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.timezone-selector label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.timezone-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
}

.timezone-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.message-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
}

.message-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
}

.form-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
</style>

