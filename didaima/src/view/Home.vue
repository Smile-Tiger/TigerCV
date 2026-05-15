<script setup>
import TopToolbar from '@/ToolBar/TopToolbar.vue'
import ComponentLibrary from '@/Component/ComponentLibrary.vue'
import CanvasEditor from '@/Editor/CanvasEditor.vue'
import PropertyPanel from '@/Setting/PropertyPanel.vue'
</script>

<template>
  <!-- 低代码平台单页面工作台：顶部工具栏 + 三栏主区域 -->
  <div class="workbench-page">
    <TopToolbar />

    <el-container class="workbench-body" direction="horizontal">
      <ComponentLibrary />
      <CanvasEditor />
      <PropertyPanel />
    </el-container>
  </div>
</template>

<style scoped>
.workbench-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background:
    radial-gradient(circle at 2% 20%, rgb(120 147 255 / 18%), transparent 18%),
    radial-gradient(circle at 98% 80%, rgb(123 218 255 / 12%), transparent 22%),
    #edf2f9;
}

.workbench-body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
</style>
