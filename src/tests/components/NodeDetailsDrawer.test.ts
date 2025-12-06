import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { createApp } from 'vue'
import NodeDetailsDrawer from '../../components/NodeDetailsDrawer.vue'
import { useNodesStore } from '../../stores/index'
import type { VueFlowNode } from '@/types'

// Mock Vue Query
vi.mock('@tanstack/vue-query', () => ({
  useMutation: () => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
  }),
}))

// Mock router
const mockRouter = {
  push: vi.fn(),
  currentRoute: {
    value: {
      params: { id: '1' },
    },
  },
}

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
}))

describe('NodeDetailsDrawer', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    const store = useNodesStore()
    store.setNodes([
      {
        id: '1',
        type: 'sendMessage',
        position: { x: 0, y: 0 },
        data: {
          label: 'Test Node',
          payload: [{ type: 'text', text: 'Test message' }],
        },
      },
      {
        id: '2',
        type: 'addComment',
        position: { x: 100, y: 100 },
        data: {
          label: 'Comment Node',
          comment: 'Test comment',
        },
      },
      {
        id: '3',
        type: 'businessHours',
        position: { x: 200, y: 200 },
        data: {
          label: 'Business Hours',
          times: [],
          timezone: 'UTC',
        },
      },
    ])
  })

  const createWrapper = (props = {}) => {
    const app = createApp(NodeDetailsDrawer)
    app.use(createPinia())
    return mount(NodeDetailsDrawer, {
      props: {
        isOpen: true,
        nodeId: '1',
        ...props,
      },
    })
  }

  it('should render when isOpen is true and node exists', () => {
    const wrapper = createWrapper({ isOpen: true, nodeId: '1' })
    expect(wrapper.find('.node-drawer').exists()).toBe(true)
  })

  it('should not render when isOpen is false', () => {
    const wrapper = createWrapper({ isOpen: false })
    expect(wrapper.find('.node-drawer').exists()).toBe(false)
  })

  it('should display node title', () => {
    const wrapper = createWrapper({ nodeId: '1' })
    expect(wrapper.find('.node-title-header').text()).toContain('Test Node')
  })

  it('should show sendMessage specific fields', () => {
    const wrapper = createWrapper({ nodeId: '1' })
    expect(wrapper.find('.message-textarea').exists()).toBe(true)
    expect(wrapper.find('.upload-section').exists()).toBe(true)
  })

  it('should show addComment specific fields', () => {
    const wrapper = createWrapper({ nodeId: '2' })
    expect(wrapper.find('.message-textarea').exists()).toBe(true)
  })

  it('should show businessHours specific fields', () => {
    const wrapper = createWrapper({ nodeId: '3' })
    expect(wrapper.find('.business-hours-table').exists()).toBe(true)
    expect(wrapper.find('.timezone-selector').exists()).toBe(true)
  })

  it('should validate title length', async () => {
    const wrapper = createWrapper({ nodeId: '1' })
    const titleInput = wrapper.find('.form-input')
    
    await titleInput.setValue('a'.repeat(101))
    await titleInput.trigger('blur')
    
    const error = wrapper.find('.field-error')
    expect(error.exists()).toBe(true)
  })

  it('should show delete button', () => {
    const wrapper = createWrapper({ nodeId: '1' })
    expect(wrapper.find('.delete-button-footer').exists()).toBe(true)
  })

  it('should disable delete button for root node', () => {
    const store = useNodesStore()
    store.setNodes([
      {
        id: 'root',
        type: 'trigger',
        position: { x: 0, y: 0 },
        data: {
          label: 'Root',
          originalData: { id: 'root', parentId: -1, type: 'trigger', data: {} },
        },
      },
    ])
    
    const wrapper = createWrapper({ nodeId: 'root' })
    const deleteButton = wrapper.find('.delete-button-footer')
    expect(deleteButton.attributes('disabled')).toBeDefined()
  })

  it('should show character counter for message text', async () => {
    const wrapper = createWrapper({ nodeId: '1' })
    const textarea = wrapper.find('.message-textarea')
    
    await textarea.setValue('Test message text')
    
    const hint = wrapper.find('.field-hint')
    expect(hint.exists()).toBe(true)
    expect(hint.text()).toContain('characters')
  })
})

