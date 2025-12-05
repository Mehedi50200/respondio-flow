/**
 * Transform payload.json data to Vue Flow format
 * Converts the flat array structure to nodes and edges for Vue Flow
 */

import type {
  PayloadNode,
  VueFlowNode,
  VueFlowEdge,
  Position,
  NodeCreationData,
} from '@/types'

/**
 * Generate a unique node ID
 */
export function generateNodeId(): string {
  return Math.random().toString(36).substring(2, 9)
}

/**
 * Calculate position for a node based on its parent and siblings
 */
export function calculateNodePosition(
  node: PayloadNode,
  allNodes: PayloadNode[],
  index: number = 0
): Position {
  // Default positions
  const baseX = 400
  const baseY = 100
  const horizontalSpacing = 350
  const verticalSpacing = 120

  // If root node (parentId === -1)
  if (node.parentId === -1) {
    return { x: baseX, y: baseY }
  }

  // Find parent node (use type-safe comparison)
  const parent = allNodes.find((n) => String(n.id) === String(node.parentId))
  if (!parent) {
    return { x: baseX, y: baseY + verticalSpacing * (index + 1) }
  }

  // Get parent position (default if not set)
  const parentX = (parent as any).position?.x || baseX
  const parentY = (parent as any).position?.y || baseY

  // Calculate position based on node type
  if (node.type === 'dateTimeConnector') {
    // Connectors should be positioned to the sides
    const isSuccess = node.data?.connectorType === 'success'
    return {
      x: parentX + (isSuccess ? -horizontalSpacing : horizontalSpacing),
      y: parentY + verticalSpacing,
    }
  }

  // Get sibling index (position among nodes with same parent)
  const siblingIndex = allNodes
    .filter((n) => String(n.parentId) === String(node.parentId))
    .findIndex((n) => String(n.id) === String(node.id))

  // For regular nodes below parent, arrange vertically
  // If parent is a connector, position directly below
  const isConnectorChild = parent.type === 'dateTimeConnector'
  
  if (isConnectorChild) {
    // Children of connectors go directly below
    return {
      x: parentX,
      y: parentY + verticalSpacing,
    }
  }

  // For children of regular nodes, arrange vertically
  // Count how many siblings come before this node
  const siblingsBefore = allNodes
    .filter((n) => String(n.parentId) === String(node.parentId))
    .slice(0, siblingIndex)
    .length

  return {
    x: parentX,
    y: parentY + verticalSpacing + (siblingsBefore * verticalSpacing),
  }
}

/**
 * Transform payload data to Vue Flow nodes format
 */
export function transformPayloadToNodes(payloadData: PayloadNode[]): VueFlowNode[] {
  if (!Array.isArray(payloadData)) {
    return []
  }

  // Sort nodes: root first, then by parent-child relationships
  // This ensures proper positioning order
  const sortedNodes = [...payloadData].sort((a, b) => {
    // Root nodes first
    if (a.parentId === -1 && b.parentId !== -1) return -1
    if (a.parentId !== -1 && b.parentId === -1) return 1
    
    // Same parent: maintain order
    if (String(a.parentId) === String(b.parentId)) {
      return 0
    }
    
    // Sort by parentId to group siblings
    return String(a.parentId).localeCompare(String(b.parentId))
  })

  // First pass: create nodes with basic structure
  const nodes = sortedNodes.map((item, index) => {
    const position = calculateNodePosition(item, sortedNodes, index)

    return {
      id: String(item.id),
      type: mapNodeType(item.type),
      position,
      data: {
        ...item.data,
        label: item.name || getNodeLabel(item),
        description: getNodeDescription(item),
        parentId: item.parentId, // Store parentId for edge reconstruction
        originalData: item, // Keep original data for reference
      },
    } as VueFlowNode
  })

  return nodes
}

/**
 * Transform payload data to Vue Flow edges format
 */
export function transformPayloadToEdges(payloadData: PayloadNode[]): VueFlowEdge[] {
  if (!Array.isArray(payloadData)) {
    return []
  }

  const edges: VueFlowEdge[] = []

  payloadData.forEach((node) => {
    // Skip root node (parentId === -1)
    if (node.parentId === -1) {
      return
    }

    const sourceId = String(node.parentId)
    const targetId = String(node.id)

    // Determine edge type based on node type
    let edgeType: string = 'default'
    let label: string = ''
    let style: { stroke?: string; strokeWidth?: number } = {}

    if (node.type === 'dateTimeConnector') {
      const connectorType = node.data?.connectorType
      edgeType = 'smoothstep'
      label = connectorType === 'success' ? 'Success' : 'Failure'
      style = {
        stroke: connectorType === 'success' ? '#10b981' : '#ef4444',
        strokeWidth: 2,
      }
    }

    edges.push({
      id: `edge-${sourceId}-${targetId}`,
      source: sourceId,
      target: targetId,
      type: edgeType,
      label,
      style,
      animated: node.type === 'dateTimeConnector',
    })
  })

  return edges
}

/**
 * Build edges from Vue Flow nodes
 * This function extracts parentId from Vue Flow node structure
 */
export function buildEdgesFromVueFlowNodes(vueFlowNodes: VueFlowNode[]): VueFlowEdge[] {
  if (!Array.isArray(vueFlowNodes)) {
    return []
  }

  const edges: VueFlowEdge[] = []

  vueFlowNodes.forEach((node) => {
    // Extract parentId from Vue Flow node structure
    // Check originalData first (for nodes loaded from payload)
    // Then check data.parentId (for newly created nodes)
    const originalData = node.data?.originalData
    const parentId = originalData?.parentId ?? node.data?.parentId

    // Skip root node (parentId === -1 or undefined/null)
    if (parentId === -1 || parentId === undefined || parentId === null) {
      return
    }

    const sourceId = String(parentId)
    const targetId = String(node.id)

    // Determine edge type based on node type
    let edgeType: string = 'default'
    let label: string = ''
    let style: { stroke?: string; strokeWidth?: number } = {}

    // Check node type from originalData or node.type
    const nodeType = originalData?.type ?? node.type

    if (nodeType === 'dateTimeConnector') {
      const connectorType = originalData?.data?.connectorType ?? node.data?.connectorType
      edgeType = 'smoothstep'
      label = connectorType === 'success' ? 'Success' : 'Failure'
      style = {
        stroke: connectorType === 'success' ? '#10b981' : '#ef4444',
        strokeWidth: 2,
      }
    }

    edges.push({
      id: `edge-${sourceId}-${targetId}`,
      source: sourceId,
      target: targetId,
      type: edgeType,
      label,
      style,
      animated: nodeType === 'dateTimeConnector',
    })
  })

  return edges
}

/**
 * Map payload node type to Vue Flow node type
 */
function mapNodeType(payloadType: PayloadNode['type']): string {
  const typeMap: Record<PayloadNode['type'], string> = {
    trigger: 'trigger',
    sendMessage: 'sendMessage',
    addComment: 'addComment',
    dateTime: 'businessHours',
    dateTimeConnector: 'dateTimeConnector',
  }

  return typeMap[payloadType] || 'default'
}

/**
 * Get node label/name
 */
function getNodeLabel(node: PayloadNode): string {
  if (node.name) {
    return node.name
  }

  const labelMap: Record<PayloadNode['type'], string> = {
    trigger: 'Trigger',
    sendMessage: 'Send Message',
    addComment: 'Add Comment',
    dateTime: 'Business Hours',
    dateTimeConnector: node.data?.connectorType === 'success' ? 'Success' : 'Failure',
  }

  return labelMap[node.type] || 'Node'
}

/**
 * Get node description (truncated)
 */
export function getNodeDescription(
  node: PayloadNode | VueFlowNode,
  maxLength: number = 50
): string {
  // Check if it's a PayloadNode or VueFlowNode
  const isPayloadNode = 'parentId' in node && !('position' in node)
  
  let nodeData: any
  let nodeType: string
  
  if (isPayloadNode) {
    // It's a PayloadNode
    nodeData = (node as PayloadNode).data
    nodeType = (node as PayloadNode).type
  } else {
    // It's a VueFlowNode
    nodeData = (node as VueFlowNode).data
    // Try to get type from originalData first, then from node type
    const originalData = nodeData?.originalData
    nodeType = originalData?.type || (node as VueFlowNode).type
  }
  
  if (!nodeData) {
    return ''
  }

  let description = ''

  switch (nodeType) {
    case 'sendMessage':
      const textPayload = nodeData.payload?.find((p: any) => p.type === 'text')
      description = textPayload?.text || ''
      break
    case 'addComment':
      description = nodeData.comment || ''
      break
    case 'dateTime':
      description = `Business Hours - ${nodeData.timezone || 'UTC'}`
      break
    case 'trigger':
      description = nodeData.type || ''
      break
    default:
      description = ''
  }

  // Truncate if needed
  if (description.length > maxLength) {
    return description.substring(0, maxLength) + '...'
  }

  return description
}

/**
 * Create a new node with default structure
 */
export function createNewNode(nodeData: NodeCreationData): PayloadNode {
  const { title, description, type, parentId } = nodeData
  const id = generateNodeId()

  const baseNode: PayloadNode = {
    id,
    name: title,
    type: mapCreateTypeToPayloadType(type),
    parentId: parentId || -1,
    data: getDefaultDataForType(type),
  }

  // Add type-specific data
  switch (type) {
    case 'sendMessage':
      if (description) {
        baseNode.data.payload = [
          {
            type: 'text',
            text: description,
          },
        ]
      }
      break
    case 'addComment':
      baseNode.data.comment = description || ''
      break
    case 'businessHours':
      baseNode.data = {
        times: getDefaultBusinessHours(),
        connectors: [],
        timezone: (nodeData as any).timezone || 'UTC',
        action: 'businessHours',
      }
      break
  }

  return baseNode
}

/**
 * Map create form type to payload type
 */
function mapCreateTypeToPayloadType(
  createType: NodeCreationData['type']
): PayloadNode['type'] {
  const typeMap: Record<NodeCreationData['type'], PayloadNode['type']> = {
    sendMessage: 'sendMessage',
    addComment: 'addComment',
    businessHours: 'dateTime',
  }

  return typeMap[createType] || 'sendMessage'
}

/**
 * Get default data structure for node type
 */
function getDefaultDataForType(type: NodeCreationData['type']): PayloadNode['data'] {
  switch (type) {
    case 'sendMessage':
      return { payload: [] }
    case 'addComment':
      return { comment: '' }
    case 'businessHours':
      return {
        times: getDefaultBusinessHours(),
        connectors: [],
        timezone: 'UTC',
        action: 'businessHours',
      }
    default:
      return {}
  }
}

/**
 * Get default business hours (all days 09:00-17:00)
 */
function getDefaultBusinessHours(): Array<{
  day: string
  startTime: string
  endTime: string
}> {
  const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
  return days.map((day) => ({
    day,
    startTime: '09:00',
    endTime: '17:00',
  }))
}

