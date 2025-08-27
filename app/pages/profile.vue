<script setup lang="ts">
definePageMeta({
  middleware: ['authenticated'],
})
</script>

<template>
  <Panel>
    <PanelHeader page>
      <span>Profile</span>
    </PanelHeader>

    <PanelBody>
      <pre>{{ useUserSession() }}</pre>
    </PanelBody>
  </Panel>
</template>
