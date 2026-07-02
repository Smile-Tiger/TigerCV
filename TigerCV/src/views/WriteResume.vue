<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import ResumeEditor from '@/components/resume/ResumeEditor.vue'
import ResumePreview from '@/components/resume/ResumePreview.vue'
import { useResumeStore } from '@/stores/resume'

const resumeStore = useResumeStore()
const markdown = ref(resumeStore.markdown)
const splitRatio = ref(0.4)
const pageRef = ref<HTMLElement | null>(null)
const isDraggingSplit = ref(false)

watch(markdown, (val) => {
  resumeStore.setMarkdown(val)
})

const gridTemplateColumns = computed(() => `${splitRatio.value}fr 10px ${1 - splitRatio.value}fr`)

const updateSplitRatio = (clientX: number) => {
  const page = pageRef.value
  if (!page) return

  const rect = page.getBoundingClientRect()
  const minRatio = 0.26
  const maxRatio = 0.56
  const dividerWidth = 10
  const usableWidth = rect.width - dividerWidth
  if (usableWidth <= 0) return

  const nextRatio = (clientX - rect.left) / usableWidth
  splitRatio.value = Math.min(maxRatio, Math.max(minRatio, nextRatio))
}

const stopDragging = () => {
  if (!isDraggingSplit.value) return

  isDraggingSplit.value = false
  document.body.style.userSelect = ''
  document.body.style.cursor = ''
  window.removeEventListener('pointermove', onSplitPointerMove)
  window.removeEventListener('pointerup', stopDragging)
}

function onSplitPointerMove(event: PointerEvent) {
  updateSplitRatio(event.clientX)
}

const startDraggingSplit = (event: PointerEvent) => {
  event.preventDefault()
  isDraggingSplit.value = true
  document.body.style.userSelect = 'none'
  document.body.style.cursor = 'col-resize'
  updateSplitRatio(event.clientX)
  window.addEventListener('pointermove', onSplitPointerMove)
  window.addEventListener('pointerup', stopDragging)
}

onBeforeUnmount(() => {
  stopDragging()
})
</script>

<template>
  <main ref="pageRef" class="page container" :class="{ dragging: isDraggingSplit }" :style="{ gridTemplateColumns }">
    <section class="panel editor-panel">
      <ResumeEditor v-model="markdown" />
    </section>

    <div class="splitter" :class="{ 'is-active': isDraggingSplit }" @pointerdown="startDraggingSplit">
      <span class="splitter-line"></span>
    </div>

    <section class="panel preview-panel">
      <ResumePreview :markdown="markdown" />
    </section>
  </main>
</template>

<style scoped lang="scss">
.page {
  min-width: 1180px;
  height: calc(100vh - 52px - 12px - 12px);
  display: grid;
  grid-template-columns: minmax(0, 0.4fr) 6px minmax(0, 0.6fr);
  justify-content: center;
  gap: 4px;
  padding: 18px 24px 20px;
  background: transparent;
  overflow: hidden;
}

.page.dragging {
  user-select: none;
  cursor: col-resize;
}

.panel {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgb(226 232 240 / 96%);
  border-radius: 24px;
  background: rgb(255 255 255 / 78%);
  box-shadow:
    0 28px 70px rgb(148 163 184 / 18%),
    0 1px 0 rgb(255 255 255 / 88%) inset;
  backdrop-filter: blur(16px);
}

.editor-panel,
.preview-panel {
  height: 100%;
}

.splitter {
  position: relative;
  align-self: stretch;
  width: 8px;
  border-radius: 999px;
  cursor: col-resize;
  background: transparent;
  transition:
    background 0.18s ease,
    transform 0.18s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  .splitter-line {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 2px;
    height: calc(100% - 28px);
    max-height: calc(100% - 28px);
    border-radius: 999px;
    background: rgb(203 213 225 / 0%);
    opacity: 0;
    transition:
      background 0.18s ease,
      box-shadow 0.18s ease,
      opacity 0.18s ease,
      height 0.18s ease;
  }

  &:hover,
  &.is-active {
    background: rgb(219 234 254 / 14%);

    .splitter-line {
      width: 3px;
      opacity: 1;
      background: linear-gradient(180deg, #93c5fd 0%, #60a5fa 100%);
      box-shadow:
        0 0 0 4px rgb(255 255 255 / 72%),
        0 0 0 6px rgb(191 219 254 / 16%);
    }
  }
}
</style>
