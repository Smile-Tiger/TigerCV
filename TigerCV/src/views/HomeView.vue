<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const heroRef = ref<HTMLElement | null>(null)
const pointerX = ref(0)
const pointerY = ref(0)
const isHoveringHero = ref(false)
const isLoaded = ref(false)
const typedFeatureText = ref('')
const activeFeatureIndex = ref(0)
const isDeletingFeatureText = ref(false)

const currentYear = new Date().getFullYear()

const metrics = [
  { label: '模板风格', value: '3+' },
  { label: '实时预览', value: '100%' },
  { label: '编辑效率', value: '更快' },
] as const

const highlights = [
  'Markdown 轻量编辑',
  'A4 简历预览',
  '蓝灰极简视觉',
] as const

const whyFeatureMessages = [
  'AI 简历编辑：把经历整理、亮点润色和结构重组压缩进同一条工作流。',
  'Markdown 轻量编辑：专注内容输入本身，同时保持所见即所得的实时预览。',
  '简历优化：围绕岗位关键词、表达密度和项目成果，给出更可执行的改写建议。',
  '简历评分：从完整度、匹配度和说服力三个维度，快速判断当前版本质量。',
] as const

const whyFeatureDetails = [
  {
    index: '01',
    title: 'AI 简历编辑',
    body: '帮助你快速整理经历、提炼亮点，并把零散内容改写成更专业的简历表达。',
  },
  {
    index: '02',
    title: 'Markdown 轻量编辑',
    body: '保留纯文本写作的流畅感，让排版、预览和输出保持同步，不被复杂工具打断。',
  },
  {
    index: '03',
    title: '简历优化',
    body: '针对岗位目标调整措辞、结构和成果呈现，让内容更聚焦、更有招聘语境。',
  },
  {
    index: '04',
    title: '简历评分',
    body: '快速判断版本完成度与竞争力，找到还能继续打磨的重点区域。',
  },
] as const

const footerNavLinks = [
  { label: '首页', href: '/home' },
  { label: '简历编辑', href: '/home/writeResume' },
  { label: '功能亮点', href: '#why-choose-tigercv' },
  { label: '示例预览', href: '#home-showcase' },
] as const

const footerFeatureLinks = [
  { label: 'AI 简历编辑' },
  { label: 'Markdown 轻量编辑' },
  { label: '简历优化建议' },
  { label: '简历评分反馈' },
] as const

const footerContacts = [
  { label: 'GitHub', value: 'github.com/tigercv', href: 'https://github.com/tigercv' },
  { label: '联系邮箱', value: 'hello@tigercv.app', href: 'mailto:hello@tigercv.app' },
  { label: '商务合作', value: '+86 400-000-0000', href: 'tel:+864000000000' },
] as const

let typingTimer: ReturnType<typeof window.setTimeout> | null = null

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

const queueTypewriterTick = (delay: number) => {
  if (typingTimer) {
    window.clearTimeout(typingTimer)
  }

  typingTimer = window.setTimeout(runTypewriterTick, delay)
}

const runTypewriterTick = () => {
  const currentMessage = whyFeatureMessages[activeFeatureIndex.value] ?? ''

  if (!isDeletingFeatureText.value) {
    typedFeatureText.value = currentMessage.slice(0, typedFeatureText.value.length + 1)

    if (typedFeatureText.value === currentMessage) {
      isDeletingFeatureText.value = true
      queueTypewriterTick(1600)
      return
    }

    queueTypewriterTick(68)
    return
  }

  typedFeatureText.value = currentMessage.slice(0, Math.max(typedFeatureText.value.length - 1, 0))

  if (typedFeatureText.value.length === 0) {
    isDeletingFeatureText.value = false
    activeFeatureIndex.value = (activeFeatureIndex.value + 1) % whyFeatureMessages.length
    queueTypewriterTick(240)
    return
  }

  queueTypewriterTick(34)
}

const onScroll = () => {
  const el = heroRef.value
  if (!el) return
  el.style.setProperty('--scroll-shift', `${window.scrollY * 0.02}px`)
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  requestAnimationFrame(() => {
    isLoaded.value = true
  })
  queueTypewriterTick(420)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  if (typingTimer) {
    window.clearTimeout(typingTimer)
  }
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
              以 Markdown 驱动的简历编辑体验，融合实时预览、清爽布局与专业排版，让内容表达本身更清晰。
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

      <aside id="home-showcase" class="showcase-panel reveal-block delay-5" aria-label="简历示例展示">
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
                <p>Markdown / 组件化 / 预览联动</p>
              </div>
              <div>
                <h3>工作方式</h3>
                <p>简洁 / 清晰 / 专业 / 高效</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </section>

    <section class="why-shell" aria-labelledby="why-choose-tigercv">
      <div class="why-heading">
        <p class="section-eyebrow">Why TigerCV</p>
        <h2 id="why-choose-tigercv" class="why-title">为什么选择 TigerCV</h2>
        <p class="why-description">
          TigerCV 把写作、优化、评估和导出串成一条连续工作流，让每一次简历迭代都更轻、更准、更有方向。
        </p>
      </div>

      <div class="typewriter-stage" aria-live="polite">
        <span class="typewriter-label">核心功能持续展示中</span>
        <p class="typewriter-line">
          <span class="typewriter-copy">
            <span class="typewriter-text">{{ typedFeatureText }}</span>
            <span class="typewriter-caret" aria-hidden="true"></span>
          </span>
        </p>
      </div>

      <div class="why-feature-grid">
        <article v-for="item in whyFeatureDetails" :key="item.index" class="why-feature">
          <span class="why-feature-index">{{ item.index }}</span>
          <h3>{{ item.title }}</h3>
          <p>{{ item.body }}</p>
        </article>
      </div>
    </section>

    <footer class="site-footer">
      <div class="footer-shell">
        <section class="footer-brand">
          <p class="footer-mark">TigerCV</p>
          <h2>把简历写作、优化与输出整理成更顺手的一条线。</h2>
          <p class="footer-copy">
            保留清晰、轻量、好维护的页脚结构，你可以直接把这里替换成个人站点或企业官网的真实信息。
          </p>
        </section>

        <nav class="footer-column" aria-label="页脚导航">
          <p class="footer-heading">导航</p>
          <ul class="footer-menu-list">
            <li v-for="item in footerNavLinks" :key="item.label">
              <a :href="item.href" class="footer-menu-link">{{ item.label }}</a>
            </li>
          </ul>
        </nav>

        <section class="footer-column" aria-label="功能概览">
          <p class="footer-heading">功能</p>
          <ul class="footer-menu-list">
            <li v-for="item in footerFeatureLinks" :key="item.label">
              <span class="footer-menu-text">{{ item.label }}</span>
            </li>
          </ul>
        </section>

        <section class="footer-contact" aria-label="联系方式">
          <p class="footer-heading">联系方式</p>
          <ul class="footer-contact-list">
            <li v-for="item in footerContacts" :key="item.label" class="footer-contact-item">
              <span class="footer-contact-label">{{ item.label }}</span>
              <a :href="item.href" class="footer-contact-value" target="_blank" rel="noreferrer">
                {{ item.value }}
              </a>
            </li>
          </ul>
        </section>
      </div>

      <div class="footer-bottom">
        <span>© {{ currentYear }} TigerCV. All rights reserved.</span>
      </div>
    </footer>
  </main>
</template>

<style scoped lang="scss">
@use '@/assets/colors.scss' as *;

.home-page {
  position: relative;
  z-index: 1;
  min-height: calc(100vh - 80px);
  padding: 24px 0 0;
  display: flex;
  flex-direction: column;
  gap: 56px;
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
.delay-5 { animation-delay: 0.4s; }

.brand-block {
  display: flex;
  align-items: flex-start;
  gap: 0;
}

.brand-copy {
  max-width: 620px;
}

.eyebrow,
.section-eyebrow,
.footer-mark {
  margin: 0;
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

.showcase-header + .showcase-card {
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

.why-shell {
  position: relative;
  width: min(1280px, calc(100vw - 40px));
  margin: 0 auto;
  padding: 24px 40px 0;
  display: grid;
  gap: 34px;
}

.why-shell::before {
  content: '';
  position: absolute;
  left: 10%;
  right: 10%;
  top: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgb(148 163 184 / 55%), transparent);
}

.why-shell::after {
  content: '';
  position: absolute;
  right: 2%;
  top: 14px;
  width: 340px;
  height: 340px;
  border-radius: 50%;
  background: radial-gradient(circle, rgb(96 165 250 / 20%) 0%, transparent 68%);
  filter: blur(52px);
  pointer-events: none;
}

.why-heading,
.typewriter-stage {
  position: relative;
  z-index: 1;
}

.why-heading {
  max-width: 760px;
  margin: 0 auto;
  display: grid;
  gap: 14px;
  text-align: center;
}

.why-title {
  margin: 0;
  color: #0f172a;
  font-size: clamp(32px, 4vw, 48px);
  line-height: 1.08;
  letter-spacing: -0.04em;
}

.why-description {
  margin: 0;
  color: #475569;
  font-size: 16px;
  line-height: 1.85;
}

.typewriter-stage {
  width: min(920px, 100%);
  margin: 0 auto;
  display: grid;
  justify-items: center;
  gap: 14px;
}

.typewriter-label {
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.24em;
  text-transform: uppercase;
}

.typewriter-line {
  width: 100%;
  height: clamp(148px, 16vw, 184px);
  margin: 0;
  display: grid;
  place-items: center;
  overflow: hidden;
  text-align: center;
}

.typewriter-copy {
  max-width: min(760px, 100%);
  display: inline-flex;
  align-items: flex-end;
  justify-content: center;
  gap: 8px;
}

.typewriter-text {
  display: block;
  color: transparent;
  font-size: clamp(25px, 3.6vw, 42px);
  line-height: 1.42;
  letter-spacing: -0.04em;
  text-wrap: balance;
  background: linear-gradient(180deg, #0f172a 0%, #2563eb 135%);
  -webkit-background-clip: text;
  background-clip: text;
}

.typewriter-caret {
  width: 3px;
  height: 1.08em;
  display: inline-block;
  flex: 0 0 auto;
  border-radius: 999px;
  background: linear-gradient(180deg, #93c5fd 0%, #2563eb 100%);
  box-shadow: 0 0 0 6px rgb(191 219 254 / 18%);
  animation: caret-blink 0.95s steps(1) infinite;
}

.why-feature-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 24px;
}

.why-feature {
  padding-top: 18px;
  border-top: 1px solid rgb(191 219 254 / 72%);
}

.why-feature-index {
  display: inline-block;
  margin-bottom: 12px;
  color: #60a5fa;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.16em;
}

.why-feature h3 {
  margin: 0 0 10px;
  color: #0f172a;
  font-size: 18px;
}

.why-feature p {
  margin: 0;
  color: #475569;
  font-size: 14px;
  line-height: 1.85;
}

.site-footer {
  padding: 34px 0 20px;
  border-top: 1px solid rgb(226 232 240 / 88%);
  background: linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%);
}

.footer-shell,
.footer-bottom {
  width: min(1280px, calc(100vw - 40px));
  margin: 0 auto;
}

.footer-shell {
  padding-top: 18px;
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) repeat(3, minmax(0, 0.8fr));
  gap: 28px;
}

.footer-brand h2 {
  margin: 12px 0 10px;
  color: #0f172a;
  font-size: clamp(22px, 2.6vw, 28px);
  line-height: 1.22;
  letter-spacing: -0.03em;
}

.footer-copy {
  margin: 0;
  color: #64748b;
  font-size: 14px;
  line-height: 1.85;
}

.footer-heading {
  margin: 0 0 16px;
  color: #0f172a;
  font-size: 15px;
  font-weight: 700;
}

.footer-column,
.footer-contact {
  min-width: 0;
}

.footer-menu-list,
.footer-contact-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 12px;
}

.footer-menu-link,
.footer-menu-text,
.footer-contact-value {
  color: #475569;
  font-size: 15px;
  line-height: 1.75;
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer-menu-link:hover,
.footer-contact-value:hover {
  color: #2563eb;
}

.footer-contact-item {
  display: grid;
  gap: 4px;
}

.footer-contact-label {
  color: #94a3b8;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.footer-bottom {
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid rgb(203 213 225 / 72%);
  text-align: center;
  color: #64748b;
  font-size: 14px;
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
    width: min(100%, 760px);
    justify-self: center;
  }

  .why-feature-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .footer-shell {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .footer-brand {
    grid-column: 1 / -1;
  }
}

@media (max-width: 768px) {
  .home-page {
    padding: 16px 0 0;
    gap: 40px;
  }

  .hero-shell,
  .why-shell,
  .footer-shell,
  .footer-bottom {
    width: calc(100vw - 24px);
  }

  .hero-shell {
    padding: 22px;
    border-radius: 24px;
    min-height: auto;
  }

  .why-shell {
    padding: 20px 0 0;
    gap: 28px;
  }

  .brand-block {
    flex-direction: column;
  }

  .metrics-grid,
  .paper-columns,
  .why-feature-grid,
  .footer-shell {
    grid-template-columns: 1fr;
  }

  .sample-paper {
    min-height: auto;
    padding: 22px;
  }

  .typewriter-line {
    height: 176px;
  }
}

@media (max-width: 520px) {
  h1 {
    font-size: 30px;
  }

  .description,
  .why-description {
    font-size: 14px;
  }

  .hero-actions {
    gap: 10px;
  }

  .primary-btn,
  .secondary-btn {
    width: 100%;
  }

  .typewriter-line {
    height: 210px;
  }

  .typewriter-copy {
    gap: 6px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-shell.is-loaded,
  .reveal-block {
    animation: none;
    opacity: 1;
    transform: none;
    filter: none;
  }

  .typewriter-caret {
    animation: none;
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

@keyframes caret-blink {
  0%,
  49% {
    opacity: 1;
  }

  50%,
  100% {
    opacity: 0;
  }
}
</style>
