<script setup lang="ts">
import { computed, ref } from 'vue'
import MarkdownIt from 'markdown-it'
import markdownItAttrs from 'markdown-it-attrs'

const props = defineProps<{
  markdown: string
}>()

const MIN_PREVIEW_SCALE = 0.45
const MAX_PREVIEW_SCALE = 1.8
const PREVIEW_SCALE_STEP = 0.05

const previewScale = ref(0.9)

const previewScalePercent = computed(() => `${Math.round(previewScale.value * 100)}%`)
const previewPaperStyle = computed(() => ({
  transform: `scale(${previewScale.value})`,
}))

const parser = new MarkdownIt({
  html: true,
  linkify: true,
  breaks: true,
})

parser.use(markdownItAttrs, {
  leftDelimiter: '{',
  rightDelimiter: '}',
  allowedAttributes: ['width', 'height', 'style', 'class'],
})

const previewHtml = computed(() => parser.render(props.markdown))

const clampPreviewScale = (value: number) =>
  Math.min(MAX_PREVIEW_SCALE, Math.max(MIN_PREVIEW_SCALE, Number(value.toFixed(2))))

const handlePreviewWheel = (event: WheelEvent) => {
  if (!event.ctrlKey) return

  event.preventDefault()
  const direction = event.deltaY > 0 ? -1 : 1
  previewScale.value = clampPreviewScale(previewScale.value + direction * PREVIEW_SCALE_STEP)
}
</script>

<template>
  <div class="preview-panel-body">
    <div class="preview-toolbar">
      <div class="preview-toolbar-left">
        <span>简历预览</span>
      </div>
      <div class="preview-toolbar-right">
        <span>{{ previewScalePercent }}</span>
      </div>
    </div>

    <div class="preview-shell" @wheel="handlePreviewWheel">
      <div class="paper-stage">
        <article class="preview-paper markdown-body" :style="previewPaperStyle" v-html="previewHtml"></article>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/colors.scss' as *;

.preview-panel-body {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #f8fbff 0%, #edf3f9 100%);
}

.preview-toolbar {
  height: 50px;
  padding: 0 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  border-bottom: 1px solid rgb(226 232 240 / 95%);
  background: linear-gradient(180deg, #ffffff 0%, #f4f8fd 100%);
  color: $slate-600;
  font-size: 13px;
  font-weight: 700;
}

.preview-toolbar-left {
  min-width: 0;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: $slate-600;
  font-size: 18px;
}

.preview-toolbar-right {
  height: 26px;
  padding: 0 10px;
  display: inline-flex;
  align-items: center;
  border: 1px solid rgb(203 213 225 / 86%);
  border-radius: 999px;
  background: rgb(255 255 255 / 82%);
  color: $slate-500;
  font-size: 12px;
  font-weight: 700;
}

.preview-shell {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 14px;
  background:
    radial-gradient(circle at 50% 0%, rgb(219 234 254 / 36%), transparent 30%),
    linear-gradient(180deg, #eef3f9 0%, #e3e9f2 100%);
  scrollbar-width: thin;
  scrollbar-color: #b8c7d9 #e6edf6;

  &::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }

  &::-webkit-scrollbar-track {
    background: #e6edf6;
  }

  &::-webkit-scrollbar-thumb {
    border: 2px solid #e6edf6;
    border-radius: 999px;
    background: #b8c7d9;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
}

.paper-stage {
  width: max(100%, calc(794px * v-bind(previewScale) + 72px));
  min-height: max(100%, calc(1123px * v-bind(previewScale) + 72px));
  padding: 24px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.preview-paper {
  width: 794px;
  min-height: 1123px;
  padding: 42px 52px;
  flex-shrink: 0;
  border: 1px solid rgb(226 232 240 / 92%);
  border-radius: 4px;
  background: #ffffff;
  box-shadow:
    0 28px 70px rgb(15 23 42 / 18%),
    0 1px 0 rgb(255 255 255 / 90%) inset;
  transform-origin: top center;
  transition: transform 0.12s ease-out;
  overflow-wrap: anywhere;
}

.markdown-body {
  color: $slate-700;
  font-size: 14px;
  line-height: 1.75;
  overflow-wrap: anywhere;
  word-break: normal;

  :deep(h1),
  :deep(h2),
  :deep(h3) {
    color: $slate-900;
  }

  :deep(h1) {
    margin: 0 0 14px;
    font-size: 26px;
  }

  :deep(h2) {
    margin: 18px 0 12px;
    font-size: 20px;
  }

  :deep(h3) {
    margin: 14px 0 10px;
    font-size: 16px;
  }

  :deep(p),
  :deep(ul),
  :deep(ol) {
    margin: 0 0 12px;
  }

  :deep(ul) {
    padding-left: 20px;
  }

  :deep(li) {
    margin: 4px 0;
  }

  :deep(blockquote) {
    margin: 12px 0;
    padding: 10px 14px;
    border-left: 4px solid $blue-300;
    border-radius: 0 10px 10px 0;
    background: $blue-50;
    color: $slate-600;
  }

  :deep(a) {
    color: $blue-600;
    text-decoration: none;
  }

  :deep(code) {
    padding: 2px 6px;
    border-radius: 6px;
    background: $blue-100;
    color: $slate-700;
  }

  :deep(pre) {
    padding: 14px 16px;
    overflow: auto;
    border: 1px solid $slate-200;
    border-radius: 12px;
    background: $blue-50;
    color: $slate-600;
    word-break: break-word;
    overflow-wrap: anywhere;
  }
}
</style>
