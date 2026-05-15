<template>
  <el-card shadow="never" class="border-0">
    <!-- 新增|刷新 -->
    <ListHeader @create="handleCreate" @refresh="getNoticeList(currentPage.value)"/>

    <el-table :data="list" stripe style="width: 100%" v-loading="loading">
      <el-table-column prop="title" label="公告标题" />
      <el-table-column prop="create_time" label="发布时间" width="380" />
      <el-table-column label="操作" width="180" align="center">
        <template #default="scope">
          <el-button type="primary" size="small" text @click="handleEdit(scope.row)">修改</el-button>

          <el-popconfirm title="是否要删除该公告？" confirmButtonText="确认" cancelButtonText="取消"
            @confirm="handleDelete(scope.row.id)">
            <template #reference>
              <el-button text type="primary" size="small">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <div class="flex items-center justify-center mt-5">
      <el-pagination background layout="prev, pager ,next" :total="total" :current-page="currentPage" :page-size="limit"
        @current-change="getNoticeList" />
    </div>

    <FormDrawer ref="formDrawerRef" :title="drawerTitle" @submit="handleSubmit">
      <el-form :model="form" ref="formRef" :rules="rules" label-width="80px" :inline="false">
        <el-form-item label="公告标题" prop="title">
          <el-input v-model="form.title" placeholder="公告标题"></el-input>
        </el-form-item>
        <el-form-item label="公告内容" prop="content">
          <el-input v-model="form.content" placeholder="公告内容" type="textarea" :rows="5"></el-input>
        </el-form-item>
      </el-form>
    </FormDrawer>

  </el-card>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import FormDrawer from '@/components/FormDrawer.vue';
import { getNoticeListAPI, getDeleteNoticeAPI, getUpdateNoticeAPI, getAddNoticeAPI } from '@/apis/notice';
import { toast } from '@/composables/util';
import ListHeader from '@/components/ListHeader.vue'

const formDrawerRef = ref(null)

const list = ref([])
const currentPage = ref(1)
const total = ref(0)
const loading = ref(false)
const limit = ref(10)

const getNoticeList = async (p = currentPage.value) => {
  loading.value = true
  currentPage.value = p
  const res = await getNoticeListAPI(p)
  total.value = res.totalCount
  list.value = res.list
  loading.value = false
}

const formRef = ref(null)
const form = ref({
  title: "",
  content: ""
})
const rules = {
  title: [{
    required: true,
    message: '公告标题不能为空',
    trigger: 'blur'
  }],
  content: [{
    required: true,
    message: '公告内容不能为空',
    trigger: 'blur'
  }]
}

const editId = ref(0)
const drawerTitle = computed(() => editId.value === 0 ? "新增公告" : "修改公告")

const handleDelete = async (id) => {
  loading.value = true
  await getDeleteNoticeAPI(id)
  getNoticeList()
  toast("删除成功")
  loading.value = false
}

const showForm = (row) => {
  if (row) {
    for (const key in form.value) {
      form.value[key] = row[key]
    }
  }
}

const handleCreate = () => {
  editId.value = 0
  showForm({
    title: '',
    content: ''
  })
  formDrawerRef.value.open()
}

const handleSubmit = () => {
  formRef.value.validate(async (valid) => {
    if (!valid) return

    formDrawerRef.value.showLoading()

    const fun = editId.value ? getUpdateNoticeAPI(editId.value, form.value) : getAddNoticeAPI(form.value)

    await fun

    toast(drawerTitle.value + "成功")
    // 修改刷新当前页，新增刷新第一页
    getNoticeList()
    formDrawerRef.value.close()

    formDrawerRef.value.hideLoading()

  })
}

const handleEdit = (row) => {
  editId.value = row.id
  showForm(row)
  formDrawerRef.value.open()
}

onMounted(() => {
  getNoticeList()
})
</script>
