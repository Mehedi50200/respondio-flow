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

export function useNodesQuery() {
  const store = useNodesStore()

  const query = useQuery({
    queryKey: ['nodes'],
    queryFn: async () => {
      const payloadData = (await import('../../assets/payload.json')) as {
        default: PayloadNode[]
      }

      const nodes = transformPayloadToNodes(payloadData.default)
      const edges = transformPayloadToEdges(payloadData.default)

      store.setNodes(nodes)
      store.setEdges(edges)

      return { nodes, edges, rawData: payloadData.default }
    },
  })

  return query
}

export function useCreateNodeMutation() {
  const store = useNodesStore()

  return useMutation({
    mutationFn: async (nodeData: NodeCreationData) => {
      const payloadNode = createNewNode(nodeData)

      const existingPayloadNodes: PayloadNode[] = []
      const connectorNodes: PayloadNode[] = []
      
      store.nodes.forEach((node) => {
        const originalData = node.data?.originalData
        if (originalData) {
          if (originalData.type === 'dateTimeConnector') {
            connectorNodes.push(originalData)
          } else {
            existingPayloadNodes.push(originalData)
          }
        } else {
          existingPayloadNodes.push({
            id: node.id,
            parentId: node.data?.parentId ?? -1,
            type: mapVueFlowTypeToPayloadType(node.type),
            name: node.data?.label,
            data: { ...node.data },
          } as PayloadNode)
        }
      })

      const allPayloadNodes = [...existingPayloadNodes, ...connectorNodes, payloadNode]
      const newPosition = calculateNewNodePosition(
        payloadNode,
        store.nodes,
        allPayloadNodes
      )

      const tempNodes = transformPayloadToNodes([payloadNode])
      const newVueFlowNode = tempNodes[0]
      if (!newVueFlowNode) {
        throw new Error('Failed to create node')
      }

      newVueFlowNode.position = newPosition
      const updatedNodes: VueFlowNode[] = [...store.nodes, newVueFlowNode]
      const edges = buildEdgesFromVueFlowNodes(updatedNodes)

      store.setNodes(updatedNodes)
      store.setEdges(edges)

      return newVueFlowNode
    },
  })
}

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

export function useUpdateNodeMutation() {
  const store = useNodesStore()

  return useMutation({
    mutationFn: async ({ nodeId, updates }: NodeUpdateData) => {
      store.updateNode(nodeId, updates)
      const edges = buildEdgesFromVueFlowNodes(store.nodes)
      store.setEdges(edges)
      return { nodeId, updates }
    },
  })
}

export function useDeleteNodeMutation() {
  const store = useNodesStore()

  return useMutation({
    mutationFn: async (nodeId: string | number) => {
      store.deleteNode(nodeId)

      const deleteChildren = (parentId: string | number) => {
        const children = store.nodes.filter((n) => {
          const originalData = n.data?.originalData
          const originalParentId = originalData?.parentId
          const dataParentId = n.data?.parentId
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
      const edges = buildEdgesFromVueFlowNodes(store.nodes)
      store.setEdges(edges)

      return nodeId
    },
  })
}

