import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

const STORAGE_KEY = 'tigercv-resume-markdown'

export const useResumeStore = defineStore('resume', () => {
  const markdown = ref(localStorage.getItem(STORAGE_KEY) || '')

  watch(markdown, (val) => {
    localStorage.setItem(STORAGE_KEY, val)
  })

  function setMarkdown(val: string) {
    markdown.value = val
  }

  function saveToLocal() {
    localStorage.setItem(STORAGE_KEY, markdown.value)
  }

  function exportMarkdown() {
    const blob = new Blob([markdown.value], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `resume-${Date.now()}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return { markdown, setMarkdown, saveToLocal, exportMarkdown }
})
