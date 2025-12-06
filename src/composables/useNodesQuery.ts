import { useQuery, useMutation } from '@tanstack/vue-query'
import { useNodesStore } from '../stores/index'
import {
  transformPayloadToNodes,
  transformPayloadToEdges,
  buildEdgesFromVueFlowNodes,
  createNewNode,
  calculateNewNodePosition,
} from '../utils/nodeTransform'
import type { NodeCreationData, NodeUpdateData, PayloadNode, VueFlowNode } from '@/types'

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
  const store = useNodesStore()

  return useMutation({
    mutationFn: async (nodeData: NodeCreationData) => {
      // In a real app, this would be an API call
      // Create new node in payload format
      const payloadNode = createNewNode(nodeData)

      // Collect all payload nodes including connectors
      // We need to preserve connectors from originalData even though they're filtered out of Vue Flow nodes
      const existingPayloadNodes: PayloadNode[] = []
      const connectorNodes: PayloadNode[] = []
      
      store.nodes.forEach((node) => {
        const originalData = node.data?.originalData
        if (originalData) {
          // If it's a connector, store it separately (connectors are needed for edge building)
          if (originalData.type === 'dateTimeConnector') {
            connectorNodes.push(originalData)
          } else {
            existingPayloadNodes.push(originalData)
          }
        } else {
          // Reconstruct payload node from Vue Flow node (fallback for nodes without originalData)
          existingPayloadNodes.push({
            id: node.id,
            parentId: node.data?.parentId ?? -1,
            type: mapVueFlowTypeToPayloadType(node.type),
            name: node.data?.label,
            data: { ...node.data },
          } as PayloadNode)
        }
      })

      // PRESERVE existing node positions - only calculate position for the new node
      // This ensures smooth animations and doesn't disrupt user's current layout
      const allPayloadNodes = [...existingPayloadNodes, ...connectorNodes, payloadNode]
      
      // Calculate position for the new node based on existing nodes
      const newPosition = calculateNewNodePosition(
        payloadNode,
        store.nodes,
        allPayloadNodes
      )

      // Create the new Vue Flow node with calculated position
      // We need to transform just this node to get the proper structure
      const tempNodes = transformPayloadToNodes([payloadNode])
      const newVueFlowNode = tempNodes[0]
      if (!newVueFlowNode) {
        throw new Error('Failed to create node')
      }

      // Update the position to the calculated one
      newVueFlowNode.position = newPosition

      // Preserve all existing nodes exactly as they are (positions, data, everything)
      const updatedNodes: VueFlowNode[] = [...store.nodes, newVueFlowNode]

      // Rebuild edges from all Vue Flow nodes
      // This function needs connectors in originalData to build edges correctly
      const edges = buildEdgesFromVueFlowNodes(updatedNodes)

      store.setNodes(updatedNodes)
      store.setEdges(edges)

      return newVueFlowNode
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

