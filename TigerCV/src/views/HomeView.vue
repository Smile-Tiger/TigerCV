<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const heroRef = ref<HTMLElement | null>(null)
const pointerX = ref(0)
const pointerY = ref(0)
const isHoveringHero = ref(false)
const isLoaded = ref(false)

const metrics = [
  { label: '模板风格', value: '3+' },
  { label: '实时预览', value: '100%' },
  { label: '编辑效率', value: '更快' },
] as const

const highlights = [
  'Markdown 轻量编辑',
  'A4 简历预览',
  '白灰蓝简约视觉',
] as const

const updatePointer = (event: PointerEvent) => {
  const el = heroRef.value
  if (!el) return

  const rect = el.getBoundingClientRect()
  pointerX.value = ((event.clientX - rect.left) / rect.width) * 100
  pointerY.value = ((event.clientY - rect.top) / rect.height) * 100
}

const handleHeroEnter = (event: PointerEvent) => {
  isHoveringHero.value = true
  updatePointer(event)
}

const handleHeroMove = (event: PointerEvent) => {
  if (!isHoveringHero.value) return
  updatePointer(event)
}

const handleHeroLeave = () => {
  isHoveringHero.value = false
}

const goToEditor = () => {
  router.push('/home/writeResume')
}

const backgroundStyle = computed(() => ({
  '--pointer-x': `${pointerX.value}%`,
  '--pointer-y': `${pointerY.value}%`,
}))

const onScroll = () => {
  const el = heroRef.value
  if (!el) return
  el.style.setProperty('--scroll-shift', `${window.scrollY * 0.02}px`)
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  requestAnimationFrame(() => {
    isLoaded.value = true
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <main class="home-page">
    <section
      ref="heroRef"
      class="hero-shell"
      :class="{ 'is-hovering': isHoveringHero, 'is-loaded': isLoaded }"
      :style="backgroundStyle"
      @pointerenter="handleHeroEnter"
      @pointermove="handleHeroMove"
      @pointerleave="handleHeroLeave"
    >
      <div class="hero-content">
        <div class="brand-block reveal-block delay-1">
          <div class="brand-copy">
            <p class="eyebrow">TigerCV</p>
            <h1>让简历编辑更轻、更快、更专业</h1>
            <p class="description">
              以 Markdown 驱动的简历编辑体验，实时预览、清爽布局、专业排版，让你的内容更聚焦在表达本身。
            </p>
          </div>
        </div>

        <div class="hero-actions reveal-block delay-2">
          <button class="primary-btn" type="button" @click="goToEditor">
            开始编辑
          </button>
          <button class="secondary-btn" type="button" @click="goToEditor">
            查看简历示例
          </button>
        </div>

        <div class="metrics-grid reveal-block delay-3" aria-label="产品指标">
          <article v-for="item in metrics" :key="item.label" class="metric-card">
            <span class="metric-value">{{ item.value }}</span>
            <span class="metric-label">{{ item.label }}</span>
          </article>
        </div>

        <div class="highlights-card reveal-block delay-4">
          <p class="section-title">核心能力</p>
          <ul>
            <li v-for="item in highlights" :key="item">{{ item }}</li>
          </ul>
        </div>
      </div>

      <aside class="showcase-panel reveal-block delay-5" aria-label="简历示例展示">
        <div class="showcase-header">
          <span class="showcase-dot dot-red"></span>
          <span class="showcase-dot dot-yellow"></span>
          <span class="showcase-dot dot-green"></span>
          <span class="showcase-title">简历示例预览</span>
        </div>

        <div class="showcase-card">
          <div class="sample-paper">
            <div class="paper-top">
              <div>
                <p class="paper-name">TigerCV 简历</p>
                <p class="paper-role">产品 / 前端 / 运营</p>
              </div>
            </div>

            <div class="paper-section">
              <h2>个人简介</h2>
              <p>
                专注于内容表达与结构化展示的简历编辑体验，支持快速输入、实时预览与高效排版。
              </p>
            </div>

            <div class="paper-section paper-columns">
              <div>
                <h3>技能亮点</h3>
                <p>Markdown · 组件化 · 预览联动</p>
              </div>
              <div>
                <h3>工作方式</h3>
                <p>简洁 · 清晰 · 专业 · 高效</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </section>
  </main>
</template>

<style scoped lang="scss">
@use '@/assets/colors.scss' as *;

.home-page {
  position: relative;
  z-index: 1;
  min-height: calc(100vh - 80px);
  padding: 24px 0 36px;
  overflow-y: auto;
  overflow-x: hidden;
  background: transparent;
}

.hero-shell {
  position: relative;
  width: min(1280px, calc(100vw - 40px));
  min-height: calc(100vh - 80px - 60px);
  margin: 0 auto;
  padding: 40px;
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(420px, 0.95fr);
  gap: 24px;
  overflow: hidden;
  border: 1px solid rgb(226 232 240 / 72%);
  border-radius: 32px;
  background:
    linear-gradient(135deg, rgb(255 255 255 / 62%) 0%, rgb(248 251 255 / 42%) 46%, rgb(240 245 252 / 58%) 100%);
  box-shadow:
    0 32px 90px rgb(148 163 184 / 16%),
    0 1px 0 rgb(255 255 255 / 82%) inset;
  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);
}

.hero-shell::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at var(--pointer-x, 30%) var(--pointer-y, 20%), rgb(59 130 246 / 12%), transparent 22%),
    linear-gradient(180deg, rgb(255 255 255 / 0%) 0%, rgb(255 255 255 / 10%) 100%);
  opacity: 0;
  transition: opacity 0.25s ease;
  pointer-events: none;
}

.hero-shell.is-loaded {
  animation: hero-rise 0.75s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.hero-shell.is-hovering::before {
  opacity: 1;
}

.hero-glow {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(18px);
  opacity: 0.9;
}

.hero-glow-left {
  top: -60px;
  left: -80px;
  width: 240px;
  height: 240px;

}

.hero-glow-right {
  right: -80px;
  bottom: -70px;
  width: 260px;
  height: 260px;
}

.hero-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 24px;
}

.reveal-block {
  opacity: 0;
  transform: translateY(16px);
  filter: blur(8px);
  animation: reveal-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

.delay-1 { animation-delay: 0.08s; }
.delay-2 { animation-delay: 0.16s; }
.delay-3 { animation-delay: 0.24s; }
.delay-4 { animation-delay: 0.32s; }
.delay-5 { animation-delay: 0.40s; }

.brand-block {
  display: flex;
  align-items: flex-start;
  gap: 0;
}

.brand-copy {
  max-width: 620px;
}

.eyebrow {
  margin: 0 0 10px;
  color: #2563eb;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  color: #0f172a;
  font-size: clamp(34px, 5vw, 58px);
  line-height: 1.04;
  letter-spacing: -0.04em;
}

.description {
  margin: 18px 0 0;
  max-width: 560px;
  color: #475569;
  font-size: 16px;
  line-height: 1.8;
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.primary-btn,
.secondary-btn {
  height: 48px;
  padding: 0 22px;
  border: 0;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease,
    color 0.2s ease;
}

.primary-btn {
  color: #eff6ff;
  background: linear-gradient(180deg, #3b82f6 0%, #2563eb 100%);
  box-shadow: 0 14px 30px rgb(37 99 235 / 22%);
}

.secondary-btn {
  color: #334155;
  background: linear-gradient(180deg, #ffffff 0%, #f6f9fc 100%);
  border: 1px solid rgb(226 232 240 / 92%);
  box-shadow: 0 1px 2px rgb(148 163 184 / 10%);
}

.primary-btn:hover,
.secondary-btn:hover {
  transform: translateY(-2px);
}

.primary-btn:hover {
  box-shadow: 0 18px 36px rgb(37 99 235 / 26%);
}

.secondary-btn:hover {
  background: linear-gradient(180deg, #ffffff 0%, #edf3fb 100%);
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.metric-card {
  padding: 18px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  border: 1px solid rgb(226 232 240 / 90%);
  border-radius: 18px;
  background: rgb(255 255 255 / 78%);
  box-shadow: 0 10px 26px rgb(148 163 184 / 10%);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.metric-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 16px 34px rgb(148 163 184 / 14%);
}

.metric-value {
  color: #1d4ed8;
  font-size: 26px;
  font-weight: 800;
}

.metric-label {
  color: #64748b;
  font-size: 13px;
}

.highlights-card {
  padding: 22px 22px 18px;
  border: 1px solid rgb(226 232 240 / 90%);
  border-radius: 20px;
  background: rgb(255 255 255 / 80%);
  box-shadow: 0 12px 28px rgb(148 163 184 / 10%);
}

.section-title {
  margin: 0 0 14px;
  color: #0f172a;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.highlights-card ul {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 10px;
}

.highlights-card li {
  position: relative;
  padding-left: 22px;
  color: #334155;
  font-size: 14px;
  line-height: 1.6;
}

.highlights-card li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.55em;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: linear-gradient(180deg, #93c5fd 0%, #2563eb 100%);
  box-shadow: 0 0 0 4px rgb(191 219 254 / 18%);
}

.showcase-panel {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0;
}

.showcase-header {
  height: 48px;
  padding: 0 18px;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid rgb(226 232 240 / 58%);
  border-bottom: 0;
  border-radius: 18px 18px 0 0;
  background: linear-gradient(180deg, rgb(255 255 255 / 60%) 0%, rgb(245 248 252 / 42%) 100%);
  box-shadow: 0 1px 0 rgb(255 255 255 / 68%) inset;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.showcase-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.dot-red {
  background: #fb7185;
}

.dot-yellow {
  background: #fbbf24;
}

.dot-green {
  background: #34d399;
}

.showcase-title {
  margin-left: 10px;
  color: #64748b;
  font-size: 13px;
  font-weight: 700;
}

.showcase-card {
  padding: 20px;
  border: 1px solid rgb(226 232 240 / 58%);
  border-top: 0;
  border-radius: 0 0 24px 24px;
  background:
    linear-gradient(180deg, rgb(248 251 255 / 58%) 0%, rgb(238 244 251 / 42%) 100%),
    rgb(255 255 255 / 42%);
  box-shadow: 0 24px 60px rgb(148 163 184 / 14%);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.showcase-header+.showcase-card {
  margin-top: -1px;
}

.sample-paper {
  min-height: 620px;
  padding: 28px;
  border-radius: 22px;
  background: rgb(255 255 255 / 72%);
  box-shadow: 0 18px 42px rgb(15 23 42 / 10%);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.paper-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
}

.paper-name {
  margin: 0;
  color: #0f172a;
  font-size: 22px;
  font-weight: 800;
}

.paper-role {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 13px;
}

.paper-section {
  padding: 18px 0;
  border-top: 1px solid rgb(226 232 240 / 80%);
}

.paper-section h2,
.paper-section h3 {
  margin: 0 0 10px;
  color: #0f172a;
}

.paper-section p {
  margin: 0;
  color: #475569;
  font-size: 14px;
  line-height: 1.8;
}

.paper-columns {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.hero-shell:hover .brand-mark {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 22px 44px rgb(37 99 235 / 26%);
}

.hero-shell:hover .metric-card {
  transform: translateY(-1px);
}

@media (max-width: 1180px) {
  .hero-shell {
    grid-template-columns: 1fr;
    padding: 28px;
    min-height: auto;
  }

  .showcase-panel {
    max-width: 760px;
  }
}

@media (max-width: 768px) {
  .home-page {
    padding: 16px 0 24px;
  }

  .hero-shell {
    width: calc(100vw - 24px);
    padding: 22px;
    border-radius: 24px;
    min-height: auto;
  }

  .brand-block {
    flex-direction: column;
  }

  .metrics-grid,
  .paper-columns {
    grid-template-columns: 1fr;
  }

  .sample-paper {
    min-height: auto;
    padding: 22px;
  }
}

@media (max-width: 520px) {
  h1 {
    font-size: 30px;
  }

  .description {
    font-size: 14px;
  }

  .hero-actions {
    gap: 10px;
  }

  .primary-btn,
  .secondary-btn {
    width: 100%;
  }
}

@keyframes hero-rise {
  from {
    opacity: 0;
    transform: translateY(16px) scale(0.992);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes reveal-up {
  from {
    opacity: 0;
    transform: translateY(16px);
    filter: blur(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}
</style>
