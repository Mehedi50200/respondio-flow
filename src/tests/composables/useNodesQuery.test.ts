import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'
import { useNodesQuery, useCreateNodeMutation, useUpdateNodeMutation, useDeleteNodeMutation } from '../../composables/useNodesQuery'
import { useNodesStore } from '../../stores/index'
import type { NodeCreationData } from '@/types'

vi.mock('../../mock/payload.json', () => ({
  default: [
    {
      id: 1,
      parentId: -1,
      type: 'trigger',
      data: { type: 'conversationOpened' },
    },
    {
      id: '2',
      parentId: 1,
      type: 'sendMessage',
      data: { payload: [{ type: 'text', text: 'Hello' }] },
    },
  ],
}))

function createWrapper(composable: () => any, piniaInstance?: ReturnType<typeof createPinia>) {
  const pinia = piniaInstance || createPinia()
  if (!piniaInstance) {
    setActivePinia(pinia)
  }

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  })

  const TestComponent = defineComponent({
    setup() {
      return composable()
    },
    template: '<div></div>',
  })

  return mount(TestComponent, {
    global: {
      plugins: [pinia, [VueQueryPlugin, { queryClient }]],
    },
  })
}

describe('useNodesQuery', () => {
  afterEach(() => {
    setActivePinia(null as any)
  })

  it('should fetch and transform nodes', async () => {
    const wrapper = createWrapper(() => {
      const query = useNodesQuery()
      return { query }
    })

    await new Promise(resolve => setTimeout(resolve, 100))
    
    const query = wrapper.vm.query
    expect(query.data.value?.nodes).toBeDefined()
    expect(query.data.value?.edges).toBeDefined()
  })
})

describe('useCreateNodeMutation', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    const store = useNodesStore()
    store.setNodes([
      {
        id: '1',
        type: 'trigger',
        position: { x: 0, y: 0 },
        data: { label: 'Trigger' },
      },
    ])
  })

  afterEach(() => {
    setActivePinia(null as any)
  })

  it('should create a new node', async () => {
    const wrapper = createWrapper(() => {
      const mutation = useCreateNodeMutation()
      return { mutation }
    }, pinia)

    const nodeData: NodeCreationData = {
      type: 'sendMessage',
      title: 'Test Message',
      description: 'Test Description',
    }

    const result = await wrapper.vm.mutation.mutateAsync(nodeData)

    expect(result).toBeDefined()
    expect(result.id).toBeDefined()
    expect(result.type).toBe('sendMessage')
    
    const store = useNodesStore()
    const createdNode = store.getNodeById(result.id)
    expect(createdNode).toBeDefined()
    expect(createdNode?.data.label).toBe('Test Message')
  })

  it('should create node with parent', async () => {
    const wrapper = createWrapper(() => {
      const mutation = useCreateNodeMutation()
      return { mutation }
    }, pinia)

    const nodeData: NodeCreationData = {
      type: 'addComment',
      title: 'Test Comment',
      description: 'Test',
      parentId: '1',
    }

    const result = await wrapper.vm.mutation.mutateAsync(nodeData)

    expect(result).toBeDefined()
    const store = useNodesStore()
    const createdNode = store.getNodeById(result.id)
    expect(createdNode?.data.parentId).toBe('1')
  })
})

describe('useUpdateNodeMutation', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    const store = useNodesStore()
    store.setNodes([
      {
        id: '1',
        type: 'sendMessage',
        position: { x: 0, y: 0 },
        data: { label: 'Original Label' },
      },
    ])
  })

  afterEach(() => {
    setActivePinia(null as any)
  })

  it('should update node data', async () => {
    const wrapper = createWrapper(() => {
      const mutation = useUpdateNodeMutation()
      return { mutation }
    }, pinia)
    
    await wrapper.vm.mutation.mutateAsync({
      nodeId: '1',
      updates: {
        data: {
          label: 'Updated Label',
        },
      },
    })

    const store = useNodesStore()
    const updatedNode = store.getNodeById('1')
    expect(updatedNode?.data.label).toBe('Updated Label')
  })
})

describe('useDeleteNodeMutation', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    const store = useNodesStore()
    store.setNodes([
      {
        id: 'parent',
        type: 'trigger',
        position: { x: 0, y: 0 },
        data: { 
          label: 'Parent',
          originalData: { id: 'parent', parentId: -1, type: 'trigger', data: {} },
        },
      },
      {
        id: 'child',
        type: 'sendMessage',
        position: { x: 100, y: 100 },
        data: { 
          label: 'Child',
          parentId: 'parent',
          originalData: { id: 'child', parentId: 'parent', type: 'sendMessage', data: {} },
        },
      },
    ])
  })

  afterEach(() => {
    setActivePinia(null as any)
  })

  it('should delete a node', async () => {
    const wrapper = createWrapper(() => {
      const mutation = useDeleteNodeMutation()
      return { mutation }
    }, pinia)

    const store = useNodesStore()
    expect(store.nodes).toHaveLength(2)
    
    await wrapper.vm.mutation.mutateAsync('parent')

    expect(store.nodes).toHaveLength(0)
  })
})
