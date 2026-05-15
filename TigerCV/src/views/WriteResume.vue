<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import MarkdownIt from 'markdown-it'
import markdownItAttrs from 'markdown-it-attrs'

const markdown = ref('')

const editorRef = ref<HTMLTextAreaElement | null>(null)
const rulerRef = ref<HTMLDivElement | null>(null)
const activeLine = ref(1)
const visualLineCount = ref(1)
const previewScale = ref(0.9)
const splitRatio = ref(0.4)
const pageRef = ref<HTMLElement | null>(null)
const isDraggingSplit = ref(false)

const MIN_PREVIEW_SCALE = 0.45
const MAX_PREVIEW_SCALE = 1.8
const PREVIEW_SCALE_STEP = 0.05
const MAX_IMAGE_SIZE = 5 * 1024 * 1024

const uploadDialogVisible = ref(false)
const uploadFiles = ref<any[]>([])

const imageStore = new Map<string, { file: File; objectUrl: string }>()

const previewScalePercent = computed(() => `${Math.round(previewScale.value * 100)}%`)
const previewPaperStyle = computed(() => ({
  transform: `scale(${previewScale.value})`,
}))

const gridTemplateColumns = computed(() => `${splitRatio.value}fr 10px ${1 - splitRatio.value}fr`)

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

const previewHtml = computed(() => parser.render(markdown.value))
const lineNumbers = computed(() => {
  return Array.from({ length: visualLineCount.value }, (_, index) => index + 1)
})

const lineBoxHeight = computed(() => '20px')

const calculateVisualLineCount = (text: string) => {
  const textarea = editorRef.value
  if (!textarea) return Math.max(1, text.split('\n').length)

  const style = window.getComputedStyle(textarea)
  const font = `${style.fontStyle} ${style.fontVariant} ${style.fontWeight} ${style.fontSize} / ${style.lineHeight} ${style.fontFamily}`
  const availableWidth = textarea.clientWidth - Number.parseFloat(style.paddingLeft) - Number.parseFloat(style.paddingRight)

  if (availableWidth <= 0) return Math.max(1, text.split('\n').length)

  return text.split('\n').reduce((total, line) => {
    const visualCount = Math.max(1, Math.ceil(measureTextWidth(line || ' ', font) / availableWidth))
    return total + visualCount
  }, 0)
}

const updateActiveLine = () => {
  const textarea = editorRef.value
  if (!textarea) return

  const cursor = textarea.selectionStart ?? 0
  activeLine.value = calculateVisualLineCount(markdown.value.slice(0, cursor)) || 1
}

const clampPreviewScale = (value: number) =>
  Math.min(MAX_PREVIEW_SCALE, Math.max(MIN_PREVIEW_SCALE, Number(value.toFixed(2))))

const handlePreviewWheel = (event: WheelEvent) => {
  if (!event.ctrlKey) return

  event.preventDefault()
  const direction = event.deltaY > 0 ? -1 : 1
  previewScale.value = clampPreviewScale(previewScale.value + direction * PREVIEW_SCALE_STEP)
}

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

const getSelection = () => {
  const textarea = editorRef.value
  if (!textarea) return { textarea: null, start: 0, end: 0 }

  return {
    textarea,
    start: textarea.selectionStart ?? markdown.value.length,
    end: textarea.selectionEnd ?? markdown.value.length,
  }
}

const replaceSelection = (before: string, after = '', placeholder = '') => {
  const { textarea, start, end } = getSelection()
  if (!textarea) return

  const selectedText = markdown.value.slice(start, end)
  const insertContent = selectedText ? `${before}${selectedText}${after}` : `${before}${placeholder}${after}`

  markdown.value = `${markdown.value.slice(0, start)}${insertContent}${markdown.value.slice(end)}`

  nextTick(() => {
    textarea.focus()
    if (selectedText) {
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length)
      updateActiveLine()
      return
    }

    const cursorPos = start + before.length + placeholder.length
    textarea.setSelectionRange(cursorPos, cursorPos)
    updateActiveLine()
  })
}

const toggleDelimitedText = (marker: string) => {
  const { textarea, start, end } = getSelection()
  if (!textarea) return

  const selectedText = markdown.value.slice(start, end)
  const hasSelection = start !== end

  if (hasSelection) {
    const wrappedText = `${marker}${selectedText}${marker}`
    const unwrappedText = selectedText.startsWith(marker) && selectedText.endsWith(marker)
      ? selectedText.slice(marker.length, -marker.length)
      : wrappedText

    markdown.value = `${markdown.value.slice(0, start)}${unwrappedText}${markdown.value.slice(end)}`

    nextTick(() => {
      textarea.focus()
      const nextStart = selectedText.startsWith(marker) && selectedText.endsWith(marker)
        ? start
        : start + marker.length
      const nextEnd = selectedText.startsWith(marker) && selectedText.endsWith(marker)
        ? start + unwrappedText.length
        : start + marker.length + selectedText.length
      textarea.setSelectionRange(nextStart, nextEnd)
      updateActiveLine()
    })
    return
  }

  const left = markdown.value.slice(0, start)
  const right = markdown.value.slice(end)
  const beforeText = markdown.value.slice(Math.max(0, start - marker.length), start)
  const afterText = markdown.value.slice(start, start + marker.length)

  if (beforeText === marker && afterText === marker) {
    markdown.value = `${left.slice(0, -marker.length)}${right.slice(marker.length)}`

    nextTick(() => {
      textarea.focus()
      const cursorPos = start - marker.length
      textarea.setSelectionRange(cursorPos, cursorPos)
      updateActiveLine()
    })
    return
  }

  markdown.value = `${left}${marker}${marker}${right}`

  nextTick(() => {
    textarea.focus()
    const cursorPos = start + marker.length
    textarea.setSelectionRange(cursorPos, cursorPos)
    updateActiveLine()
  })
}

const editorStyle = computed(() => ({
  lineHeight: lineBoxHeight.value,
}))

const lineStyle = computed(() => ({
  height: lineBoxHeight.value,
}))

const measureTextWidth = (() => {
  let canvas: HTMLCanvasElement | null = null

  return (text: string, font: string) => {
    canvas ??= document.createElement('canvas')
    const context = canvas.getContext('2d')
    if (!context) return 0

    context.font = font
    return context.measureText(text || ' ').width
  }
})()

const updateVisualLines = () => {
  const textarea = editorRef.value
  if (!textarea) return

  const style = window.getComputedStyle(textarea)
  const font = `${style.fontStyle} ${style.fontVariant} ${style.fontWeight} ${style.fontSize} / ${style.lineHeight} ${style.fontFamily}`
  const availableWidth = textarea.clientWidth - Number.parseFloat(style.paddingLeft) - Number.parseFloat(style.paddingRight)

  if (availableWidth <= 0) {
    visualLineCount.value = Math.max(1, markdown.value.split('\n').length)
    return
  }

  visualLineCount.value = markdown.value.split('\n').reduce((total, line) => {
    const visualCount = Math.max(1, Math.ceil(measureTextWidth(line || ' ', font) / availableWidth))
    return total + visualCount
  }, 0)
}

const handleEditorScroll = () => {
  const textarea = editorRef.value
  const ruler = rulerRef.value
  if (textarea && ruler) {
    ruler.scrollTop = textarea.scrollTop
  }

  updateActiveLine()
}

const wrapSelection = (prefix: string, suffix = prefix) => {
  if (prefix === suffix) {
    toggleDelimitedText(prefix)
    return
  }

  replaceSelection(prefix, suffix)
}

const toggleLink = () => {
  const { textarea, start, end } = getSelection()
  if (!textarea) return

  const insertText = `[链接文本](https://)`
  const current = markdown.value
  const linkPattern = /\[[^\]]*\]\(https:\/\/\)/g
  let insertPos = end

  for (const match of current.matchAll(linkPattern)) {
    const matchStart = match.index ?? 0
    const matchEnd = matchStart + match[0].length
    if (start >= matchStart && end <= matchEnd) {
      insertPos = matchEnd
      break
    }
  }

  markdown.value = `${current.slice(0, insertPos)}${insertText}${current.slice(insertPos)}`

  nextTick(() => {
    textarea.focus()
    const linkStart = insertPos + 1
    const linkEnd = linkStart + 4
    textarea.setSelectionRange(linkStart, linkEnd)
    updateActiveLine()
  })
}

const refreshEditorLines = () => {
  nextTick(() => {
    updateVisualLines()
    updateActiveLine()
  })
}

const handleEditorInput = () => {
  refreshEditorLines()
}

const handleEditorClick = () => {
  updateActiveLine()
}

const handleEditorKeyup = () => {
  refreshEditorLines()
}

const openUploadDialog = () => {
  uploadFiles.value = []
  uploadDialogVisible.value = true
}

const handleUploadExceed = () => {
  uploadDialogVisible.value = false
  ElMessage.warning('只能上传一张图片')
}

const confirmUpload = () => {
  if (uploadFiles.value.length === 0) {
    ElMessage.warning('请先选择一张图片')
    return
  }

  const file = uploadFiles.value[0].raw
  if (!file) {
    ElMessage.error('文件读取失败')
    return
  }

  if (file.size > MAX_IMAGE_SIZE) {
    ElMessage.error('图片大小不能超过 5MB')
    return
  }

  const objectUrl = URL.createObjectURL(file)
  imageStore.set(objectUrl, { file, objectUrl })

  const fileName = file.name || 'image'
  const { textarea, start } = getSelection()
  const mdImage = `![${fileName}](${objectUrl}){width=300 height=400}`

  markdown.value =
    markdown.value.slice(0, start) + mdImage + '\n' + markdown.value.slice(start)

  nextTick(() => {
    textarea?.focus()
    const cursorPos = start + mdImage.length + 1
    textarea?.setSelectionRange(cursorPos, cursorPos)
    refreshEditorLines()
  })

  ElMessage.success('图片已插入')
  uploadDialogVisible.value = false
}

onMounted(() => {
  refreshEditorLines()
  window.addEventListener('resize', refreshEditorLines)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', refreshEditorLines)
  for (const { objectUrl } of imageStore.values()) {
    URL.revokeObjectURL(objectUrl)
  }
  imageStore.clear()
})

</script>

<template>
  <main ref="pageRef" class="page container" :class="{ dragging: isDraggingSplit }" :style="{ gridTemplateColumns }">
    <section class="panel editor-panel">
      <div class="editor-topbar">
        <span class="dot dot-red"></span>
        <span class="dot dot-yellow"></span>
        <span class="dot dot-green"></span>
        <span class="editor-tip"><strong>MD</strong></span>
        <button class="tool-btn" type="button" title="加粗" @mousedown.prevent @click="wrapSelection('**')">
          <strong>B</strong>
        </button>
        <button class="tool-btn" type="button" title="斜体" @mousedown.prevent @click="wrapSelection('*')">
          <em>I</em>
        </button>
        <button class="tool-btn" type="button" title="添加链接" @mousedown.prevent @click="toggleLink">
          <el-icon>
            <EpPaperclip />
          </el-icon>
        </button>
        <button class="tool-btn" type="button" title="添加图片" @mousedown.prevent @click="openUploadDialog">
          <el-icon>
            <EpPicture />
          </el-icon>
        </button>
      </div>
      <div class="editor-shell">
        <div ref="rulerRef" class="editor-ruler" aria-hidden="true">
          <span v-for="n in lineNumbers" :key="n" :class="{ 'is-active': n === activeLine }" :style="lineStyle">
            {{ n }}
          </span>
        </div>

        <div class="editor-canvas">
          <textarea ref="editorRef" v-model="markdown" class="editor" :style="editorStyle" spellcheck="false"
            placeholder="请输入 Markdown 内容" @input="handleEditorInput" @click="handleEditorClick"
            @keyup="handleEditorKeyup" @keyup.arrow-down="handleEditorKeyup" @keyup.arrow-up="handleEditorKeyup"
            @keyup.enter="handleEditorKeyup" @scroll="handleEditorScroll" />
        </div>
      </div>
    </section>

    <div class="splitter" :class="{ 'is-active': isDraggingSplit }" @pointerdown="startDraggingSplit">
      <span class="splitter-line"></span>
    </div>

    <section class="panel preview-panel">
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
    </section>
  </main>

  <el-dialog v-model="uploadDialogVisible" title="上传图片" width="520px" :close-on-click-modal="false" destroy-on-close>
    <el-upload v-model:file-list="uploadFiles" drag :auto-upload="false" :limit="1" :on-exceed="handleUploadExceed"
      :accept="'.jpg,.jpeg,.png,.gif,.webp,.bmp'" list-type="picture">
      <div class="upload-placeholder">
        <el-icon class="upload-icon">
          <EpUploadFilled />
        </el-icon>
        <div class="upload-text">
          <span>将图片拖拽到此处，或</span>
          <em>点击上传</em>
        </div>
        <div class="upload-hint">支持 JPG、PNG、GIF、WebP、BMP 格式</div>
      </div>
    </el-upload>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="uploadDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmUpload">确认上传</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
@use '@/assets/colors.scss' as *;

@mixin hidden-scrollbar {
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    width: 0;
    height: 0;
  }
}

@mixin mono-font {
  font-family:
    Consolas,
    Monaco,
    'Courier New',
    monospace;
}

.page {
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

.panel-title {
  font-size: 16px;
  font-weight: 700;
}

.panel-subtitle {
  color: $slate-300;
  font-size: 12px;
}

.editor-topbar {
  height: 50px;
  padding: 0 16px;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid rgb(226 232 240 / 95%);
  background:
    linear-gradient(180deg, #ffffff 0%, #f4f8fd 100%),
    linear-gradient(90deg, rgb(219 234 254 / 40%) 0%, transparent 20%, transparent 80%, rgb(219 234 254 / 30%) 100%);
  box-shadow:
    0 1px 0 rgb(255 255 255 / 92%) inset,
    0 10px 24px rgb(148 163 184 / 6%);
}

.dot {
  width: 12px;
  height: 12px;
  display: inline-block;
  flex-shrink: 0;
  border-radius: 50%;
  opacity: 1;
  box-shadow:
    0 0 0 1px rgb(255 255 255 / 80%),
    0 1px 2px rgb(15 23 42 / 12%);

  &-red {
    background: #fb7185;
  }

  &-yellow {
    background: #fbbf24;
  }

  &-green {
    background: #34d399;
  }
}

.editor-tip {
  margin-left: 8px;
  color: $slate-500;
  font-size: 18px;
  letter-spacing: 0.02em;
}

.tool-btn {
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgb(203 213 225 / 80%);
  border-radius: 8px;
  background: linear-gradient(180deg, #ffffff 0%, $blue-100 100%);
  color: $slate-600;
  cursor: pointer;
  box-shadow: 0 1px 2px rgb(148 163 184 / 10%);
  transition:
    transform 0.15s ease,
    background 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease;

  &:hover {
    transform: translateY(-1px);
    border-color: rgb(191 219 254 / 95%);
    background: linear-gradient(180deg, #ffffff 0%, #e8f0fa 100%);
    box-shadow: 0 4px 10px rgb(148 163 184 / 14%);
  }

  &[title]:hover::after {
    content: attr(title);
    position: absolute;
    transform: translateY(-42px);
    padding: 6px 10px;
    border-radius: 6px;
    background: rgb(17 24 39 / 96%);
    color: #fff;
    font-size: 12px;
    white-space: nowrap;
    pointer-events: none;
  }

  strong,
  em {
    font-size: 15px;
    font-style: normal;
    font-weight: 700;
  }
}

.editor-shell {
  position: relative;
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 56px 1fr;
  overflow: hidden;
  background: linear-gradient(180deg, $blue-50 0%, #eef3f9 100%);

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    box-shadow: 0 0 0 1px rgb(255 255 255 / 60%) inset;
  }

  .editor-ruler {
    position: relative;
    padding: 17px 10px 17px 0;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0;
    overflow: hidden;
    border-right: 1px solid rgb(203 213 225 / 70%);
    background: linear-gradient(180deg, $blue-50 0%, #eef3f9 100%);
    color: $slate-400;
    font-size: 13px;
    line-height: 1.8;
    user-select: none;
    box-shadow: inset -1px 0 0 rgb(255 255 255 / 70%);
    @include mono-font;

    span {
      height: 27px;
      display: flex;
      align-items: center;

      &.is-active {
        position: relative;
        color: $blue-600;
        font-weight: 700;

        &::before {
          content: '';
          position: absolute;
          inset: -4px -8px;
          border: 1px solid rgb(147 197 253 / 65%);
          border-radius: 8px;
          background: rgb(219 234 254 / 30%);
          pointer-events: none;
          z-index: -1;
        }
      }
    }
  }
}

.editor-ruler {
  position: relative;
  padding: 17px 10px 17px 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0;
  overflow-y: auto;
  overflow-x: hidden;
  border-right: 1px solid rgb(203 213 225 / 70%);
  background: linear-gradient(180deg, $blue-50 0%, #eef3f9 100%);
  color: $slate-400;
  font-size: 13px;
  line-height: 1.8;
  user-select: none;
  box-shadow: inset -1px 0 0 rgb(255 255 255 / 70%);
  @include hidden-scrollbar;
  @include mono-font;

  span {
    height: 27px;
    display: flex;
    align-items: center;

    &.is-active {
      position: relative;
      color: $blue-600;
      font-weight: 700;

      &::before {
        content: '';
        position: absolute;
        inset: -4px -8px;
        border: 1px solid rgb(147 197 253 / 65%);
        border-radius: 8px;
        background: rgb(219 234 254 / 30%);
        pointer-events: none;
        z-index: -1;
      }
    }
  }
}

.editor-ruler {
  position: relative;
  padding: 17px 10px 17px 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0;
  overflow: hidden;
  border-right: 1px solid rgb(203 213 225 / 70%);
  background: linear-gradient(180deg, $blue-50 0%, #eef3f9 100%);
  color: $slate-400;
  font-size: 13px;
  line-height: 1.8;
  user-select: none;
  box-shadow: inset -1px 0 0 rgb(255 255 255 / 70%);
  @include mono-font;

  span {
    height: 27px;
    display: flex;
    align-items: center;

    &.is-active {
      position: relative;
      color: $blue-600;
      font-weight: 700;

      &::before {
        content: '';
        position: absolute;
        inset: -4px -8px;
        border: 1px solid rgb(147 197 253 / 65%);
        border-radius: 8px;
        background: rgb(219 234 254 / 30%);
        pointer-events: none;
        z-index: -1;
      }
    }
  }
}

.editor-canvas {
  position: relative;
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #ffffff 0%, #f9fbff 100%);
  box-shadow: inset 1px 0 0 rgb(255 255 255 / 75%);

  &::after {
    content: '';
    position: absolute;
    inset: 14px 0 14px auto;
    width: 1px;
    background: linear-gradient(180deg, transparent, rgb(226 232 240 / 90%), transparent);
    pointer-events: none;
  }
}

.editor {
  width: 100%;
  height: 100%;
  min-height: 0;
  padding: 20px 24px;
  border: 0;
  outline: none;
  resize: none;
  overflow-y: auto;
  overflow-x: hidden;
  background:
    linear-gradient(180deg, rgb(255 255 255 / 92%), rgb(248 251 255 / 98%)),
    transparent;
  color: $slate-700;
  font-size: 15px;
  line-height: 1.8;
  caret-color: #60a5fa;
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 80%);
  @include hidden-scrollbar;
  @include mono-font;

  &::selection {
    background: rgb(191 219 254 / 42%);
    color: #0f172a;
  }

  &::-moz-selection {
    background: rgb(191 219 254 / 42%);
    color: #0f172a;
  }

  &:focus {
    outline: none;
  }

  &::placeholder {
    color: $slate-400;
  }
}

.preview-panel {
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
  font-size: 18px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  color: $slate-600;
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

.page {
  min-width: 1180px;
}

.panel {
  min-height: 0;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 20px 0;

  .upload-icon {
    font-size: 48px;
    color: $blue-400;
  }

  .upload-text {
    font-size: 15px;
    color: $slate-600;

    em {
      color: $blue-500;
      font-style: normal;
      cursor: pointer;
    }
  }

  .upload-hint {
    font-size: 12px;
    color: $slate-400;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

:deep(.el-dialog) {
  border-radius: 20px;
  overflow: hidden;
  background: rgb(255 255 255 / 94%);
  border: 1px solid rgb(226 232 240 / 92%);
  box-shadow:
    0 32px 80px rgb(15 23 42 / 22%),
    0 1px 0 rgb(255 255 255 / 92%) inset;
  backdrop-filter: blur(20px);
}

:deep(.el-dialog__header) {
  margin: 0;
  padding: 18px 24px 16px;
  border-bottom: 1px solid rgb(226 232 240 / 90%);
  background:
    linear-gradient(180deg, #ffffff 0%, #f4f8fd 100%),
    linear-gradient(90deg, rgb(219 234 254 / 30%) 0%, transparent 30%, transparent 70%, rgb(219 234 254 / 20%) 100%);
}

:deep(.el-dialog__title) {
  font-size: 17px;
  font-weight: 700;
  color: $slate-800;
  letter-spacing: 0.01em;
}

:deep(.el-dialog__headerbtn) {
  top: 18px;
  right: 20px;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.18s ease;

  &:hover {
    background: rgb(241 245 249);
  }

  .el-dialog__close {
    font-size: 16px;
    color: $slate-400;
    font-weight: 700;
  }
}

:deep(.el-dialog__body) {
  padding: 200px 24px 24px;
}

:deep(.el-dialog__footer) {
  padding: 16px 24px 20px;
  border-top: 1px solid rgb(226 232 240 / 88%);
  background:
    linear-gradient(180deg, rgb(248 251 255) 0%, rgb(255 255 255 / 92%) 100%);
}

:deep(.el-upload-dragger) {
  border: 2px dashed rgb(203 213 225 / 80%);
  border-radius: 16px;
  background:
    linear-gradient(180deg, rgb(248 251 255) 0%, rgb(255 255 255) 100%);
  transition:
    border-color 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    border-color: $blue-300;
    background:
      linear-gradient(180deg, rgb(239 246 255) 0%, rgb(255 255 255) 100%);
    box-shadow: 0 0 0 6px rgb(59 130 246 / 6%);
  }

  .el-upload-dragger {
    border: none;
    background: transparent;
  }
}

:deep(.el-button) {
  height: 36px;
  padding: 0 18px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  transition:
    transform 0.15s ease,
    background 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease;

  &:hover {
    transform: translateY(-1px);
  }
}

:deep(.el-button--default) {
  border: 1px solid rgb(203 213 225 / 86%);
  background: linear-gradient(180deg, #ffffff 0%, $blue-50 100%);
  color: $slate-600;
  box-shadow: 0 1px 2px rgb(148 163 184 / 8%);

  &:hover {
    border-color: rgb(191 219 254 / 90%);
    background: linear-gradient(180deg, #ffffff 0%, $blue-100 100%);
    color: $slate-700;
    box-shadow: 0 4px 10px rgb(148 163 184 / 12%);
  }
}

:deep(.el-button--primary) {
  border: 1px solid $blue-400;
  background: linear-gradient(180deg, #60a5fa 0%, $blue-500 100%);
  color: #fff;
  box-shadow:
    0 2px 6px rgb(59 130 246 / 24%),
    0 1px 0 rgb(255 255 255 / 20%) inset;

  &:hover {
    border-color: $blue-500;
    background: linear-gradient(180deg, #3b82f6 0%, $blue-600 100%);
    box-shadow:
      0 4px 14px rgb(59 130 246 / 34%),
      0 1px 0 rgb(255 255 255 / 16%) inset;
  }

  &:active {
    transform: translateY(0);
  }
}

@media (width <= 640px) {
  :deep(.el-dialog) {
    width: 92% !important;
    border-radius: 16px;
  }

  :deep(.el-dialog__header) {
    padding: 14px 16px 12px;
  }

  :deep(.el-dialog__body) {
    padding: 14px 16px 16px;
  }

  :deep(.el-dialog__footer) {
    padding: 12px 16px 16px;
  }

  :deep(.el-upload-dragger) {
    border-radius: 12px;
  }
}
</style>
