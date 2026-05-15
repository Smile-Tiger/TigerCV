<script setup lang="ts">
import AppNav from '@/components/AppNav.vue'
import PageTransition from '@/components/PageTransition.vue'
import Background from '@/components/Background.vue'
</script>

<template>
  <div class="app-shell">
    <Background />
    <AppNav />
    <main class="app-content">
      <PageTransition />
    </main>
  </div>
</template>

<style scoped lang="scss">
.app-shell {
  min-height: 100vh;
}

.app-content {
  padding-top: 64px;
}
</style>
