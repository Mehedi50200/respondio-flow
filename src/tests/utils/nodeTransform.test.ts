import { describe, it, expect } from 'vitest'
import {
  generateNodeId,
  createNewNode,
  transformPayloadToNodes,
  transformPayloadToEdges,
} from '../../utils/nodeTransform'
import type { PayloadNode } from '@/types'

describe('nodeTransform utilities', () => {
  describe('generateNodeId', () => {
    it('should generate a unique ID string', () => {
      const id1 = generateNodeId()
      const id2 = generateNodeId()

      expect(id1).toBeTypeOf('string')
      expect(id2).toBeTypeOf('string')
      expect(id1).not.toBe(id2)
      expect(id1.length).toBeGreaterThan(0)
    })
  })


  describe('createNewNode', () => {
    it('should create a sendMessage node', () => {
      const nodeData = {
        title: 'Test Message',
        description: 'Test description',
        type: 'sendMessage' as const,
      }

      const node = createNewNode(nodeData)

      expect(node).toHaveProperty('id')
      expect(node.name).toBe('Test Message')
      expect(node.type).toBe('sendMessage')
      expect(node.data.payload).toBeDefined()
      expect(node.data.payload?.[0]?.text).toBe('Test description')
    })


    it('should create a businessHours node', () => {
      const nodeData = {
        title: 'Business Hours',
        description: '',
        type: 'businessHours' as const,
      }

      const node = createNewNode(nodeData)

      expect(node.type).toBe('dateTime')
      expect(node.data.times).toBeDefined()
      expect(node.data.times?.length).toBe(7) // 7 days
      expect(node.data.timezone).toBe('UTC')
    })
  })

  describe('transformPayloadToNodes', () => {
    it('should transform payload data to Vue Flow nodes', () => {
      const payloadData: PayloadNode[] = [
        {
          id: 1,
          parentId: -1,
          type: 'trigger',
          data: { type: 'conversationOpened' },
        },
        {
          id: 'test-1',
          parentId: 1,
          type: 'sendMessage',
          name: 'Test Message',
          data: { payload: [{ type: 'text', text: 'Hello' }] },
        },
      ]

      const nodes = transformPayloadToNodes(payloadData)

      expect(nodes).toHaveLength(2)
      expect(nodes[0].id).toBe('1')
      expect(nodes[0].type).toBe('trigger')
      expect(nodes[0]).toHaveProperty('position')
      expect(nodes[1].data.label).toBe('Test Message')
    })

  })

  describe('transformPayloadToEdges', () => {
    it('should transform payload data to Vue Flow edges', () => {
      const payloadData: PayloadNode[] = [
        {
          id: 1,
          parentId: -1,
          type: 'trigger',
          data: {},
        },
        {
          id: 'test-1',
          parentId: 1,
          type: 'sendMessage',
          data: {},
        },
      ]

      const edges = transformPayloadToEdges(payloadData)

      expect(edges).toHaveLength(1)
      expect(edges[0].source).toBe('1')
      expect(edges[0].target).toBe('test-1')
      expect(edges[0]).toHaveProperty('id')
    })

    it('should create styled edges for connectors', () => {
      const payloadData: PayloadNode[] = [
        {
          id: 'parent',
          parentId: -1,
          type: 'dateTime',
          data: {},
        },
        {
          id: 'success',
          parentId: 'parent',
          type: 'dateTimeConnector',
          data: { connectorType: 'success' },
        },
        {
          id: 'child',
          parentId: 'success',
          type: 'sendMessage',
          data: {},
        },
      ]

      const edges = transformPayloadToEdges(payloadData)

      expect(edges).toHaveLength(1)
      expect(edges[0].label).toBe('Success')
      expect(edges[0].style?.stroke).toBe('#10b981')
      expect(edges[0].animated).toBe(true)
      expect(edges[0].source).toBe('parent')
      expect(edges[0].target).toBe('child')
    })

  })
})

