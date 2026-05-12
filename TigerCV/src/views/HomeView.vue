<template>
  <main class="home-page">
    <section class="hero-card">
      <p class="eyebrow">TigerCV</p>
      <h1>首页内容预留</h1>
      <p class="description">这里先作为首页占位，后续可以继续添加首页功能模块。</p>
      <el-button type="primary" size="large" @click="$router.push('/home/writeResume')">
        开始编写简历
      </el-button>
    </section>
  </main>
</template>

<style scoped lang="scss">
@use '@/assets/colors.scss' as *;

.home-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 32px;
  background: linear-gradient(135deg, $blue-50 0%, #f8fbff 48%, #edf7f3 100%);
}

.home-page>* {
  width: 1600px;
  max-width: 100%;
}

.hero-card {
  width: min(680px, 100%);
  padding: 56px;
  border-radius: 28px;
  background: $color-bg-white;
  box-shadow: 0 24px 80px $shadow-color-dark;
  text-align: center;
  backdrop-filter: blur(12px);
}

.eyebrow {
  margin: 0 0 10px;
  color: $color-primary-light;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  color: $color-text-primary;
  font-size: 42px;
}

.description {
  margin: 18px 0 30px;
  color: $color-text-secondary;
  font-size: 16px;
}
</style>
