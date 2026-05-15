<script setup>
import { storeToRefs } from 'pinia'
import { useWorkbenchStore } from '@/stores/workbench'

const workbenchStore = useWorkbenchStore()
const { materialGroups, selectedComponentName } = storeToRefs(workbenchStore)
const { setSelectedComponent } = workbenchStore
</script>

<template>
  <el-aside class="panel panel-left" width="280px">
    <div class="panel-title">组件库</div>

    <div class="panel-scroll">
      <el-scrollbar height="100%">
        <div class="material-wrapper">
          <el-card
            v-for="group in materialGroups"
            :key="group.title"
            class="group-card"
            shadow="hover"
          >
            <template #header>
              <strong>{{ group.title }}</strong>
            </template>

            <el-space wrap>
              <el-tag
                v-for="item in group.items"
                :key="item"
                :type="selectedComponentName === item ? 'success' : 'info'"
                effect="light"
                class="material-item"
                @click="setSelectedComponent(item)"
              >
                {{ item }}
              </el-tag>
            </el-space>
          </el-card>
        </div>
      </el-scrollbar>
    </div>
  </el-aside>
</template>

<style scoped>
.panel {
  border-right: 1px solid #d9e0ea;
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

.panel-scroll {
  flex: 1;
  min-height: 0;
}

.material-wrapper {
  padding: 12px;
}

.group-card {
  margin-bottom: 12px;
  border-radius: 10px;
  border: 1px solid #dfe6f1;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.group-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 22px rgb(20 37 63 / 10%);
}

.material-item {
  cursor: pointer;
  user-select: none;
}
</style>
