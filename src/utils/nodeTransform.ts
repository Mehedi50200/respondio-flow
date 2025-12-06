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
 * Calculate position for a new node based on existing Vue Flow nodes
 * This preserves existing node positions and only calculates the new node's position
 */
export function calculateNewNodePosition(
  newNode: PayloadNode,
  existingVueFlowNodes: VueFlowNode[],
  allPayloadNodes: PayloadNode[]
): Position {
  const verticalSpacing = 200
  const horizontalSpacing = 300
  const baseX = 400

  const findParentPosition = (parentId: string | number): Position | null => {
    const parentVueFlowNode = existingVueFlowNodes.find(
      (n) => String(n.id) === String(parentId)
    )
    if (parentVueFlowNode) {
      return parentVueFlowNode.position
    }

    const connectorPayload = allPayloadNodes.find(
      (n) => String(n.id) === String(parentId) && n.type === 'dateTimeConnector'
    )
    if (connectorPayload) {
      const businessHoursVueFlowNode = existingVueFlowNodes.find(
        (n) => String(n.id) === String(connectorPayload.parentId)
      )
      if (businessHoursVueFlowNode) {
        return businessHoursVueFlowNode.position
      }
    }

    return null
  }

  if (newNode.parentId === -1) {
    return { x: baseX, y: 100 }
  }

  const parentPosition = findParentPosition(newNode.parentId)
  if (!parentPosition) {
    const maxY = existingVueFlowNodes.reduce(
      (max, node) => Math.max(max, node.position.y),
      100
    )
    return { x: baseX, y: maxY + verticalSpacing }
  }

  const connectorParent = allPayloadNodes.find(
    (n) => String(n.id) === String(newNode.parentId) && n.type === 'dateTimeConnector'
  )

  if (connectorParent) {
    const isSuccess = connectorParent.data?.connectorType === 'success'
    const x = baseX + (isSuccess ? -horizontalSpacing : horizontalSpacing)

    const siblingNodes = existingVueFlowNodes.filter((n) => {
      const originalData = n.data?.originalData
      const nodeParentId = originalData?.parentId ?? n.data?.parentId
      return String(nodeParentId) === String(newNode.parentId)
    })

    const y =
      parentPosition.y + verticalSpacing * 2 + siblingNodes.length * verticalSpacing

    return { x, y }
  }

  const siblingNodes = existingVueFlowNodes.filter((n) => {
    const originalData = n.data?.originalData
    const nodeParentId = originalData?.parentId ?? n.data?.parentId
    return String(nodeParentId) === String(newNode.parentId)
  })

  const y = parentPosition.y + verticalSpacing + siblingNodes.length * verticalSpacing

  return { x: baseX, y }
}

/**
 * Calculate position for a node using recursive tree layout
 */
export function calculateNodePosition(
  node: PayloadNode,
  allNodes: PayloadNode[],
  _index: number = 0
): Position {
  const baseX = 400
  const baseY = 100
  const horizontalSpacing = 300
  const verticalSpacing = 200

  // Cache for calculated positions to avoid recalculation
  const positionCache = new Map<string | number, Position>()

  // Recursive function to get a node's position
  const getNodePosition = (targetNode: PayloadNode): Position => {
    const cacheKey = targetNode.id
    if (positionCache.has(cacheKey)) {
      return positionCache.get(cacheKey)!
    }

    if (targetNode.parentId === -1) {
      const pos = { x: baseX, y: baseY }
      positionCache.set(cacheKey, pos)
      return pos
    }

    const parent = allNodes.find((n) => String(n.id) === String(targetNode.parentId))
    if (!parent) {
      const pos = { x: baseX, y: baseY + verticalSpacing }
      positionCache.set(cacheKey, pos)
      return pos
    }

    const parentPos = getNodePosition(parent)

    const connectorParent = allNodes.find((n) => String(n.id) === String(targetNode.parentId) && n.type === 'dateTimeConnector')
    
    if (connectorParent) {
      const isSuccess = connectorParent.data?.connectorType === 'success'
      const parentX = baseX + (isSuccess ? -horizontalSpacing : horizontalSpacing)
      
      const siblings = allNodes.filter((n) => String(n.parentId) === String(targetNode.parentId))
      const siblingIndex = siblings.findIndex((n) => String(n.id) === String(targetNode.id))
      
      const connectorGrandParent = allNodes.find((n) => String(n.id) === String(connectorParent.parentId))
      const connectorGrandParentPos = connectorGrandParent ? getNodePosition(connectorGrandParent) : parentPos
      
      const pos = {
        x: parentX,
        y: connectorGrandParentPos.y + (verticalSpacing * 2) + (siblingIndex * verticalSpacing),
      }
      positionCache.set(cacheKey, pos)
      return pos
    }

    const siblings = allNodes.filter((n) => String(n.parentId) === String(targetNode.parentId))
    const regularSiblings = siblings.filter((n) => n.type !== 'dateTimeConnector')
    const siblingIndex = regularSiblings.findIndex((n) => String(n.id) === String(targetNode.id))
    
    const pos = {
      x: baseX,
      y: parentPos.y + verticalSpacing + (siblingIndex * verticalSpacing),
    }
    positionCache.set(cacheKey, pos)
    return pos
  }

  return getNodePosition(node)
}

/**
 * Transform payload data to Vue Flow nodes format
 */
export function transformPayloadToNodes(payloadData: PayloadNode[]): VueFlowNode[] {
  if (!Array.isArray(payloadData)) {
    return []
  }

  const sortedNodes = [...payloadData].sort((a, b) => {
    if (a.parentId === -1 && b.parentId !== -1) return -1
    if (a.parentId !== -1 && b.parentId === -1) return 1
    
    if (String(a.parentId) === String(b.parentId)) {
      return 0
    }
    
    return String(a.parentId).localeCompare(String(b.parentId))
  })

  const connectorMap = new Map<string | number, PayloadNode>()
  sortedNodes.forEach((node) => {
    if (node.type === 'dateTimeConnector') {
      connectorMap.set(node.id, node)
    }
  })

  const nodes = sortedNodes
    .filter((item) => item.type !== 'dateTimeConnector')
    .map((item, index) => {
      const position = calculateNodePosition(item, sortedNodes, index)

      const nodeData: any = {
        ...item.data,
        label: item.name || getNodeLabel(item),
        description: getNodeDescription(item),
        parentId: item.parentId,
        originalData: item,
      }

      if (item.type === 'dateTime' && item.data?.connectors && Array.isArray(item.data.connectors)) {
        const connectorObjects: PayloadNode[] = []
        item.data.connectors.forEach((connectorId: string | number) => {
          const connector = connectorMap.get(connectorId)
          if (connector) {
            connectorObjects.push(connector)
          }
        })
        nodeData.connectorObjects = connectorObjects
      }

      return {
        id: String(item.id),
        type: mapNodeType(item.type),
        position,
        data: nodeData,
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
  const connectorMap = new Map<string | number, PayloadNode>()

  payloadData.forEach((node) => {
    if (node.type === 'dateTimeConnector') {
      connectorMap.set(node.id, node)
    }
  })

  payloadData.forEach((node) => {
    if (node.parentId === -1) {
      return
    }

    if (node.type === 'dateTimeConnector') {
      return
    }

    let sourceId = String(node.parentId)
    const targetId = String(node.id)

    const connector = connectorMap.get(node.parentId)
    let edgeType: string = 'default'
    let label: string = ''
    let style: { stroke?: string; strokeWidth?: number } = {}
    let labelStyle: { [key: string]: string | number } | undefined
    let labelBgStyle: { [key: string]: string | number } | undefined
    let labelBgPadding: [number, number] | undefined
    let labelBgBorderRadius: number | undefined

    if (connector) {
      // This node's parent is a connector, so edge goes from connector's parent to this node
      sourceId = String(connector.parentId)
      const connectorType = connector.data?.connectorType
      const isSuccess = connectorType === 'success'
      edgeType = 'smoothstep'
      label = isSuccess ? 'Success' : 'Failure'
      style = {
        stroke: isSuccess ? '#10b981' : '#ef4444',
        strokeWidth: 2,
      }
      
      // Style the label text
      labelStyle = {
        fill: '#ffffff',
        fontWeight: 500,
        fontSize: 12,
      }
      
      // Style the label background with rounded corners
      labelBgStyle = {
        fill: isSuccess ? '#10b981' : '#ef4444',
        rx: 6,
        ry: 6,
      }
      
      labelBgPadding = [2, 12]
      labelBgBorderRadius = 6
    }

    edges.push({
      id: `edge-${sourceId}-${targetId}`,
      source: sourceId,
      target: targetId,
      type: edgeType,
      label,
      style,
      labelStyle,
      labelBgStyle,
      labelBgPadding,
      labelBgBorderRadius,
      animated: !!connector,
    })
  })

  return edges
}

export function buildEdgesFromVueFlowNodes(vueFlowNodes: VueFlowNode[]): VueFlowEdge[] {
  if (!Array.isArray(vueFlowNodes)) {
    return []
  }

  const edges: VueFlowEdge[] = []
  const connectorMap = new Map<string | number, PayloadNode>()

  vueFlowNodes.forEach((node) => {
    const originalData = node.data?.originalData
    if (originalData?.type === 'dateTimeConnector') {
      connectorMap.set(originalData.id, originalData)
    }
  })
  
  vueFlowNodes.forEach((node) => {
    if (node.data?.connectorObjects && Array.isArray(node.data.connectorObjects)) {
      node.data.connectorObjects.forEach((connector: PayloadNode) => {
        if (connector.type === 'dateTimeConnector') {
          connectorMap.set(connector.id, connector)
        }
      })
    }
    
    const originalData = node.data?.originalData
    if ((originalData?.type === 'dateTime' || node.type === 'businessHours') && node.data) {
      const connectors = originalData?.data?.connectors || node.data.connectors
      const businessHoursId = String(node.id)
      
      if (Array.isArray(connectors) && !node.data.connectorObjects) {
        connectors.forEach((connectorId: string | number) => {
          if (!connectorMap.has(connectorId)) {
            let foundConnector: PayloadNode | null = null
            vueFlowNodes.forEach((otherNode) => {
              const otherOriginalData = otherNode.data?.originalData
              if (otherOriginalData && String(otherOriginalData.id) === String(connectorId) && otherOriginalData.type === 'dateTimeConnector') {
                foundConnector = otherOriginalData
              }
            })
            
            if (!foundConnector) {
              const connectorIndex = connectors.indexOf(connectorId)
              const connectorType = connectorIndex === 0 ? 'success' : 'failure'
              
              foundConnector = {
                id: connectorId,
                parentId: businessHoursId,
                type: 'dateTimeConnector',
                name: connectorType === 'success' ? 'Success' : 'Failure',
                data: {
                  connectorType: connectorType as 'success' | 'failure',
                },
              } as PayloadNode
            }
            
            if (foundConnector) {
              connectorMap.set(connectorId, foundConnector)
            }
          }
        })
      }
    }
  })

  vueFlowNodes.forEach((node) => {
    const originalData = node.data?.originalData
    const parentId = originalData?.parentId ?? node.data?.parentId

    if (parentId === -1 || parentId === undefined || parentId === null) {
      return
    }

    let sourceId = String(parentId)
    const targetId = String(node.id)

    const connector = connectorMap.get(parentId)
    let edgeType: string = 'default'
    let label: string = ''
    let style: { stroke?: string; strokeWidth?: number } = {}
    let labelStyle: { [key: string]: string | number } | undefined
    let labelBgStyle: { [key: string]: string | number } | undefined

    if (connector) {
      sourceId = String(connector.parentId)
      const connectorType = connector.data?.connectorType
      const isSuccess = connectorType === 'success'
      edgeType = 'smoothstep'
      label = isSuccess ? 'Success' : 'Failure'
      style = {
        stroke: isSuccess ? '#10b981' : '#ef4444',
        strokeWidth: 2,
      }
      
      labelStyle = {
        fill: '#ffffff',
        fontWeight: 500,
        fontSize: 12,
      }
      
      labelBgStyle = {
        fill: isSuccess ? '#10b981' : '#ef4444',
        rx: 6,
        ry: 6,
      }
    }

    edges.push({
      id: `edge-${sourceId}-${targetId}`,
      source: sourceId,
      target: targetId,
      type: edgeType,
      label,
      style,
      labelStyle,
      labelBgStyle,
      animated: !!connector,
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
  const isPayloadNode = 'parentId' in node && !('position' in node)
  
  let nodeData: any
  let nodeType: string
  
  if (isPayloadNode) {
    nodeData = (node as PayloadNode).data
    nodeType = (node as PayloadNode).type
  } else {
    nodeData = (node as VueFlowNode).data
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
      const triggerType = nodeData.type || 'conversationOpened'
      description = triggerType === 'messageReceived' ? 'Message Received' : 'Conversation Opened'
      break
    default:
      description = ''
  }

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

