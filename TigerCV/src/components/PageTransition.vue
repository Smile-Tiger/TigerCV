<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

defineOptions({ name: 'PageTransition' })

const route = useRoute()
const lastPosition = ref(window.history.state?.position ?? 0)
const transitionName = ref('page-forward')

watch(
  () => route.fullPath,
  () => {
    const currentPosition = window.history.state?.position ?? 0
    transitionName.value = currentPosition >= lastPosition.value ? 'page-forward' : 'page-back'
    lastPosition.value = currentPosition
  },
)

const transitionKey = computed(() => route.fullPath)
</script>

<template>
  <RouterView v-slot="{ Component }">
    <Transition :name="transitionName" mode="out-in">
      <component :is="Component" :key="transitionKey" />
    </Transition>
  </RouterView>
</template>

<style scoped lang="scss">
.page-forward-enter-active,
.page-forward-leave-active,
.page-back-enter-active,
.page-back-leave-active {
  transition:
    opacity 0.36s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.36s cubic-bezier(0.22, 1, 0.36, 1),
    filter 0.36s cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform, opacity, filter;
}

.page-forward-enter-from {
  opacity: 0;
  transform: translateX(42px) scale(0.985);
  filter: blur(6px);
}

.page-forward-leave-to {
  opacity: 0;
  transform: translateX(-28px) scale(0.985);
  filter: blur(4px);
}

.page-forward-enter-to,
.page-forward-leave-from,
.page-back-enter-to,
.page-back-leave-from {
  opacity: 1;
  transform: translateX(0) scale(1);
  filter: blur(0);
}

.page-back-enter-from {
  opacity: 0;
  transform: translateX(-42px) scale(0.985);
  filter: blur(6px);
}

.page-back-leave-to {
  opacity: 0;
  transform: translateX(28px) scale(0.985);
  filter: blur(4px);
}
</style>
