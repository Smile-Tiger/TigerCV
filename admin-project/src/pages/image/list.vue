<template>
    <el-container class="bg-white rounded" :style="{ height: (h + 'px') }">
      <el-header class="image-header">
        <el-button type="primary" size="small" @click="handleOpenCreate">新增图片分类</el-button>
        <el-button type="warning" size="small" @click="handleOpenUpload">上传图片</el-button>
      </el-header>
      <el-container>
        <ImageAside ref="ImageAsideRef" @active="handleActive"/>
        <ImageMain ref="ImageMainRef"/>
      </el-container>
    </el-container>
</template>
<script setup>
import ImageAside from "@/components/ImageAside.vue"
import ImageMain from "@/components/ImageMain.vue"
import { ref } from "vue"

const ImageAsideRef = ref(null)
const handleOpenCreate = () => ImageAsideRef.value.handleCreate()

// 将容器占满剩余页面，利用window.innerHeight获取视口整体高度减去导航栏和标签栏的高度
const windowHeight = window.innerHeight || document.body.clientHeight
const h = windowHeight - 64 - 44 - 40

// *** 子父子通信，值得学习！！！
const ImageMainRef = ref(null)
const handleActive = (id) => ImageMainRef.value.getActiveId(id)

const handleOpenUpload = () => ImageMainRef.value.handleOpenUpload()
</script>
<style>
.image-header{
  border-bottom: 1px solid #eeeeee;
  @apply flex items-center;
}
</style>
