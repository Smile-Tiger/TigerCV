<script setup lang="ts">
const navItems = [
  { label: '首页', to: '/home' },
  { label: '简历', to: '/home/writeResume' },
] as const
</script>

<template>
  <header class="app-nav">
    <div class="nav-container app-nav-inner">
      <RouterLink class="nav-brand" to="/home" aria-label="TigerCV 首页">
        <div class="eyebrow">TigerCV</div>
      </RouterLink>

      <nav class="nav-links" aria-label="主导航">
        <RouterLink v-for="item in navItems" :key="item.to" class="nav-link" :to="item.to">
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>
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
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
}

.app-nav-inner {
  height: 100%;
  justify-content: center;
  display: flex;
  align-items: center;
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
  margin-left: auto;
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

@media (max-width: 980px) {
  .nav-links {
    gap: 8px;
  }
}

@media (max-width: 640px) {
  .nav-link {
    min-width: 52px;
    padding: 0 10px;
    font-size: 13px;
  }
}
</style>
