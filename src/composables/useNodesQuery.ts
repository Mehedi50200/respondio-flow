import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { useNodesStore } from '../stores/index'
import {
  transformPayloadToNodes,
  transformPayloadToEdges,
  buildEdgesFromVueFlowNodes,
  createNewNode,
} from '../utils/nodeTransform'
import type { NodeCreationData, NodeUpdateData, PayloadNode } from '@/types'

/**
 * Fetch nodes from payload.json
 */
export function useNodesQuery() {
  const store = useNodesStore()

  const query = useQuery({
    queryKey: ['nodes'],
    queryFn: async () => {
      // Fetch payload.json
      // In Vite, we can import JSON directly or fetch from public folder
      // For now, we'll import it directly
      const payloadData = (await import('../../assets/payload.json')) as {
        default: PayloadNode[]
      }

      // Transform to Vue Flow format
      const nodes = transformPayloadToNodes(payloadData.default)
      const edges = transformPayloadToEdges(payloadData.default)

      // Update store
      store.setNodes(nodes)
      store.setEdges(edges)

      return { nodes, edges, rawData: payloadData.default }
    },
  })

  return query
}

/**
 * Create a new node mutation
 */
export function useCreateNodeMutation() {
  const queryClient = useQueryClient()
  const store = useNodesStore()

  return useMutation({
    mutationFn: async (nodeData: NodeCreationData) => {
      // In a real app, this would be an API call
      // Create new node in payload format
      const payloadNode = createNewNode(nodeData)

      // Calculate position for the new node
      // We need to convert existing Vue Flow nodes back to payload format for position calculation
      const existingPayloadNodes: PayloadNode[] = store.nodes.map((node) => {
        const originalData = node.data?.originalData
        if (originalData) {
          return originalData
        }
        // Reconstruct payload node from Vue Flow node
        return {
          id: node.id,
          parentId: node.data?.parentId ?? -1,
          type: mapVueFlowTypeToPayloadType(node.type),
          name: node.data?.label,
          data: { ...node.data },
        } as PayloadNode
      })

      // Add the new node to calculate positions for all nodes
      const allPayloadNodes = [...existingPayloadNodes, payloadNode]
      const vueFlowNodes = transformPayloadToNodes(allPayloadNodes)
      
      // Find the newly created node
      const vueFlowNode = vueFlowNodes.find((n) => String(n.id) === String(payloadNode.id))
      if (!vueFlowNode) {
        throw new Error('Failed to create node')
      }

      // Update positions for all existing nodes (they may have shifted)
      const updatedNodes = store.nodes.map((existingNode) => {
        const updatedNode = vueFlowNodes.find((n) => String(n.id) === String(existingNode.id))
        if (updatedNode) {
          return {
            ...existingNode,
            position: updatedNode.position,
          }
        }
        return existingNode
      })

      // Add the new node
      const nodes = [...updatedNodes, vueFlowNode]

      // Rebuild edges from all Vue Flow nodes
      const edges = buildEdgesFromVueFlowNodes(nodes)

      store.setNodes(nodes)
      store.setEdges(edges)

      return vueFlowNode
    },
    // Don't invalidate query - we're updating the store directly
    // In a real app with API, we would invalidate here
  })
}

/**
 * Map Vue Flow node type back to payload type
 */
function mapVueFlowTypeToPayloadType(vueFlowType: string): PayloadNode['type'] {
  const typeMap: Record<string, PayloadNode['type']> = {
    trigger: 'trigger',
    sendMessage: 'sendMessage',
    addComment: 'addComment',
    businessHours: 'dateTime',
    dateTimeConnector: 'dateTimeConnector',
  }
  return typeMap[vueFlowType] || 'sendMessage'
}

/**
 * Update an existing node mutation
 */
export function useUpdateNodeMutation() {
  const queryClient = useQueryClient()
  const store = useNodesStore()

  return useMutation({
    mutationFn: async ({ nodeId, updates }: NodeUpdateData) => {
      // In a real app, this would be an API call
      store.updateNode(nodeId, updates)

      // Rebuild edges from all Vue Flow nodes
      // This handles parentId changes correctly
      const edges = buildEdgesFromVueFlowNodes(store.nodes)
      store.setEdges(edges)

      return { nodeId, updates }
    },
    // Don't invalidate query - we're updating the store directly
  })
}

/**
 * Delete a node mutation
 */
export function useDeleteNodeMutation() {
  const queryClient = useQueryClient()
  const store = useNodesStore()

  return useMutation({
    mutationFn: async (nodeId: string | number) => {
      // In a real app, this would be an API call
      store.deleteNode(nodeId)

      // Also delete child nodes recursively
      const deleteChildren = (parentId: string | number) => {
        const children = store.nodes.filter((n) => {
          const originalData = n.data?.originalData
          const originalParentId = originalData?.parentId
          const dataParentId = n.data?.parentId
          // Use type-safe comparison for mixed ID types
          return (
            (originalParentId !== undefined && String(originalParentId) === String(parentId)) ||
            (dataParentId !== undefined && String(dataParentId) === String(parentId))
          )
        })

        children.forEach((child) => {
          store.deleteNode(child.id)
          deleteChildren(child.id)
        })
      }

      deleteChildren(nodeId)

      // Rebuild edges from remaining Vue Flow nodes
      const edges = buildEdgesFromVueFlowNodes(store.nodes)
      store.setEdges(edges)

      return nodeId
    },
    // Don't invalidate query - we're updating the store directly
  })
}

