<template>
  <div class="flow-chart-view">
    <h1>Flow Chart Application</h1>
    <p>Canvas will be implemented here</p>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

onMounted(() => {
  // Check if node ID is in route
  if (route.params.id) {
    console.log('Node ID:', route.params.id)
  }
})
</script>

<style scoped>
.flow-chart-view {
  width: 100%;
  height: 100vh;
  padding: 20px;
}
</style>

