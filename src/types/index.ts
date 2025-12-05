/**
 * Type definitions for the Flow Chart application
 */

export interface Position {
  x: number
  y: number
}

export interface PayloadNode {
  id: string | number
  parentId: string | number
  type: 'trigger' | 'sendMessage' | 'addComment' | 'dateTime' | 'dateTimeConnector'
  name?: string
  data: PayloadNodeData
}

export interface PayloadNodeData {
  type?: string
  oncePerContact?: boolean
  payload?: Array<{
    type: 'text' | 'attachment'
    text?: string
    attachment?: string
  }>
  comment?: string
  times?: Array<{
    day: string
    startTime: string
    endTime: string
  }>
  connectors?: string[]
  timezone?: string
  action?: string
  connectorType?: 'success' | 'failure'
}

export interface VueFlowNode {
  id: string
  type: string
  position: Position
  data: VueFlowNodeData
}

export interface VueFlowNodeData {
  label?: string
  description?: string
  parentId?: string | number
  originalData?: PayloadNode
  [key: string]: any
}

export interface VueFlowEdge {
  id: string
  source: string
  target: string
  type?: string
  label?: string
  style?: {
    stroke?: string
    strokeWidth?: number
  }
  animated?: boolean
}

export interface NodeCreationData {
  title: string
  description: string
  type: 'sendMessage' | 'addComment' | 'businessHours'
  parentId?: string | number
}

export interface NodeUpdateData {
  nodeId: string | number
  updates: Partial<VueFlowNode>
}

