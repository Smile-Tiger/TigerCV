<script setup>
import { storeToRefs } from 'pinia'
import { useWorkbenchStore } from '@/stores/workbench'

const { canvasBlocks } = storeToRefs(useWorkbenchStore())
</script>

<template>
  <el-main class="canvas-main">
    <div class="canvas-title">画布编辑区</div>

    <div class="canvas-shell">
      <div class="canvas-grid-bg" />

      <div class="canvas-stage">
        <el-card class="stage-header" shadow="never">页面结构预览（静态）</el-card>

        <el-card
          v-for="block in canvasBlocks"
          :key="block"
          class="stage-block"
          shadow="hover"
        >
          {{ block }}
        </el-card>

        <el-empty description="此区域仅展示基础画布框架，不包含拖拽逻辑" :image-size="88" />
      </div>
    </div>
  </el-main>
</template>

<style scoped>
.canvas-main {
  position: relative;
  padding: 16px;
  min-height: 0;
  background: linear-gradient(180deg, #eef3fa 0%, #e9eff8 100%);
  display: flex;
  flex-direction: column;
}

.canvas-title {
  margin-bottom: 14px;
  font-size: 14px;
  font-weight: 700;
  color: #1f2a40;
}

.canvas-shell {
  position: relative;
  flex: 1;
  min-height: 0;
  border: 1px solid #d3deec;
  border-radius: 12px;
  overflow: hidden;
  background: #f3f7fd;
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 70%);
}

.canvas-grid-bg {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(to right, rgb(143 156 177 / 20%) 1px, transparent 1px),
    linear-gradient(to bottom, rgb(143 156 177 / 20%) 1px, transparent 1px);
  background-size: 22px 22px;
}

.canvas-stage {
  position: relative;
  z-index: 1;
  width: min(780px, 100% - 28px);
  height: calc(100% - 28px);
  margin: 14px auto;
  padding: 16px;
  border-radius: 14px;
  background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
  border: 1px solid #e5ebf4;
  box-shadow:
    0 12px 28px rgb(20 27 45 / 12%),
    0 2px 6px rgb(20 27 45 / 7%);
  overflow: auto;
}

.stage-header {
  margin-bottom: 12px;
  background: #f6f8fd;
}

.stage-block {
  margin-bottom: 10px;
}
</style>
