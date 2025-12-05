import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useNodesStore } from '../../stores/index.js'

describe('useNodesStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should initialize with empty state', () => {
    const store = useNodesStore()

    expect(store.nodes).toEqual([])
    expect(store.edges).toEqual([])
    expect(store.selectedNodeId).toBe(null)
  })

  it('should set nodes', () => {
    const store = useNodesStore()
    const nodes = [
      { id: '1', type: 'trigger', position: { x: 0, y: 0 }, data: {} },
      { id: '2', type: 'sendMessage', position: { x: 100, y: 100 }, data: {} },
    ]

    store.setNodes(nodes)

    expect(store.nodes).toEqual(nodes)
    expect(store.nodes).toHaveLength(2)
  })

  it('should set edges', () => {
    const store = useNodesStore()
    const edges = [
      { id: 'e1', source: '1', target: '2' },
    ]

    store.setEdges(edges)

    expect(store.edges).toEqual(edges)
  })

  it('should add a node', () => {
    const store = useNodesStore()
    const newNode = {
      id: 'new-1',
      type: 'sendMessage',
      position: { x: 0, y: 0 },
      data: {},
    }

    store.addNode(newNode)

    expect(store.nodes).toHaveLength(1)
    expect(store.nodes[0]).toEqual(newNode)
  })

  it('should update a node', () => {
    const store = useNodesStore()
    const node = {
      id: '1',
      type: 'sendMessage',
      position: { x: 0, y: 0 },
      data: { label: 'Old Label' },
    }

    store.addNode(node)
    store.updateNode('1', { data: { label: 'New Label' } })

    expect(store.getNodeById('1').data.label).toBe('New Label')
  })

  it('should delete a node', () => {
    const store = useNodesStore()
    const node1 = { id: '1', type: 'trigger', position: { x: 0, y: 0 }, data: {} }
    const node2 = { id: '2', type: 'sendMessage', position: { x: 100, y: 100 }, data: {} }

    store.addNode(node1)
    store.addNode(node2)
    store.deleteNode('1')

    expect(store.nodes).toHaveLength(1)
    expect(store.nodes[0].id).toBe('2')
  })

  it('should get node by ID', () => {
    const store = useNodesStore()
    const node = {
      id: 'test-1',
      type: 'sendMessage',
      position: { x: 0, y: 0 },
      data: {},
    }

    store.addNode(node)

    const found = store.getNodeById('test-1')
    expect(found).toEqual(node)

    const notFound = store.getNodeById('non-existent')
    expect(notFound).toBe(null)
  })

  it('should update node position', () => {
    const store = useNodesStore()
    const node = {
      id: '1',
      type: 'sendMessage',
      position: { x: 0, y: 0 },
      data: {},
    }

    store.addNode(node)
    store.updateNodePosition('1', { x: 100, y: 200 })

    expect(store.getNodeById('1').position).toEqual({ x: 100, y: 200 })
  })

  it('should set and clear selected node', () => {
    const store = useNodesStore()
    const node = {
      id: '1',
      type: 'sendMessage',
      position: { x: 0, y: 0 },
      data: {},
    }

    store.addNode(node)
    store.setSelectedNode('1')

    expect(store.selectedNodeId).toBe('1')
    expect(store.selectedNode).toEqual(node)

    store.clearSelectedNode()
    expect(store.selectedNodeId).toBe(null)
    expect(store.selectedNode).toBe(null)
  })

  it('should get children nodes', () => {
    const store = useNodesStore()
    const parent = {
      id: 'parent',
      type: 'trigger',
      position: { x: 0, y: 0 },
      data: { originalData: { id: 'parent', parentId: -1 } },
    }
    const child = {
      id: 'child',
      type: 'sendMessage',
      position: { x: 100, y: 100 },
      data: { originalData: { id: 'child', parentId: 'parent' } },
    }

    store.addNode(parent)
    store.addNode(child)

    const children = store.getChildrenNodes('parent')
    expect(children).toHaveLength(1)
    expect(children[0].id).toBe('child')
  })
})

