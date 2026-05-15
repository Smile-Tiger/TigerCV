<script setup>
import { useFullscreen } from '@vueuse/core'
import FormDrawer from '@/components/FormDrawer.vue'
import { useLogout, useRepassword } from '@/composables/useManager'
import { useUserStore } from '@/stores/user'
import { useLayoutStore } from '@/stores/layout'

const layoutStore = useLayoutStore()

const userStore = useUserStore()

// 模仿useFullscreen方法包装方法到一个文件上，便于维护和管理
const {
    form,
    rules,
    formRef,
    onSubmit,
    formDrawerRef,
    openRePasswordForm
  } = useRepassword()
const { Logout } = useLogout()

// 全屏方法
const { isFullscreen, toggle } = useFullscreen()

// 用户下拉菜单
const handleCommand = (c) => {
  if(c === "logout"){
    Logout()
  }
  else if(c === "rePassword"){
    openRePasswordForm()
  }
}

// 刷新页面
const handleRefresh = () => location.reload()
</script>

<template>
    <div class="f-header">
        <span class="logo">
            <el-icon class="mr-1">
                <eleme-filled />
            </el-icon>
            Tiger后台
        </span>
        <el-icon class="icon-btn" @click="layoutStore.handleAsideWidth">
            <fold v-if="layoutStore.asideWidth === '250px'"/>
            <Expand v-else/>
        </el-icon>
        <el-tooltip effect="dark" content="刷新" placement="bottom">
            <el-icon class="icon-btn" @click="handleRefresh">
                <refresh />
            </el-icon>
        </el-tooltip>

        <div class="ml-auto flex items-center">
            <el-tooltip effect="dark" content="全屏" placement="bottom">
                <el-icon class="icon-btn" @click="toggle">
                    <full-screen v-if="!isFullscreen" />
                    <aim v-else />
                </el-icon>
            </el-tooltip>

            <!-- command事件完成下拉菜单：command事件可以获取到点击项的command值 -->
            <el-dropdown class="dropdown" @command="handleCommand">
                <span class="flex items-center text-light-50">
                    <el-avatar class="mr-2" :size="25" :src="userStore.userInfo?.avatar" />
                    {{ userStore.userInfo?.username }}
                    <el-icon class="el-icon--right">
                        <arrow-down />
                    </el-icon>
                </span>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item command="rePassword">修改密码</el-dropdown-item>
                        <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </div>
    </div>

    <FormDrawer ref="formDrawerRef" title="修改密码" destroyOnClose @submit="onSubmit">
        <el-form ref="formRef" :rules="rules" :model="form" label-width="80px">
            <el-form-item prop="oldPassword" label="旧密码">
                <el-input v-model="form.oldPassword" placeholder="请输入旧密码"></el-input>
            </el-form-item>
            <el-form-item prop="password" label="新密码">
                <el-input type="password" v-model="form.password" placeholder="请输入密码" show-password></el-input>
            </el-form-item>
            <el-form-item prop="repassword" label="确认密码">
                <el-input type="password" v-model="form.repassword" placeholder="请输入确认密码" show-password></el-input>
            </el-form-item>
        </el-form>
    </FormDrawer>
</template>

<style>
.f-header {
    @apply flex items-center bg-indigo-700 text-light-50 fixed top-0 left-0 right-0;
    height: 64px;
    z-index: 1000
}

.logo {
    width: 250px;
    @apply flex justify-center items-center text-xl font-thin;
}

.icon-btn {
    @apply flex justify-center items-center;
    width: 42px;
    height: 64px;
    cursor: pointer;
}

.icon-btn:hover {
    @apply bg-indigo-600;
}

.f-header .dropdown {
    height: 64px;
    cursor: pointer;
    @apply flex justify-center items-center mx-5;
}
</style>
