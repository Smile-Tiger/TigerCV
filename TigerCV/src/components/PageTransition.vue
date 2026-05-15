<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

defineOptions({ name: 'PageTransition' })

const route = useRoute()
const lastPosition = ref<number>(window.history.state?.position ?? 0)
const transitionName = ref<'page-forward' | 'page-back'>('page-forward')

watch(
  () => route.fullPath,
  () => {
    const currentPosition = Number(window.history.state?.position ?? 0)
    transitionName.value = currentPosition >= lastPosition.value ? 'page-forward' : 'page-back'
    lastPosition.value = currentPosition
  },
  { immediate: true },
)
</script>

<template>
  <RouterView v-slot="{ Component, route }">
    <Transition :name="transitionName" mode="out-in" appear>
      <div class="route-page" :key="route.fullPath">
        <component :is="Component" />
      </div>
    </Transition>
  </RouterView>
</template>

<style scoped lang="scss">
.route-page {
  width: 100%;
  min-height: 100%;
}

.page-forward-enter-active,
.page-forward-leave-active,
.page-back-enter-active,
.page-back-leave-active {
  transition:
    opacity 0.42s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.42s cubic-bezier(0.22, 1, 0.36, 1),
    filter 0.42s cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform, opacity, filter;
}

.page-forward-enter-from {
  opacity: 0;
  transform: translateX(24px) scale(0.992);
  filter: blur(4px);
}

.page-forward-leave-to {
  opacity: 0;
  transform: translateX(-18px) scale(0.992);
  filter: blur(3px);
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
  transform: translateX(-24px) scale(0.992);
  filter: blur(4px);
}

.page-back-leave-to {
  opacity: 0;
  transform: translateX(18px) scale(0.992);
  filter: blur(3px);
}
</style>
