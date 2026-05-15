<template>
  <div v-if="modelValue">
    <el-image v-if="typeof modelValue == 'string'" :src="modelValue" fit="cover"
      class="w-[100px] h-[100px] rounded border mr-2"></el-image>
    <div v-else class="flex flex-wrap">
      <div class="relative mx-1 mb-2 w-[100px] h-[100px]" v-for="(url, index) in modelValue" :key="index">
        <el-icon class="absolute right-[5px] top-[5px] cursor-pointer bg-white rounded-full" style="z-index: 10;"
          @click="removeImage(url)">
          <CircleClose />
        </el-icon>
        <el-image :src="url" fit="cover" class="w-[100px] h-[100px] rounded border mr-2"></el-image>
      </div>
    </div>
  </div>

  <div class="choose-image-btn" @click="open">
    <el-icon :size="25" class="text-gray-500">
      <Plus />
    </el-icon>
  </div>
  <el-dialog title="选择图片" v-model="dialogVisible" width="80%" top="5vh">

    <el-container class="bg-white rounded h-[70vh]">
      <el-header class="image-header">
        <el-button type="primary" size="small" @click="handleOpenCreate">新增图片分类</el-button>
        <el-button type="warning" size="small" @click="handleOpenUpload">上传图片</el-button>
      </el-header>
      <el-container>
        <ImageAside ref="ImageAsideRef" @active="handleActive" />
        <ImageMain :openChoose="true" ref="ImageMainRef" @choose="handleChoose" :limit="props.limit"/>
      </el-container>
    </el-container>

    <template #footer>
      <span>
        <el-button @click="close">取消</el-button>
        <el-button type="primary" @click="submit">确定</el-button>
      </span>
    </template>
  </el-dialog>

</template>
<script setup>
import { ref } from "vue"
import ImageAside from "@/components/ImageAside.vue"
import ImageMain from "@/components/ImageMain.vue"


const dialogVisible = ref(false)

const open = () => dialogVisible.value = true
const close = () => dialogVisible.value = false


const ImageAsideRef = ref(null)
const handleOpenCreate = () => ImageAsideRef.value.handleCreate()

// 子父子通信，值得学习！！！
const ImageMainRef = ref(null)
const handleActive = (id) => ImageMainRef.value.getActiveId(id)

const handleOpenUpload = () => ImageMainRef.value.handleOpenUpload()

//选择图片
const emit = defineEmits(['update:modelValue'])

const props = defineProps({
  modelValue: [String, Array], // 这里表示传入的是数组或者是字符串都可以
  limit: {
    type: Number,
    default: 1
  }
})

let urls = []
const handleChoose = (e) => {
  urls = e.map(o => o.url)
}

const submit = () => {
  if (props.limit === 1) {
    emit('update:modelValue', urls[0])
  }else{
    emit('update:modelValue', urls)
  }
  close()
}

const removeImage = (url) => {
  emit('update:modelValue', props.modelValue.filter(o => o != url))
}

</script>
<style>
.image-header {
  border-bottom: 1px solid #eeeeee;
  @apply flex items-center;
}

.choose-image-btn {
  @apply w-[100px] h-[100px] rounded border flex justify-center items-center cursor-pointer hover:(bg-gray-100);
}
</style>
