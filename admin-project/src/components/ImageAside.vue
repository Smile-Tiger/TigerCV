<template>
    <el-aside width="220px" class="image-aside" :loading="loading">
        <div class="top">
          <AsideList
          v-for="(item, index) in list"
          :active="activeId == item.id"
          :key="index"
          @edit="handleEdit(item)"
          @delete="handleDelete(item)"
          @click="handleActive(item.id)"
        >{{ item.name }}
        </AsideList>
        </div>

        <div class="bottom">
            <el-pagination background layout="prev, next"
            :total="total"
            :current-page="currentPage"
            :page-size="limit"
            @current-change="getImgList"/>
        </div>
    </el-aside>

    <FormDrawer :title="title" ref="formDrawerRef" @submit="handleSubmit">
        <el-form :model="form" ref="formRef" :rules="rules" label-width="80px" :inline="false">
            <el-form-item label="分类名称" prop="name">
                <el-input v-model="form.name"></el-input>
            </el-form-item>
            <el-form-item label="排序" prop="order">
                <el-input-number v-model="form.order" :min="0" :max="1000"/>
            </el-form-item>
        </el-form>
    </FormDrawer>

</template>

<script setup>
import { onMounted, ref, reactive, computed } from 'vue';
import AsideList from './AsideList.vue';
import { getImgListAPI, createImgListAPI, updateImgListAPI, deleteImgListAPI } from '@/apis/img';
import FormDrawer from './FormDrawer.vue'
import { toast } from '@/composables/util';

// 列表渲染
const loading = ref(false)
const activeId = ref(0)
const list = ref([])

const getImgList = async (p = 1) => {
  currentPage.value = p
  loading.value = true
  const res = await getImgListAPI(currentPage.value).finally(() => {
    loading.value = false
  })
  total.value = res.totalCount
  list.value = res.list
  let item = list.value[0]
  console.log(item)
  if(item){
    handleActive(item.id)
  }
}

// 分页功能
const currentPage = ref(1)
const total = ref(0)
const limit = ref(10)

// 抽屉功能
const formDrawerRef = ref(null)

// 抽屉内的内容
const title = computed(() => editId.value ? '编辑' : '新增') // 这里利用value是否为0做否定
const editId = ref(0)
const form = reactive({
    name:"",
    order:50
})

const rules = {
    name:[{
        required: true,
        message: '图库分类名称不能为空',
        trigger: 'blur'
    }]
}

// 提交表单
const formRef = ref(null)
const handleSubmit = () => {
  formRef.value.validate( async (valid) => {
    if (!valid) return
    formDrawerRef.value.showLoading()
    if(editId.value){
      await updateImgListAPI(editId.value,form).finally(() => {
        formDrawerRef.value.hideLoading()
      })
    }else{
      await createImgListAPI(form).finally(() => {
        formDrawerRef.value.hideLoading()
      })
    }
    toast( title.value +'成功')
    getImgList(editId.value ? currentPage.value : 1)
    formDrawerRef.value.close()

  })
}

// 新增图片分类
const handleCreate = () => {
  editId.value = 0
  form.name = ''
  form.order = 50
  formDrawerRef.value.open()
}

// 编辑图片分类
const handleEdit = (item) => {
  editId.value = item.id
  form.name = item.name
  form.order = item.order
  formDrawerRef.value.open()

}

// 删除图片分类
const handleDelete = async (item) => {
  formDrawerRef.value.showLoading()
  await deleteImgListAPI(item.id).finally(() => {
    formDrawerRef.value.hideLoading()
  })
  toast('删除成功')
  getImgList()
}

const emit = defineEmits(['active'])
// 选中id传给ImageMain
const handleActive = (id) => {
  activeId.value = id
  emit('active', id)
}
// - 每次 activeId 变化都会触发 emit
// - 父组件通过 @change 监听，实时响应

// DefineExpose如果暴露属性是静态的，需要动态变化最好用方法进行传递
defineExpose({
  handleCreate,
})

onMounted(() => {
  getImgList()
})
</script>

<style>
.image-aside{
  border-right: 1px solid #eeeeee;
  position: relative;
}
.image-aside .top
{
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 50px;
  overflow-y: auto;
}
.image-aside .bottom
{
  position: absolute;
  bottom: 0;
  height: 50px;
  left: 0;
  right: 0;
  @apply flex items-center justify-center;
}
</style>
