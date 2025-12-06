import { ref, computed } from 'vue'
import { useNodesStore } from '@/stores'
import type { VueFlowNode, VueFlowEdge } from '@/types'

interface HistoryState {
  nodes: VueFlowNode[]
  edges: VueFlowEdge[]
}

const MAX_HISTORY_SIZE = 50

export function useHistory() {
  const store = useNodesStore()
  const history = ref<HistoryState[]>([])
  const historyIndex = ref(-1)
  const isUndoing = ref(false)

  const canUndo = computed(() => historyIndex.value >= 0)
  const canRedo = computed(() => historyIndex.value < history.length - 1)

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
      store.setNodes(JSON.parse(JSON.stringify(previousState.nodes)))
      store.setEdges(JSON.parse(JSON.stringify(previousState.edges)))
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
      store.setNodes(JSON.parse(JSON.stringify(nextState.nodes)))
      store.setEdges(JSON.parse(JSON.stringify(nextState.edges)))
    }
  }

  /**
   * Initialize history with current state
   */
  const initHistory = () => {
    history.value = [{
      nodes: JSON.parse(JSON.stringify(store.nodes)),
      edges: JSON.parse(JSON.stringify(store.edges)),
    }]
    historyIndex.value = 0
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

