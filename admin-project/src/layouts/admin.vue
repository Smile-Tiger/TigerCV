<template>
    <el-container>
        <el-header>
            <f-header/>
        </el-header>
        <el-container>
            <el-aside :width="layoutStore.asideWidth">
                <f-menu></f-menu>
            </el-aside>
            <el-main>
                <f-tag-list/>
                <!-- Component是当前路由组件的实例，利用keepalive进行缓存实例内容，避免切换路由时丢失 -->
                <router-view v-slot="{ Component }">
                  <keep-alive :max="10">
                    <component :is="Component" />
                  </keep-alive>
                </router-view>
            </el-main>
        </el-container>
    </el-container>
</template>
<script setup>
import { useLayoutStore } from '@/stores/layout'
import FHeader from './components/FHeader.vue';
import FMenu from './components/FMenu.vue';
import FTagList from './components/FTagList.vue';

const layoutStore = useLayoutStore()
</script>

<style>
.el-aside{
    transition: all 0.3s;
}
</style>
