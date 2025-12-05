/**
 * Transform payload.json data to Vue Flow format
 * Converts the flat array structure to nodes and edges for Vue Flow
 */

/**
 * Generate a unique node ID
 * @returns {string} Unique ID
 */
export function generateNodeId() {
  return Math.random().toString(36).substring(2, 9)
}

/**
 * Calculate position for a node based on its parent and index
 * @param {Object} node - Node object
 * @param {Array} allNodes - All nodes array
 * @param {number} index - Index in siblings
 * @returns {Object} Position object with x and y
 */
export function calculateNodePosition(node, allNodes, index = 0) {
  // Default positions
  const baseX = 250
  const baseY = 100
  const horizontalSpacing = 300
  const verticalSpacing = 150

  // If root node (parentId === -1)
  if (node.parentId === -1) {
    return { x: baseX, y: baseY }
  }

  // Find parent node
  const parent = allNodes.find((n) => n.id === node.parentId)
  if (!parent) {
    return { x: baseX, y: baseY + verticalSpacing * (index + 1) }
  }

  // Get parent position (default if not set)
  const parentX = parent.position?.x || baseX
  const parentY = parent.position?.y || baseY

  // Calculate position based on node type
  if (node.type === 'dateTimeConnector') {
    // Connectors should be positioned to the sides
    const isSuccess = node.data?.connectorType === 'success'
    return {
      x: parentX + (isSuccess ? -horizontalSpacing : horizontalSpacing),
      y: parentY + verticalSpacing,
    }
  }

  // Regular nodes below parent
  return {
    x: parentX,
    y: parentY + verticalSpacing * (index + 1),
  }
}

/**
 * Transform payload data to Vue Flow nodes format
 * @param {Array} payloadData - Raw payload data from JSON
 * @returns {Array} Transformed nodes for Vue Flow
 */
export function transformPayloadToNodes(payloadData) {
  if (!Array.isArray(payloadData)) {
    return []
  }

  // First pass: create nodes with basic structure
  const nodes = payloadData.map((item, index) => {
    const position = calculateNodePosition(item, payloadData, index)

    return {
      id: String(item.id),
      type: mapNodeType(item.type),
      position,
      data: {
        ...item.data,
        label: item.name || getNodeLabel(item),
        description: getNodeDescription(item),
        originalData: item, // Keep original data for reference
      },
    }
  })

  return nodes
}

/**
 * Transform payload data to Vue Flow edges format
 * @param {Array} payloadData - Raw payload data from JSON
 * @returns {Array} Transformed edges for Vue Flow
 */
export function transformPayloadToEdges(payloadData) {
  if (!Array.isArray(payloadData)) {
    return []
  }

  const edges = []

  payloadData.forEach((node) => {
    // Skip root node (parentId === -1)
    if (node.parentId === -1) {
      return
    }

    const sourceId = String(node.parentId)
    const targetId = String(node.id)

    // Determine edge type based on node type
    let edgeType = 'default'
    let label = ''
    let style = {}

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
 * Map payload node type to Vue Flow node type
 * @param {string} payloadType - Node type from payload
 * @returns {string} Vue Flow node type
 */
function mapNodeType(payloadType) {
  const typeMap = {
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
 * @param {Object} node - Node object
 * @returns {string} Node label
 */
function getNodeLabel(node) {
  if (node.name) {
    return node.name
  }

  const labelMap = {
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
 * @param {Object} node - Node object
 * @param {number} maxLength - Maximum description length
 * @returns {string} Truncated description
 */
export function getNodeDescription(node, maxLength = 50) {
  if (!node.data) {
    return ''
  }

  let description = ''

  switch (node.type) {
    case 'sendMessage':
      const textPayload = node.data.payload?.find((p) => p.type === 'text')
      description = textPayload?.text || ''
      break
    case 'addComment':
      description = node.data.comment || ''
      break
    case 'dateTime':
      description = `Business Hours - ${node.data.timezone || 'UTC'}`
      break
    case 'trigger':
      description = node.data.type || ''
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
 * @param {Object} nodeData - Node creation data
 * @returns {Object} New node object
 */
export function createNewNode(nodeData) {
  const { title, description, type, parentId } = nodeData
  const id = generateNodeId()

  const baseNode = {
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
        timezone: 'UTC',
        action: 'businessHours',
      }
      break
  }

  return baseNode
}

/**
 * Map create form type to payload type
 * @param {string} createType - Type from create form
 * @returns {string} Payload type
 */
function mapCreateTypeToPayloadType(createType) {
  const typeMap = {
    sendMessage: 'sendMessage',
    addComment: 'addComment',
    businessHours: 'dateTime',
  }

  return typeMap[createType] || 'sendMessage'
}

/**
 * Get default data structure for node type
 * @param {string} type - Node type
 * @returns {Object} Default data object
 */
function getDefaultDataForType(type) {
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
 * @returns {Array} Default business hours array
 */
function getDefaultBusinessHours() {
  const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
  return days.map((day) => ({
    day,
    startTime: '09:00',
    endTime: '17:00',
  }))
}

