import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { useNodesStore } from '../stores/index.js'
import {
  transformPayloadToNodes,
  transformPayloadToEdges,
  buildEdgesFromVueFlowNodes,
  createNewNode,
} from '../utils/nodeTransform.js'

/**
 * Fetch nodes from payload.json
 * @returns {Object} Query result object
 */
export function useNodesQuery() {
  const store = useNodesStore()

  const query = useQuery({
    queryKey: ['nodes'],
    queryFn: async () => {
      // Fetch payload.json
      // In Vite, we can import JSON directly or fetch from public folder
      // For now, we'll import it directly
      const payloadData = await import('../../assets/payload.json').then(
        (module) => module.default
      )

      // Transform to Vue Flow format
      const nodes = transformPayloadToNodes(payloadData)
      const edges = transformPayloadToEdges(payloadData)

      // Update store
      store.setNodes(nodes)
      store.setEdges(edges)

      return { nodes, edges, rawData: payloadData }
    },
  })

  return query
}

/**
 * Create a new node mutation
 * @returns {Object} Mutation object
 */
export function useCreateNodeMutation() {
  const queryClient = useQueryClient()
  const store = useNodesStore()

  return useMutation({
    mutationFn: async (nodeData) => {
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
 * @returns {Object} Mutation object
 */
export function useUpdateNodeMutation() {
  const queryClient = useQueryClient()
  const store = useNodesStore()

  return useMutation({
    mutationFn: async ({ nodeId, updates }) => {
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
 * @returns {Object} Mutation object
 */
export function useDeleteNodeMutation() {
  const queryClient = useQueryClient()
  const store = useNodesStore()

  return useMutation({
    mutationFn: async (nodeId) => {
      // In a real app, this would be an API call
      store.deleteNode(nodeId)

      // Also delete child nodes recursively
      const deleteChildren = (parentId) => {
        const children = store.nodes.filter((n) => {
          const originalData = n.data?.originalData
          return originalData?.parentId === parentId || n.data?.parentId === parentId
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

