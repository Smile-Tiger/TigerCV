<template>
    <div class="f-tag-list" :style="{ left: layoutStore.asideWidth }">

        <el-tabs v-model="activeTab" type="card" class="flex-1" @tab-remove="removeTab" style="min-width:100px;"
        @tab-change="changeTab"
        >
            <el-tab-pane v-for="item in tabList"
             :key="item.path"
             :label="item.title"
             :name="item.path"
             :closable="item.path !== '/'"
             ></el-tab-pane>
        </el-tabs>

        <span class="tag-btn">
            <el-dropdown @command="handleClose">
                <span class="el-dropdown-link">
                    <el-icon class="el-icon--right">
                        <arrow-down />
                    </el-icon>
                </span>
                <template #dropdown>
                    <el-dropdown-menu>
                      <!-- ？？关闭所有时，不会自动跳转回后台首页 -->
                        <el-dropdown-item command="clearOther">关闭其他</el-dropdown-item>
                        <el-dropdown-item command="clearAll">关闭所有</el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </span>

    </div>

    <div class="h-10"></div>
</template>
<script setup>
import { useLayoutStore } from '@/stores/layout'
import { onBeforeRouteUpdate } from 'vue-router'
import { computed } from 'vue'

const layoutStore = useLayoutStore()

// 使用计算属性实现双向绑定
const activeTab = computed(() => layoutStore.activeTab)

// 使用计算属性获取标签列表
const tabList = computed(() => layoutStore.tabList)

// 监听路由变化，添加新标签
onBeforeRouteUpdate((to) => {
    layoutStore.addTab({
      title: to.meta.title,
      path: to.path
    })
})

// 点击跳转
const changeTab = (tab) => {
  layoutStore.changeTab(tab)
}

// 点击关闭
const removeTab = (tab) => {
  layoutStore.removeTab(tab)
}

const handleClose = (c) => {
  console.log(c)
  layoutStore.handleClose(c)
}
</script>
<style scoped>
.f-tag-list{
    @apply fixed bg-gray-100 flex items-center px-2;
    top: 64px;
    right: 0;
    height: 44px;
    z-index: 100;
}
.tag-btn{
    @apply bg-white rounded ml-auto flex items-center justify-center px-2;
    height: 32px;
}
:deep(.el-tabs__header){
    border: 0!important;
    @apply mb-0;
}
:deep(.el-tabs__nav){
    border: 0!important;
}
:deep(.el-tabs__item){
    border: 0!important;
    height: 32px;
    line-height: 32px;
    @apply bg-white mx-1 rounded;
}
:deep(.el-tabs__nav-next),:deep(.el-tabs__nav-prev){
    line-height: 32px;
    height: 32px;
}
:deep(.is-disabled){
    cursor: not-allowed;
    @apply text-gray-300;
}
</style>
