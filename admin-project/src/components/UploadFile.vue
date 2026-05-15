<template>
  <el-upload
    drag
    :action="uploadImgAPI"
    multiple
    :headers="{
        token
    }"
    name="img"
    :data="data"
    :on-success="uploadSuccess"
    :on-error="uploadError"
  >
    <el-icon class="el-icon--upload"><upload-filled /></el-icon>
    <div class="el-upload__text">
      Drop file here or <em>click to upload</em>
    </div>
    <template #tip>
      <div class="el-upload__tip">
        jpg/png files with a size less than 500kb
      </div>
    </template>
  </el-upload>
</template>
<script setup>
import { uploadImgAPI } from '@/apis/img'
import { useUserStore } from '@/stores/user';
import { toast } from '@/composables/util'

const props = defineProps({
  data: Object
})

const emit = defineEmits(['success'])

const userStore = useUserStore()
const token = userStore.token

const uploadSuccess = (response, uploadFile, uploadFiles)=>{
    emit("success",{
        response, uploadFile, uploadFiles
    })
}

const uploadError = (error, uploadFile, uploadFiles)=>{
    console.log(error)
    let msg = JSON.parse(error.message).msg || "上传失败"
    toast(msg,"error")
}

</script>
