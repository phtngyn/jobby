<script setup lang="ts">
const { x, y } = useMouse()
</script>

<template>
  <div>
    <div>pos: {{ x }}, {{ y }}</div>
    <UButton>Hello</UButton>
  </div>
</template>
