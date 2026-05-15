<template>
    <div class="f-menu" :style="{width: layoutStore.asideWidth}">
        <el-menu
        :default-active="defaultActive"
        class="border-0"
        @select="handleSelect"
        :collapse="isCollapse"
        unique-opened
        :collapse-transition="false"
        >

            <template v-for="(item,index) in asideMenus" :key="index">

              <!-- 有子菜单，：index唯一标识 -->
                <el-sub-menu v-if="item.child && item.child.length > 0" :index="item.name">
                    <template #title>
                        <el-icon>
                            <component :is="item.icon"></component>
                        </el-icon>
                        <span>{{ item.name }}</span>
                    </template>
                    <el-menu-item v-for="(item2,index2) in item.child" :key="index2" :index="item2.frontpath">
                        <el-icon>
                            <component :is="item2.icon"></component>
                        </el-icon>
                        <span>{{ item2.name }}</span>
                    </el-menu-item>
                </el-sub-menu>

                <el-menu-item v-else :index="item.frontpath">
                    <el-icon>
                         <component :is="item.icon"></component>
                    </el-icon>
                    <span>{{ item.name }}</span>
                </el-menu-item>
            </template>
        </el-menu>
    </div>
</template>
<script setup>
import { useRouter, useRoute, onBeforeRouteUpdate } from 'vue-router';
import { useLayoutStore } from '@/stores/layout'
import { computed, onMounted, ref } from 'vue';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore()
const layoutStore = useLayoutStore()
const router = useRouter()
const route = useRoute()

const isCollapse = computed(() => !(layoutStore.asideWidth === '250px'))

// （？） 待解决：侧边栏清空active后，menus没有跟着变化（解决了，就是下面的路由守卫）
const defaultActive = ref(route.path)

// 监听路由变化(利用组件内守卫)
onBeforeRouteUpdate((to)=>{
    defaultActive.value = to.path
})

//侧边栏内容获取
const asideMenus = userStore.userInfo.menus

// 侧边栏选择
// 只有被真正标中的才会打印，打开最底层的菜单
const handleSelect = (e)=>{
  console.log(e)
  router.push(e)
}

console.log(userStore.userInfo)

onMounted(() => {
  handleSelect(defaultActive.value)
})

</script>
<style>
.f-menu {
    transition: all 0.3s;
    top: 64px;
    bottom: 0;
    left: 0;
    overflow: auto;
    @apply shadow-md fixed bg-light-50;
}
.f-menu::-webkit-scrollbar{
    width: 0px;
}
</style>
