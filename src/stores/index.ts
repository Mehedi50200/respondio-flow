import { defineStore } from 'pinia'
import type { VueFlowNode, VueFlowEdge } from '@/types'

interface NodesState {
  nodes: VueFlowNode[]
  edges: VueFlowEdge[]
  selectedNodeId: string | number | null
}

export const useNodesStore = defineStore('nodes', {
  state: (): NodesState => ({
    nodes: [],
    edges: [],
    selectedNodeId: null,
  }),

  getters: {
    /**
     * Get node by ID
     */
    getNodeById: (state) => (nodeId: string | number): VueFlowNode | null => {
      return state.nodes.find((n) => String(n.id) === String(nodeId)) || null
    },

    /**
     * Get children nodes for a parent
     */
    getChildrenNodes: (state) => (parentId: string | number): VueFlowNode[] => {
      return state.nodes.filter((n) => {
        const originalData = n.data?.originalData
        const nodeParentId = originalData?.parentId ?? n.data?.parentId
        return String(nodeParentId) === String(parentId)
      })
    },

    /**
     * Get selected node
     */
    selectedNode: (state): VueFlowNode | null => {
      if (!state.selectedNodeId) return null
      return state.nodes.find((n) => String(n.id) === String(state.selectedNodeId)) || null
    },
  },

  actions: {
    /**
     * Set nodes array
     */
    setNodes(nodes: VueFlowNode[]): void {
      this.nodes = nodes
    },

    /**
     * Set edges array
     */
    setEdges(edges: VueFlowEdge[]): void {
      this.edges = edges
    },

    /**
     * Add a new node
     */
    addNode(node: VueFlowNode): void {
      this.nodes.push(node)
    },

    /**
     * Update node by ID
     */
    updateNode(nodeId: string | number, updates: Partial<VueFlowNode>): void {
      const index = this.nodes.findIndex((n) => String(n.id) === String(nodeId))
      if (index !== -1) {
        const currentNode = this.nodes[index]
        const currentData = currentNode.data || {}
        const updateData = updates.data || {}
        
        // Preserve originalData and parentId - these are critical for edge building
        const originalData = currentData.originalData
        const parentId = currentData.parentId
        
        // Deep merge updates
        this.nodes[index] = {
          ...currentNode,
          ...updates,
          data: {
            ...currentData,
            ...updateData,
            // Always preserve originalData and parentId
            originalData,
            parentId,
          },
        }

        // Update originalData.data if it exists (for payload structure)
        if (originalData && updateData) {
          // Only update payload fields, not Vue Flow fields
          const payloadFields: Record<string, any> = {}
          if ('type' in updateData) payloadFields.type = updateData.type
          if ('payload' in updateData) payloadFields.payload = updateData.payload
          if ('comment' in updateData) payloadFields.comment = updateData.comment
          if ('times' in updateData) payloadFields.times = updateData.times
          if ('timezone' in updateData) payloadFields.timezone = updateData.timezone
          if ('action' in updateData) payloadFields.action = updateData.action
          if ('oncePerContact' in updateData) payloadFields.oncePerContact = updateData.oncePerContact
          
          this.nodes[index].data.originalData = {
            ...originalData,
            parentId: originalData.parentId, // Preserve parentId at root level
            data: {
              ...originalData.data,
              ...payloadFields,
            },
          } as any
        }
      }
    },

    /**
     * Delete node by ID
     */
    deleteNode(nodeId: string | number): void {
      this.nodes = this.nodes.filter((n) => String(n.id) !== String(nodeId))
      this.edges = this.edges.filter(
        (e) => String(e.source) !== String(nodeId) && String(e.target) !== String(nodeId)
      )

      // Clear selection if deleted node was selected
      if (String(this.selectedNodeId) === String(nodeId)) {
        this.selectedNodeId = null
      }
    },

    /**
     * Update node position
     */
    updateNodePosition(nodeId: string | number, position: Partial<{ x: number; y: number }>): void {
      const index = this.nodes.findIndex((n) => String(n.id) === String(nodeId))
      if (index !== -1) {
        this.nodes[index].position = { ...this.nodes[index].position, ...position }
      }
    },

    /**
     * Set selected node ID
     */
    setSelectedNode(nodeId: string | number | null): void {
      this.selectedNodeId = nodeId
    },

    /**
     * Clear selected node
     */
    clearSelectedNode(): void {
      this.selectedNodeId = null
    },
  },
})

