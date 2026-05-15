<template>
  <el-card shadow="never" class="border-0">
    <!-- 搜索 -->
    <el-form :model="searchForm" label-width="80px" class="mb-3" size="small">
      <el-row :gutter="20">
        <el-col :span="8" :offset="0">
          <el-form-item label="关键词">
            <el-input v-model="searchForm.keyword" placeholder="管理员昵称" clearable></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8" :offset="8">
          <div class="flex items-center justify-end">
            <!-- ***这里的点击方法一定要加括号，不加括号时，如果写的方法有参数，默认传入event进去 -->
            <el-button type="primary" @click="getManagerList()">搜索</el-button>
            <el-button @click="resetSearchForm">重置</el-button>
          </div>
        </el-col>
      </el-row>
    </el-form>


    <!-- 新增|刷新 -->
    <ListHeader @create="handleCreate" @refresh="getManagerList(1, searchForm.value)"/>

    <el-table :data="list" stripe style="width: 100%" v-loading="loading">
      <el-table-column label="管理员" width="200">
        <template #default="{ row }">
          <div class="flex items-center">
             <el-avatar :size="40" :src="row.avatar">
                <img
                  src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png"
                />
              </el-avatar>
              <div class="ml-3">
                <h6>{{ row.username }}</h6>
                <small>ID:{{ row.id }}</small>
              </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="所属管理员" align="center">
        <template #default="{ row }">
          {{ row.role?.name || "-" }}
        </template>
      </el-table-column>
      <el-table-column label="状态" width="120">
        <template #default="{ row }">
          <el-switch :modelValue="row.status" :active-value="1" :inactive-value="0" :loading="row.statusLoading" :disabled="row.super == 1"  @change="handleStatusChange($event,row)">
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" align="center">
        <template #default="scope">
          <el-button type="primary" size="small" text @click="handleEdit(scope.row)">修改</el-button>

          <el-popconfirm title="是否要删除该管理员？" confirmButtonText="确认" cancelButtonText="取消" @confirm="handleDelete(scope.row.id)">
                <template #reference>
                    <el-button text type="primary" size="small">删除</el-button>
                </template>
            </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <div class="flex items-center justify-center mt-5">
        <el-pagination background layout="prev, pager ,next" :total="total" :current-page="currentPage" :page-size="limit" @current-change="getManagerList"/>
    </div>

    <FormDrawer ref="formDrawerRef" :title="drawerTitle" @submit="handleSubmit">
      <el-form :model="form" ref="formRef" :rules="rules" label-width="80px" :inline="false">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="用户名"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" placeholder="密码"></el-input>
        </el-form-item>
        <el-form-item label="头像" prop="avatar">
          <ChooseImage v-model="form.avatar"/>
          <!--
            Vue 3 自动转换为
            <ChooseImage
              :modelValue="form.avatar"
              @update:modelValue="form.avatar = $event"
            />
          -->
        </el-form-item>
        <el-form-item label="所属角色" prop="role_id">
          <el-select v-model="form.role_id" placeholder="选择所属角色">
            <el-option v-for="item in roles"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="content">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0">
          </el-switch>
        </el-form-item>
      </el-form>
    </FormDrawer>

  </el-card>
</template>
<script setup>



import ChooseImage from '@/components/ChooseImage.vue'
import { getManagerListAPI, getAddManagerAPI, getUpdateManagerAPI, getDeleteManagerAPI,
  getUpdateStatusAPI
 } from '@/apis/manager';
import { onMounted, ref } from 'vue';
import FormDrawer from '@/components/FormDrawer.vue';
import { toast } from '@/composables/util';
import ListHeader from '@/components/ListHeader.vue'

const limit = ref(10)
const loading = ref(false)
const currentPage = ref(1)
const list = ref([])
const total = ref(0)
const roles = ref([])

const searchForm = ref({
  limit: limit.value,
  keyword: ''
})

//重置输入框
const resetSearchForm = () => {
  searchForm.value.keyword = ''
  getManagerList(1, searchForm.value)
}

const getManagerList = async (p = currentPage.value) => {
  loading.value = true
  currentPage.value = p
  const res = await getManagerListAPI(p, searchForm.value)
  total.value = res.totalCount
  list.value = res.list
  roles.value = res.roles
  loading.value = false
}

//抽屉内容
const form = ref({
  username:"",
  password:"",
  role_id:null,
  status:1,
  avatar:""
})
const formRef = ref(null)
const rules = ref({})
const formDrawerRef = ref(null)
const editId = ref(null)
const drawerTitle = editId.value ? "修改管理员" : "新增管理员"

// 重置抽屉表单
const resetForm = (row) => {
  if(row){
    for (const key in form.value) {
      form.value[key] = row[key]
    }
  }
}

//新增功能
const handleCreate = () => {
  editId.value = 0
  resetForm({
    username:"",
    password:"",
    role_id:null,
    status:1,
    avatar:""
  })
  formDrawerRef.value.open()
}

//编辑功能
const handleEdit = (row) => {
  editId.value = row.id
  resetForm(row)
  formDrawerRef.value.open()
}

//删除功能
const handleDelete = async (id) => {
  loading.value = true
  await getDeleteManagerAPI(id)
  loading.value = false
  toast('删除成功')
  getManagerList(1)
}

// 提交表单
const handleSubmit = () => {
  formRef.value.validate( async (valid) => {
    if(!valid) return false
    formDrawerRef.value.showLoading()
    const fun = editId.value ? getUpdateManagerAPI(editId.value, form.value) : getAddManagerAPI(form.value)
    await fun
    formDrawerRef.value.hideLoading()
    getManagerList(1)
    toast(editId.value ? '修改成功' : '新增成功')
    formDrawerRef.value.close()
  })
}

//修改状态
const handleStatusChange = async (status, row) => {
  row.statusLoading = true
  await getUpdateStatusAPI(row.id, status)
  toast('状态修改成功')
  getManagerList(1)
  row.statusLoading = false
}

onMounted(() => {
  getManagerList(1, searchForm.value)
})
</script>
