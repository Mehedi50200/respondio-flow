import { ref, computed } from 'vue'
import { useNodesStore } from '@/stores'
import { buildEdgesFromVueFlowNodes } from '@/utils/nodeTransform'
import type { VueFlowNode, VueFlowEdge } from '@/types'

interface HistoryState {
  nodes: VueFlowNode[]
  edges: VueFlowEdge[]
}

const MAX_HISTORY_SIZE = 50

// Shared state across all instances
const history = ref<HistoryState[]>([])
const historyIndex = ref(-1)
const isUndoing = ref(false)

export function useHistory() {
  const store = useNodesStore()

  // canUndo: we can undo if we're not at the initial state (index > 0)
  const canUndo = computed(() => historyIndex.value > 0 && history.value.length > 1)
  // canRedo: we can redo if there's a future state
  const canRedo = computed(() => historyIndex.value < history.value.length - 1)

  /**
   * Save current state to history
   */
  const saveState = () => {
    if (isUndoing.value) {
      isUndoing.value = false
      return
    }

    // Remove any future history if we're not at the end
    if (historyIndex.value < history.value.length - 1) {
      history.value = history.value.slice(0, historyIndex.value + 1)
    }

    // Save current state
    const currentState: HistoryState = {
      nodes: JSON.parse(JSON.stringify(store.nodes)),
      edges: JSON.parse(JSON.stringify(store.edges)),
    }

    history.value.push(currentState)

    // Limit history size
    if (history.value.length > MAX_HISTORY_SIZE) {
      history.value.shift()
    } else {
      historyIndex.value++
    }
  }

  /**
   * Undo last action
   */
  const undo = () => {
    if (!canUndo.value) return

    isUndoing.value = true
    historyIndex.value--

    const previousState = history.value[historyIndex.value]
    if (previousState) {
      const restoredNodes = JSON.parse(JSON.stringify(previousState.nodes))
      store.setNodes(restoredNodes)
      
      // Rebuild edges from restored nodes to ensure consistency
      const edges = buildEdgesFromVueFlowNodes(restoredNodes)
      store.setEdges(edges)
    }
  }

  /**
   * Redo last undone action
   */
  const redo = () => {
    if (!canRedo.value) return

    isUndoing.value = true
    historyIndex.value++

    const nextState = history.value[historyIndex.value]
    if (nextState) {
      const restoredNodes = JSON.parse(JSON.stringify(nextState.nodes))
      store.setNodes(restoredNodes)
      
      // Rebuild edges from restored nodes to ensure consistency
      const edges = buildEdgesFromVueFlowNodes(restoredNodes)
      store.setEdges(edges)
    }
  }

  /**
   * Initialize history with current state
   * Only initializes if history is empty
   */
  const initHistory = () => {
    // Only initialize if history is empty (first load)
    if (history.value.length === 0 && store.nodes.length > 0) {
      history.value = [{
        nodes: JSON.parse(JSON.stringify(store.nodes)),
        edges: JSON.parse(JSON.stringify(store.edges)),
      }]
      historyIndex.value = 0
    }
  }

  /**
   * Clear history
   */
  const clearHistory = () => {
    history.value = []
    historyIndex.value = -1
  }

  return {
    canUndo,
    canRedo,
    saveState,
    undo,
    redo,
    initHistory,
    clearHistory,
  }
}

