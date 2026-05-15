<template>
  <el-main class="image-main" v-loading="loading">
    <div class="top p-3">

      <el-row :gutter="10">
        <el-col :span="6" :offset="0" v-for="(item, index) in list" :key="index">
          <el-card shadow="hover" class="relative mb-3" :body-style="{ 'padding': 0 }" :class="{ 'border-blue-500': item.checked }">
            <el-image :src="item.url" fit="cover" class="h-[150px]" style="width: 100%;" :preview-src-list="[item.url]"
              :initial-index="0"></el-image>
            <div class="image-title">{{ item.name }}</div>
            <div class="flex items-center justify-center p-2">
              <el-checkbox v-if="openChoose" v-model="item.checked" @change="handleChooseChange(item)"/>
              <el-button type="primary" size="small" text @click="handleEdit(item)">重命名</el-button>

              <el-popconfirm title="是否删除该图片？" confirmButtonText="确认" cancelButtonText="取消"
                @confirm="handleDelete(item.id)">
                <template #reference>
                  <el-button type="primary" size="small" text>删除</el-button>
                </template>
              </el-popconfirm>
            </div>
          </el-card>
        </el-col>
      </el-row>


    </div>
    <div class="bottom">
      <el-pagination background layout="prev,pager, next" :total="total" :current-page="currentPage" :page-size="limit_"
        @current-change="getImg" />
    </div>
  </el-main>

  <el-drawer v-model="drawer" title="上传图片">
    <UploadFile :data="{ id }" @success="handleUploadSuccess" />
  </el-drawer>

</template>

<script setup>
import { getImgAPI, updateImgAPI, deleteImgAPI } from '@/apis/img';
import { computed, ref } from 'vue';
import { showPrompt, toast } from '@/composables/util'
import UploadFile from '@/components/UploadFile.vue'

// 区分图片模块与用户头像上传的模块
const props = defineProps({
  openChoose: {
    type: Boolean,
    default: false
  },
  limit: {
    type: Number,
    default: 1
  }
})


// 上传图片模块
const drawer = ref(false)
const handleOpenUpload = () => drawer.value = true

const id = ref(0) // 这个id是Aside的id，并非图片的id
const currentPage = ref(1)
const total = ref(0)
const list = ref([])
const limit_ = ref(10)
const loading = ref(false)

const getImg = async (p = currentPage.value) => {
  loading.value = true
  currentPage.value = p
  const res = await getImgAPI(id.value, currentPage.value).finally(() => loading.value = false)
  // 默认所有图片都未选中
  list.value = res.list.map(o => {
    o.checked = false
    return o
  })
  total.value = res.totalCount
}

// ？？？图片默认调用第一个active，自动获取图片列表
const getActiveId = (id_) => {
  currentPage.value = 1
  id.value = id_
  getImg()
}

// 重命名图片与删除
const handleEdit = (item) => {
  loading.value = true
  showPrompt("请输入新的图片名称", item.name).then(res => {
    if (res.value) {
      updateImgAPI(item.id, res.value).then(() => {
        getImg()
      }).finally(() => loading.value = false)
    }
  })
}

const handleDelete = (id) => {
  loading.value = true
  deleteImgAPI([id]).then(() => {
    toast("删除成功")
    getImg()
  }).finally(() => loading.value = false)
}

// 选择图片
const emits = defineEmits(['choose'])
const checkedImage = computed(() => list.value.filter(o => o.checked))
const handleChooseChange = (item) => {
  if(item.checked && checkedImage.value.length > props.limit){
    item.checked = false
    return toast(`只能选择${props.limit}张图片`, "error")
  }
  emits('choose', checkedImage.value)
}

// 上传成功
const handleUploadSuccess = () => {
  getImg(1)
}

defineExpose({
  getActiveId,
  handleOpenUpload
})

</script>

<style>
.image-main {
  position: relative;
}

.image-main .top {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 50px;
  overflow-y: auto;
}

.image-main .bottom {
  position: absolute;
  bottom: 0;
  height: 50px;
  left: 0;
  right: 0;
  @apply flex items-center justify-center;
}

.image-title {
  position: absolute;
  top: 122px;
  left: -1px;
  right: -1px;
  @apply text-sm truncate text-gray-100 bg-opacity-50 bg-gray-800 px-2 py-1;
}
</style>
