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

      // Transform to Vue Flow format
      const vueFlowNode = transformPayloadToNodes([payloadNode])[0]

      // Add to store
      const nodes = [...store.nodes, vueFlowNode]

      // Rebuild edges from all Vue Flow nodes
      const edges = buildEdgesFromVueFlowNodes(nodes)

      store.setNodes(nodes)
      store.setEdges(edges)

      return vueFlowNode
    },
    onSuccess: () => {
      // Invalidate and refetch nodes query
      queryClient.invalidateQueries({ queryKey: ['nodes'] })
    },
  })
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nodes'] })
    },
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
          return (
            originalData?.parentId === parentId || n.data?.parentId === parentId
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nodes'] })
    },
  })
}

