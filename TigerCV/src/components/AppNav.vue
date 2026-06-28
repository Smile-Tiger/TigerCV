<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useResumeStore } from '@/stores/resume'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const route = useRoute()
const resumeStore = useResumeStore()

const actionsVisible = ref(route.path === '/home/writeResume')

watch(
  () => route.path,
  (path) => {
    actionsVisible.value = path === '/home/writeResume'
  },
)

const handleSave = () => {
  resumeStore.saveToLocal()
  ElMessage.success('已保存到本地')
}

const capturePaper = async () => {
  const paper = document.querySelector('.preview-paper') as HTMLElement | null
  if (!paper) {
    ElMessage.error('未找到简历预览内容')
    return null
  }

  return html2canvas(paper, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
  })
}

const handleExportMD = () => {
  resumeStore.exportMarkdown()
  ElMessage.success('Markdown 已导出')
}

const handleExportPDF = async () => {
  const canvas = await capturePaper()
  if (!canvas) return

  const imgWidth = 210
  const imgHeight = (canvas.height * imgWidth) / canvas.width
  const pdf = new jsPDF('p', 'mm', 'a4')
  pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight, undefined, 'FAST')
  pdf.save(`resume-${Date.now()}.pdf`)
  ElMessage.success('PDF 已导出')
}

const exportItems = [
  { label: 'PDF', handler: handleExportPDF },
  { label: 'MD', handler: handleExportMD },
] as const

const navItems = [
  { label: '首页', to: '/home' },
  { label: '简历', to: '/home/writeResume' },
] as const

const showEditorTools = computed(() => actionsVisible.value)
</script>

<template>
  <header class="app-nav">
    <div class="nav-container app-nav-inner">
      <div class="nav-primary">
        <RouterLink class="nav-brand" to="/home" aria-label="TigerCV 首页">
          <div class="eyebrow">TigerCV</div>
        </RouterLink>

        <nav class="nav-links" aria-label="主导航">
          <RouterLink v-for="item in navItems" :key="item.to" class="nav-link" :to="item.to">
            <span>{{ item.label }}</span>
          </RouterLink>
        </nav>
      </div>

      <div class="nav-secondary">
        <div class="nav-actions" :class="{ 'is-visible': showEditorTools }">
          <button class="action-btn action-btn--save" type="button" @click="handleSave">
            <el-icon>
              <EpCheck />
            </el-icon>
            <span>保存</span>
          </button>

          <el-dropdown trigger="hover" placement="bottom-end" popper-class="export-dropdown-popper">
            <button class="action-btn action-btn--export" type="button">
              <el-icon>
                <EpDownload />
              </el-icon>
              <span>导出</span>
              <el-icon class="arrow-icon">
                <EpArrowDown />
              </el-icon>
            </button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-for="item in exportItems" :key="item.label" @click="item.handler">
                  <span>{{ item.label }}</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>

        <button class="login-btn" type="button">
          登录
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped lang="scss">
@use '@/assets/colors.scss' as *;

.app-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: 64px;
  border-bottom: 1px solid rgb(255 255 255 / 40%);
  background: rgb(255 255 255 / 15%);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow: 0 4px 30px rgb(0 0 0 / 10%);
}

.app-nav-inner {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.nav-primary,
.nav-secondary {
  display: flex;
  align-items: center;
}

.nav-primary {
  gap: 28px;
  min-width: 0;
}

.nav-secondary {
  margin-left: auto;
  gap: 14px;
}

.nav-brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: $color-primary;
  text-decoration: none;
  flex-shrink: 0;
}

.eyebrow {
  margin: 0;
  color: #2563eb;
  font-size: 20px;
  font-weight: 800;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  line-height: 1;
}

.nav-links {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 0;
  opacity: 0;
  overflow: hidden;
  transition:
    max-width 0.3s ease,
    opacity 0.25s ease,
    margin-right 0.3s ease;

  &.is-visible {
    max-width: 300px;
    opacity: 1;
    overflow: visible;
  }
}

.action-btn,
.login-btn {
  height: 36px;
  padding: 0 14px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid rgb(203 213 225 / 80%);
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition:
    transform 0.16s ease,
    background 0.16s ease,
    border-color 0.16s ease,
    box-shadow 0.16s ease,
    color 0.16s ease;

  &:hover {
    transform: translateY(-1px);
  }
}

.action-btn {
  .el-icon {
    font-size: 16px;
  }
}

.login-btn {
  min-width: 80px;
  justify-content: center;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  color: $slate-700;
  box-shadow: 0 1px 2px rgb(148 163 184 / 10%);

  &:hover {
    border-color: rgb(191 219 254 / 90%);
    color: $blue-600;
    box-shadow: 0 4px 12px rgb(148 163 184 / 14%);
  }
}

.arrow-icon {
  font-size: 12px !important;
  margin-left: -2px;
  transition: transform 0.2s ease;

  .action-btn--export:hover & {
    transform: rotate(180deg);
  }
}

.action-btn--save {
  background: linear-gradient(180deg, #ffffff 0%, $blue-50 100%);
  color: $slate-600;

  &:hover {
    border-color: rgb(191 219 254 / 90%);
    background: linear-gradient(180deg, #ffffff 0%, $blue-100 100%);
    color: $slate-700;
    box-shadow: 0 4px 10px rgb(148 163 184 / 12%);
  }
}

.action-btn--export {
  background: linear-gradient(180deg, #60a5fa 0%, $blue-500 100%);
  border-color: $blue-400;
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
}

.nav-link {
  min-width: 60px;
  height: 36px;
  padding: 0 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: transparent;
  color: $slate-600;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition:
    background 0.16s ease,
    color 0.16s ease,
    transform 0.16s ease;

  &:hover {
    background: $slate-200;
    color: $slate-900;
    transform: translateY(-1px);
  }

  &.router-link-active {
    background: $blue-200;
    color: $color-primary;
    font-weight: 600;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .app-nav-inner {
    gap: 12px;
  }

  .nav-primary {
    gap: 14px;
  }

  .eyebrow {
    font-size: 18px;
    letter-spacing: 0.16em;
  }

  .nav-links {
    gap: 8px;
  }

  .nav-link {
    min-width: auto;
    padding: 0 12px;
  }

  .login-btn {
    min-width: 68px;
    padding: 0 12px;
  }
}

@media (max-width: 640px) {
  .app-nav {
    height: auto;
  }

  .app-nav-inner {
    min-height: 64px;
    padding-top: 10px;
    padding-bottom: 10px;
    flex-wrap: wrap;
  }

  .nav-primary,
  .nav-secondary {
    width: 100%;
  }

  .nav-primary {
    justify-content: space-between;
  }

  .nav-secondary {
    justify-content: flex-end;
  }
}
</style>

<style lang="scss">
@use '@/assets/colors.scss' as *;

.export-dropdown-popper {
  margin-top: 6px !important;
  border-radius: 12px !important;
  border: 1px solid rgb(226 232 240 / 92%) !important;
  background: rgb(255 255 255 / 96%) !important;
  box-shadow:
    0 12px 40px rgb(15 23 42 / 14%),
    0 1px 0 rgb(255 255 255 / 88%) inset !important;
  backdrop-filter: blur(16px);
  padding: 4px !important;

  .el-dropdown-menu__item {
    padding: 0 12px;
    height: 36px;
    border-radius: 8px;
    color: $slate-600;
    font-size: 13px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
    transition:
      background 0.15s ease,
      color 0.15s ease;

    .el-icon {
      font-size: 16px;
      color: $slate-400;
      transition: color 0.15s ease;
    }

    &:hover {
      background: $blue-50;
      color: $blue-600;

      .el-icon {
        color: $blue-500;
      }
    }
  }
}
</style>
