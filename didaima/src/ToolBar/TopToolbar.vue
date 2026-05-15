<template>
  <el-header class="top-toolbar">
    <div class="left-area">
      <div class="brand-dot" />
      <h1>Tiger Low Code</h1>
    </div>

    <div class="right-area">
      <el-button type="primary" plain>预览</el-button>
      <el-button type="success">发布</el-button>
    </div>
  </el-header>
</template>

<style scoped>
.top-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  border-bottom: 1px solid rgb(255 255 255 / 12%);
  background:
    radial-gradient(circle at 12% 20%, rgb(58 93 255 / 24%), transparent 35%),
    linear-gradient(92deg, #101827 0%, #172135 45%, #1f2940 100%);
  box-shadow: 0 6px 20px rgb(11 18 32 / 26%);
}

.left-area {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #f2f6ff;
}

.left-area h1 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.6px;
}

.brand-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #67c23a;
  box-shadow:
    0 0 0 5px rgb(103 194 58 / 18%),
    0 0 12px rgb(103 194 58 / 45%);
}

.right-area {
  display: flex;
  gap: 10px;
}
</style>
