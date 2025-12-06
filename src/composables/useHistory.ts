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

  const canUndo = computed(() => historyIndex.value > 0 && history.value.length > 1)
  const canRedo = computed(() => historyIndex.value < history.value.length - 1)

  const saveState = () => {
    if (isUndoing.value) {
      isUndoing.value = false
      return
    }

    if (historyIndex.value < history.value.length - 1) {
      history.value = history.value.slice(0, historyIndex.value + 1)
    }

    const currentState: HistoryState = {
      nodes: JSON.parse(JSON.stringify(store.nodes)),
      edges: JSON.parse(JSON.stringify(store.edges)),
    }

    history.value.push(currentState)

    if (history.value.length > MAX_HISTORY_SIZE) {
      history.value.shift()
    } else {
      historyIndex.value++
    }
  }

  const undo = () => {
    if (!canUndo.value) return

    isUndoing.value = true
    historyIndex.value--

    const previousState = history.value[historyIndex.value]
    if (previousState) {
      const restoredNodes = JSON.parse(JSON.stringify(previousState.nodes))
      store.setNodes(restoredNodes)
      const edges = buildEdgesFromVueFlowNodes(restoredNodes)
      store.setEdges(edges)
    }
  }

  const redo = () => {
    if (!canRedo.value) return

    isUndoing.value = true
    historyIndex.value++

    const nextState = history.value[historyIndex.value]
    if (nextState) {
      const restoredNodes = JSON.parse(JSON.stringify(nextState.nodes))
      store.setNodes(restoredNodes)
      const edges = buildEdgesFromVueFlowNodes(restoredNodes)
      store.setEdges(edges)
    }
  }

  const initHistory = () => {
    if (history.value.length === 0 && store.nodes.length > 0) {
      history.value = [{
        nodes: JSON.parse(JSON.stringify(store.nodes)),
        edges: JSON.parse(JSON.stringify(store.edges)),
      }]
      historyIndex.value = 0
    }
  }

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

