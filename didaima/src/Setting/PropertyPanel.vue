<script setup>
import { storeToRefs } from 'pinia'
import { useWorkbenchStore } from '@/stores/workbench'

const { selectedComponentName } = storeToRefs(useWorkbenchStore())
</script>

<template>
  <el-aside class="panel panel-right" width="300px">
    <div class="panel-title">属性配置</div>

    <div class="panel-content">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="当前组件">
          <el-tag type="success">{{ selectedComponentName }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="组件名称">示例组件</el-descriptions-item>
        <el-descriptions-item label="组件宽度">100%</el-descriptions-item>
        <el-descriptions-item label="文字内容">这是静态占位字段</el-descriptions-item>
      </el-descriptions>

      <el-alert
        title="当前仅实现低代码平台基础框架展示"
        type="info"
        show-icon
        :closable="false"
      />
    </div>
  </el-aside>
</template>

<style scoped>
.panel {
  border-left: 1px solid #d9e0ea;
  background: linear-gradient(180deg, #f8fbff 0%, #f4f7fb 100%);
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.panel-title {
  padding: 14px 16px;
  font-size: 14px;
  font-weight: 700;
  color: #1f2a40;
  border-bottom: 1px solid #e5ebf3;
  background: rgb(255 255 255 / 86%);
  backdrop-filter: blur(3px);
}

.panel-content {
  flex: 1;
  min-height: 0;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: auto;
}
</style>
