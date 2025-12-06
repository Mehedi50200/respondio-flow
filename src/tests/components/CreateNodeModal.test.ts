import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { createApp } from 'vue'
import CreateNodeModal from '../../components/CreateNodeModal.vue'
import { useNodesStore } from '../../stores/index'

// Mock Vue Query
vi.mock('@tanstack/vue-query', () => ({
  useMutation: () => ({
    mutateAsync: vi.fn().mockResolvedValue({ id: 'new-node', type: 'sendMessage' }),
  }),
}))

describe('CreateNodeModal', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  const createWrapper = (props = {}) => {
    const app = createApp(CreateNodeModal)
    app.use(createPinia())
    return mount(CreateNodeModal, {
      props: {
        isOpen: true,
        selectedParentId: null,
        ...props,
      },
      global: {
        stubs: {
          Teleport: true,
        },
      },
    })
  }

  it('should render when isOpen is true', () => {
    const wrapper = createWrapper({ isOpen: true })
    expect(wrapper.exists()).toBe(true)
  })

  it('should not render when isOpen is false', () => {
    const wrapper = createWrapper({ isOpen: false })
    expect(wrapper.find('.modal-container').exists()).toBe(false)
  })

  it('should display form fields', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('#node-type').exists()).toBe(true)
    expect(wrapper.find('#node-title').exists()).toBe(true)
    expect(wrapper.find('#node-description').exists()).toBe(true)
  })

  it('should validate required fields', async () => {
    const wrapper = createWrapper()
    const form = wrapper.find('form')
    
    await form.trigger('submit')
    
    // Should show error for missing fields
    expect(wrapper.find('.error-message').exists()).toBe(true)
  })

  it('should show timezone field for businessHours type', async () => {
    const wrapper = createWrapper()
    const typeSelect = wrapper.find('#node-type')
    
    await typeSelect.setValue('businessHours')
    
    expect(wrapper.find('#timezone').exists()).toBe(true)
  })

  it('should emit close event when cancel button is clicked', async () => {
    const wrapper = createWrapper()
    const cancelButton = wrapper.find('.btn-secondary')
    
    await cancelButton.trigger('click')
    
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('should validate title length', async () => {
    const wrapper = createWrapper()
    const titleInput = wrapper.find('#node-title')
    
    // Set a very long title
    await titleInput.setValue('a'.repeat(101))
    await titleInput.trigger('blur')
    
    // Should show validation error
    const error = wrapper.find('.field-error')
    expect(error.exists()).toBe(true)
  })

  it('should show character counter for description', async () => {
    const wrapper = createWrapper()
    const descriptionTextarea = wrapper.find('#node-description')
    
    await descriptionTextarea.setValue('Test description')
    
    const hint = wrapper.find('.field-hint')
    expect(hint.exists()).toBe(true)
    expect(hint.text()).toContain('characters')
  })
})

