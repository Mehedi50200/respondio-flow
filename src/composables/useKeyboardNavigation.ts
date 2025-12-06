import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useNodesStore } from '@/stores'
import type { VueFlowNode } from '@/types'

export function useKeyboardNavigation() {
  const router = useRouter()
  const store = useNodesStore()
  const focusedNodeId = ref<string | number | null>(null)
  const isEnabled = ref(true)

  /**
   * Get all focusable nodes (excluding connectors)
   */
  const getFocusableNodes = (): VueFlowNode[] => {
    return store.nodes.filter(node => node.type !== 'dateTimeConnector')
  }

  /**
   * Focus next node
   */
  const focusNext = () => {
    const nodes = getFocusableNodes()
    if (nodes.length === 0) return

    if (!focusedNodeId.value) {
      focusedNodeId.value = nodes[0].id
      return
    }

    const currentIndex = nodes.findIndex(n => String(n.id) === String(focusedNodeId.value))
    const nextIndex = (currentIndex + 1) % nodes.length
    focusedNodeId.value = nodes[nextIndex].id
  }

  /**
   * Focus previous node
   */
  const focusPrevious = () => {
    const nodes = getFocusableNodes()
    if (nodes.length === 0) return

    if (!focusedNodeId.value) {
      focusedNodeId.value = nodes[nodes.length - 1].id
      return
    }

    const currentIndex = nodes.findIndex(n => String(n.id) === String(focusedNodeId.value))
    const prevIndex = currentIndex === 0 ? nodes.length - 1 : currentIndex - 1
    focusedNodeId.value = nodes[prevIndex].id
  }

  /**
   * Open drawer for focused node
   */
  const openFocusedNode = () => {
    if (!focusedNodeId.value) return
    
    const node = store.getNodeById(focusedNodeId.value)
    if (node && node.type !== 'dateTimeConnector') {
      router.push(`/node/${focusedNodeId.value}`)
    }
  }

  /**
   * Handle keyboard events
   */
  const handleKeyDown = (event: KeyboardEvent) => {
    // Don't handle if typing in input/textarea
    const target = event.target as HTMLElement
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      return
    }

    // Arrow keys for navigation
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      event.preventDefault()
      focusNext()
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      event.preventDefault()
      focusPrevious()
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openFocusedNode()
    } else if (event.key === 'Escape') {
      // Close drawer if open
      if (router.currentRoute.value.path.startsWith('/node/')) {
        router.push('/')
        focusedNodeId.value = null
      }
    }
  }

  /**
   * Watch for focused node changes and update store selection
   */
  watch(focusedNodeId, (newId) => {
    if (newId) {
      store.setSelectedNode(newId)
    }
  })

  onMounted(() => {
    if (isEnabled.value) {
      window.addEventListener('keydown', handleKeyDown)
    }
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })

  return {
    focusedNodeId,
    isEnabled,
    focusNext,
    focusPrevious,
    openFocusedNode,
    handleKeyDown,
  }
}

