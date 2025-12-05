import { defineStore } from 'pinia'

export const useNodesStore = defineStore('nodes', {
  state: () => ({
    nodes: [],
    edges: [],
    selectedNodeId: null,
  }),

  getters: {
    /**
     * Get node by ID
     * @param {string|number} nodeId - Node ID
     * @returns {Object|null} Node object or null
     */
    getNodeById: (state) => (nodeId) => {
      return state.nodes.find((n) => String(n.id) === String(nodeId)) || null
    },

    /**
     * Get children nodes for a parent
     * @param {string|number} parentId - Parent node ID
     * @returns {Array} Array of child nodes
     */
    getChildrenNodes: (state) => (parentId) => {
      return state.nodes.filter((n) => {
        const originalData = n.data?.originalData
        const nodeParentId = originalData?.parentId ?? n.data?.parentId
        return String(nodeParentId) === String(parentId)
      })
    },

    /**
     * Get selected node
     * @returns {Object|null} Selected node or null
     */
    selectedNode: (state) => {
      if (!state.selectedNodeId) return null
      return state.nodes.find((n) => String(n.id) === String(state.selectedNodeId)) || null
    },
  },

  actions: {
    /**
     * Set nodes array
     * @param {Array} nodes - Array of nodes
     */
    setNodes(nodes) {
      this.nodes = nodes
    },

    /**
     * Set edges array
     * @param {Array} edges - Array of edges
     */
    setEdges(edges) {
      this.edges = edges
    },

    /**
     * Add a new node
     * @param {Object} node - Node object
     */
    addNode(node) {
      this.nodes.push(node)
    },

    /**
     * Update node by ID
     * @param {string|number} nodeId - Node ID
     * @param {Object} updates - Updates to apply
     */
    updateNode(nodeId, updates) {
      const index = this.nodes.findIndex((n) => String(n.id) === String(nodeId))
      if (index !== -1) {
        // Deep merge updates
        this.nodes[index] = {
          ...this.nodes[index],
          ...updates,
          data: {
            ...this.nodes[index].data,
            ...(updates.data || {}),
          },
        }

        // Update originalData if it exists
        if (this.nodes[index].data.originalData) {
          this.nodes[index].data.originalData = {
            ...this.nodes[index].data.originalData,
            ...updates.data,
          }
        }
      }
    },

    /**
     * Delete node by ID
     * @param {string|number} nodeId - Node ID to delete
     */
    deleteNode(nodeId) {
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
     * @param {string|number} nodeId - Node ID
     * @param {Object} position - Position object with x and y
     */
    updateNodePosition(nodeId, position) {
      const index = this.nodes.findIndex((n) => String(n.id) === String(nodeId))
      if (index !== -1) {
        this.nodes[index].position = { ...this.nodes[index].position, ...position }
      }
    },

    /**
     * Set selected node ID
     * @param {string|number|null} nodeId - Node ID to select
     */
    setSelectedNode(nodeId) {
      this.selectedNodeId = nodeId
    },

    /**
     * Clear selected node
     */
    clearSelectedNode() {
      this.selectedNodeId = null
    },
  },
})

