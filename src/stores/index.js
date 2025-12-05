import { defineStore } from 'pinia'

export const useNodesStore = defineStore('nodes', {
  state: () => ({
    nodes: [],
    edges: [],
  }),
  actions: {
    setNodes(nodes) {
      this.nodes = nodes
    },
    setEdges(edges) {
      this.edges = edges
    },
    addNode(node) {
      this.nodes.push(node)
    },
    updateNode(nodeId, updates) {
      const index = this.nodes.findIndex((n) => n.id === nodeId)
      if (index !== -1) {
        this.nodes[index] = { ...this.nodes[index], ...updates }
      }
    },
    deleteNode(nodeId) {
      this.nodes = this.nodes.filter((n) => n.id !== nodeId)
      this.edges = this.edges.filter(
        (e) => e.source !== nodeId && e.target !== nodeId
      )
    },
  },
})

