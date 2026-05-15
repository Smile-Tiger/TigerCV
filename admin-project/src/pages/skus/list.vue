<template>
  <el-card shadow="never" class="border-0">
    <!-- 新增|刷新 -->
    <ListHeader :layout="'create,delete,refresh'" @create="handleCreate" @refresh="getSkusList"
      @delete="handleMultiDelete" :selection="selection"/>

    <el-table ref="multipleTableRef" @selection-change="handleSelectionChange" :data="list" stripe style="width: 100%"
      v-loading="loading">
      <el-table-column type="selection" width="55" />
      <el-table-column prop="name" label="规格名称" />
      <el-table-column prop="default" label="规格值" width="380" />
      <el-table-column prop="order" label="排序" />
      <el-table-column label="状态" width="120">
        <template #default="{ row }">
          <el-switch :modelValue="row.status" :active-value="1" :inactive-value="0" :loading="row.statusLoading"
            :disabled="row.super == 1" @change="handleStatusChange($event, row)">
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250" align="center">
        <template #default="scope">
          <el-button type="primary" size="small" text @click="handleEdit(scope.row)">修改</el-button>

          <el-popconfirm title="是否要删除该规格？" confirmButtonText="确认" cancelButtonText="取消"
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
        @current-change="getSkusList" />
    </div>

    <FormDrawer destroyOnClose ref="formDrawerRef" :title="drawerTitle" @submit="handleSubmit">
      <el-form :model="form" ref="formRef" :rules="rules" label-width="80px" :inline="false">
        <el-form-item label="规格名称" prop="name">
          <el-input v-model="form.name" placeholder="规格名称"></el-input>
        </el-form-item>
        <el-form-item label="排序" prop="order">
          <el-input-number v-model="form.order" :min="0" :max="1000">
          </el-input-number>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0">
          </el-switch>
        </el-form-item>
        <el-form-item label="规格值" prop="default">
          <TagInput v-model="form.default" />
        </el-form-item>
      </el-form>
    </FormDrawer>

  </el-card>
</template>

<script setup>
import ListHeader from '@/components/ListHeader.vue';
import { computed, onMounted, ref } from 'vue';
import FormDrawer from '@/components/FormDrawer.vue';
import { getSkusListAPI, createSkusAPI, updateSkusAPI, deleteSkusAPI, updateSkusStatusAPI } from '@/apis/skus';
import { toast } from '@/composables/util';
import TagInput from '@/components/TagInput.vue';

const formDrawerRef = ref(null)

const list = ref([])
const currentPage = ref(1)
const total = ref(0)
const loading = ref(false)
const limit = ref(10)

const getSkusList = async (p = currentPage.value) => {
  loading.value = true
  currentPage.value = p
  const res = await getSkusListAPI(p)
  total.value = res.totalCount
  list.value = res.list
  loading.value = false
}

const formRef = ref(null)
const form = ref({
  name: "",
  status: 1,
  default: "",
  order: 50
})
const rules = {
  name: [{
    required: true,
    message: '规格名称不能为空',
    trigger: 'blur'
  }],
  default: [{
    required: true,
    message: '规格值不能为空',
    trigger: 'blur'
  }],
}

const editId = ref(0)
const drawerTitle = computed(() => editId.value === 0 ? "新增规格" : "修改规格")

const handleDelete = async (id) => {
  loading.value = true
  await deleteSkusAPI(id)
  getSkusList()
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
    name: '',
    status: 1,
    default: '',
    order: 50
  })
  formDrawerRef.value.open()
}

const handleSubmit = () => {
  formRef.value.validate(async (valid) => {
    if (!valid) return

    formDrawerRef.value.showLoading()

    const fun = editId.value ? updateSkusAPI(editId.value, form.value) : createSkusAPI(form.value)

    await fun

    toast(drawerTitle.value + "成功")
    // 修改刷新当前页，新增刷新第一页
    getSkusList()
    formDrawerRef.value.close()

    formDrawerRef.value.hideLoading()

  })
}

const handleEdit = (row) => {
  editId.value = row.id
  showForm(row)
  formDrawerRef.value.open()
}

const handleStatusChange = async (status, data) => {
  await updateSkusStatusAPI(status, data.id)
  toast("状态更新成功")
  getSkusList()
}

const selection = ref([])
const handleSelectionChange = (e) => {
  selection.value = e.map(o => o.id)
}



const handleMultiDelete = async () => {
  await deleteSkusAPI(selection.value)
  toast("删除成功")
  getSkusList()
}

onMounted(() => {
  getSkusList()
})
</script>
