<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { EditorSelection, EditorState } from '@codemirror/state'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { markdown as markdownLanguage } from '@codemirror/lang-markdown'
import {
  EditorView,
  drawSelection,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
  placeholder,
} from '@codemirror/view'
import { ElMessage } from 'element-plus'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const markdown = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value),
})

const editorRootRef = ref<HTMLDivElement | null>(null)
const editorViewRef = ref<EditorView | null>(null)

const MAX_IMAGE_SIZE = 5 * 1024 * 1024

const uploadDialogVisible = ref(false)
const uploadFiles = ref<any[]>([])
const imageStore = new Map<string, { file: File; objectUrl: string }>()

watch(markdown, (val) => {
  const view = editorViewRef.value
  if (!view) return

  const currentDoc = view.state.doc.toString()
  if (currentDoc === val) return

  const selection = view.state.selection.main
  view.dispatch({
    changes: { from: 0, to: currentDoc.length, insert: val },
    selection: EditorSelection.range(
      Math.min(selection.anchor, val.length),
      Math.min(selection.head, val.length),
    ),
  })
})

const getSelection = () => {
  const view = editorViewRef.value
  if (!view) return { view: null, start: 0, end: 0 }

  const selection = view.state.selection.main
  return {
    view,
    start: selection.from,
    end: selection.to,
  }
}

const applyEditorChange = (
  from: number,
  to: number,
  insert: string,
  selection: { anchor: number; head?: number },
) => {
  const view = editorViewRef.value
  if (!view) return

  view.dispatch({
    changes: { from, to, insert },
    selection:
      selection.head === undefined || selection.head === selection.anchor
        ? EditorSelection.cursor(selection.anchor)
        : EditorSelection.range(selection.anchor, selection.head),
    scrollIntoView: true,
  })

  view.focus()
}

const replaceSelection = (before: string, after = '', placeholderText = '') => {
  const { view, start, end } = getSelection()
  if (!view) return

  const selectedText = view.state.sliceDoc(start, end)
  const insertContent = selectedText
    ? `${before}${selectedText}${after}`
    : `${before}${placeholderText}${after}`

  const anchor = start + before.length
  const head = selectedText ? anchor + selectedText.length : anchor + placeholderText.length
  applyEditorChange(start, end, insertContent, { anchor, head })
}

const toggleDelimitedText = (marker: string) => {
  const { view, start, end } = getSelection()
  if (!view) return

  const selectedText = view.state.sliceDoc(start, end)
  if (start !== end) {
    const isWrapped = selectedText.startsWith(marker) && selectedText.endsWith(marker)
    const nextText = isWrapped
      ? selectedText.slice(marker.length, -marker.length)
      : `${marker}${selectedText}${marker}`

    const nextStart = isWrapped ? start : start + marker.length
    const nextEnd = isWrapped ? start + nextText.length : start + marker.length + selectedText.length
    applyEditorChange(start, end, nextText, { anchor: nextStart, head: nextEnd })
    return
  }

  const current = view.state.doc.toString()
  const beforeText = current.slice(Math.max(0, start - marker.length), start)
  const afterText = current.slice(start, start + marker.length)

  if (beforeText === marker && afterText === marker) {
    applyEditorChange(start - marker.length, start + marker.length, '', {
      anchor: start - marker.length,
    })
    return
  }

  applyEditorChange(start, end, `${marker}${marker}`, {
    anchor: start + marker.length,
  })
}

const wrapSelection = (prefix: string, suffix = prefix) => {
  if (prefix === suffix) {
    toggleDelimitedText(prefix)
    return
  }

  replaceSelection(prefix, suffix)
}

const toggleLink = () => {
  const { view, start, end } = getSelection()
  if (!view) return

  const insertText = `[Link](https://)`
  const current = view.state.doc.toString()
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

  applyEditorChange(insertPos, insertPos, insertText, {
    anchor: insertPos + 1,
    head: insertPos + 5,
  })
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
  const { view, start } = getSelection()
  if (!view) return

  const mdImage = `![${fileName}](${objectUrl}){width=300 height=400}`
  applyEditorChange(start, start, `${mdImage}\n`, {
    anchor: start + mdImage.length + 1,
  })

  ElMessage.success('图片已插入')
  uploadDialogVisible.value = false
}

const createEditor = () => {
  const mount = editorRootRef.value
  if (!mount) return

  editorViewRef.value = new EditorView({
    parent: mount,
    state: EditorState.create({
      doc: markdown.value,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        history(),
        drawSelection(),
        EditorView.lineWrapping,
        EditorView.contentAttributes.of({
          spellcheck: 'false',
          'aria-label': 'Markdown editor',
        }),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        markdownLanguage(),
        highlightActiveLine(),
        placeholder('开始编辑你的简历吧'),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const nextDoc = update.state.doc.toString()
            if (markdown.value !== nextDoc) {
              markdown.value = nextDoc
            }
          }
        }),
      ],
    }),
  })
}

onMounted(() => {
  createEditor()
})

onBeforeUnmount(() => {
  editorViewRef.value?.destroy()
  editorViewRef.value = null

  for (const { objectUrl } of imageStore.values()) {
    URL.revokeObjectURL(objectUrl)
  }
  imageStore.clear()
})
</script>

<template>
  <div class="editor-panel-body">
    <div class="editor-topbar">
      <span class="dot dot-red"></span>
      <span class="dot dot-yellow"></span>
      <span class="dot dot-green"></span>
      <span class="editor-tip"><strong>MD</strong></span>
      <button class="tool-btn" type="button" title="Bold" @mousedown.prevent @click="wrapSelection('**')">
        <strong>B</strong>
      </button>
      <button class="tool-btn" type="button" title="Italic" @mousedown.prevent @click="wrapSelection('*')">
        <em>/</em>
      </button>
      <button class="tool-btn" type="button" title="Insert Link" @mousedown.prevent @click="toggleLink">
        <el-icon>
          <EpPaperclip />
        </el-icon>
      </button>
      <button class="tool-btn" type="button" title="Insert Image" @mousedown.prevent @click="openUploadDialog">
        <el-icon>
          <EpPicture />
        </el-icon>
      </button>
    </div>

    <div class="editor-shell">
      <div class="editor-canvas">
        <div ref="editorRootRef" class="editor"></div>
      </div>
    </div>
  </div>

  <el-dialog v-model="uploadDialogVisible" title="上传图片" width="520px" :close-on-click-modal="false" destroy-on-close>
    <el-upload
      v-model:file-list="uploadFiles"
      drag
      :auto-upload="false"
      :limit="1"
      :on-exceed="handleUploadExceed"
      :accept="'.jpg,.jpeg,.png,.gif,.webp,.bmp'"
      list-type="picture"
    >
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

.editor-panel-body {
  height: 100%;
  display: flex;
  flex-direction: column;
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
  overflow: hidden;
  background: linear-gradient(180deg, $blue-50 0%, #eef3f9 100%);

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    box-shadow: 0 0 0 1px rgb(255 255 255 / 60%) inset;
  }
}

.editor-canvas {
  position: relative;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #ffffff 0%, #f9fbff 100%);

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
}

.editor :deep(.cm-editor) {
  height: 100%;
  border: 0;
  background:
    linear-gradient(180deg, rgb(255 255 255 / 92%), rgb(248 251 255 / 98%)),
    transparent;
  color: $slate-700;
  font-size: 15px;
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 80%);
  @include mono-font;
}

.editor :deep(.cm-focused) {
  outline: none;
}

.editor :deep(.cm-scroller) {
  overflow: auto;
  line-height: 1.8;
  @include hidden-scrollbar;
}

.editor :deep(.cm-content),
.editor :deep(.cm-gutter) {
  min-height: 100%;
  padding-top: 0;
  padding-bottom: 0;
}

.editor :deep(.cm-content) {
  caret-color: #60a5fa;
}

.editor :deep(.cm-line) {
  padding: 0 24px;
}

.editor :deep(.cm-gutters) {
  border-right: 1px solid rgb(203 213 225 / 70%);
  background: linear-gradient(180deg, $blue-50 0%, #eef3f9 100%);
  color: $slate-400;
  box-shadow: inset -1px 0 0 rgb(255 255 255 / 70%);
  @include mono-font;
}

.editor :deep(.cm-lineNumbers .cm-gutterElement) {
  min-width: 2.4rem;
  padding: 0 12px 0 0;
  height: calc(1em * 1.8);
  align-items: center;
  justify-content: flex-end;
}

.editor :deep(.cm-selectionBackground) {
  background: rgb(191 219 254 / 42%) !important;
}

.editor :deep(.cm-content ::selection) {
  background: rgb(191 219 254 / 42%);
  color: #0f172a;
}

.editor :deep(.cm-cursor) {
  border-left-color: #60a5fa;
}

.editor :deep(.cm-placeholder) {
  color: $slate-400;
}

.editor :deep(.cm-activeLine) {
  background: transparent;
  transition: background 0.16s ease;
}

.editor :deep(.cm-focused .cm-activeLine) {
  background: rgb(219 234 254 / 52%);
}

.editor :deep(.cm-activeLineGutter) {
  background: transparent;
  color: $slate-400;
  transition:
    background 0.16s ease,
    color 0.16s ease;
}

.editor :deep(.cm-focused .cm-activeLineGutter) {
  background: rgb(219 234 254 / 42%);
  color: $blue-600;
  font-weight: 700;
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
  padding: 20px 24px 24px;
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
