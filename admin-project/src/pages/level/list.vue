<template>
  <el-card shadow="never" class="border-0">
    <!-- 新增|刷新 -->
    <ListHeader @create="handleCreate" @refresh="getData" />

    <el-table :data="tableData" stripe style="width: 100%" v-loading="loading">
      <el-table-column prop="name" label="会员等级" />
      <el-table-column prop="discount" label="折扣率" align="center" />
      <el-table-column prop="level" label="等级序号" align="center" />
      <el-table-column label="状态" width="120">
        <template #default="{ row }">
          <el-switch :modelValue="row.status" :active-value="1" :inactive-value="0" :loading="row.statusLoading"
            :disabled="row.super == 1" @change="handleStatusChange($event, row.id)">
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250" align="center">
        <template #default="scope">
          <el-button type="primary" size="small" text @click="handleEdit(scope.row)">修改</el-button>

          <el-popconfirm title="是否要删除该记录？" confirmButtonText="确认" cancelButtonText="取消"
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
        @current-change="getData" />
    </div>

    <FormDrawer ref="formDrawerRef" :title="drawerTitle" @submit="handleSubmit">
      <el-form :model="form" ref="formRef" :rules="rules" label-width="80px" :inline="false">
        <el-form-item label="等级名称" prop="name">
          <el-input v-model="form.name" placeholder="等级名称"></el-input>
        </el-form-item>
        <el-form-item label="等级权重" prop="level">
          <el-input type="number" v-model="form.level" placeholder="等级权重"></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0">
          </el-switch>
        </el-form-item>
        <el-form-item label="升级条件">
          <div>
            <small class="text-xs mr-2">累计消费满</small>
            <el-input type="number" v-model="form.max_price" placeholder="累计消费" style="width:50%;">
              <template #append>元</template>
            </el-input>
            <small class="text-gray-400 flex">
              设置会员等级所需要的累计消费必须大于等于0,单位：元
            </small>
          </div>
          <div>
            <small class="text-xs mr-2">累计次数满</small>
            <el-input type="number" v-model="form.max_times" placeholder="累计次数" style="width:50%;">
              <template #append>%</template>
            </el-input>
            <small class="text-gray-400 flex">
              设置会员等级所需要的购买量必须大于等于0,单位：笔
            </small>
          </div>
        </el-form-item>
        <el-form-item label="折扣率(%)" prop="discount">
          <el-input type="number" v-model="form.discount" placeholder="折扣率(%)" style="width:50%;">
            <template #append>%</template>
          </el-input>
          <small class="text-gray-400 flex">
            折扣率单位为百分比，如输入90，表示该会员等级的用户可以以商品原价的90%购买
          </small>
        </el-form-item>
      </el-form>
    </FormDrawer>


  </el-card>
</template>

<script setup>
import ListHeader from '@/components/ListHeader.vue'
import { getUserLevelList, createUserLevel, updateUserLevel, updateUserLevelStatus, deleteUserLevel } from '@/apis/level'
import { onMounted, ref, computed } from 'vue';
import FormDrawer from '@/components/FormDrawer.vue'
import { toast } from '@/composables/util';

const limit = ref(10)
const total = ref(0)
const currentPage = ref(1)
const tableData = ref([])
const loading = ref(false)
const formDrawerRef = ref(null)
const editId = ref(0)
const drawerTitle = computed(() => editId.value === 0 ? "新增分类" : "修改分类")

const getData = async (p = currentPage.value) => {
  if (typeof p === 'number') currentPage.value = p
  loading.value = true
  const res = await getUserLevelList(p)
  loading.value = false
  total.value = res.totalCount
  tableData.value = res.list
}

const formRef = ref(null)
const form = ref({
  name: "",
  level: 100,
  status: 1,
  discount: 0,
  max_price: 0,
  max_times: 0
})
const rules = {
  name: [{
    required: true,
    message: '会员等级名称不能为空',
    trigger: 'blur'
  }],
}

const handleDelete = async (id) => {
  loading.value = true
  await deleteUserLevel(id)
  getData()
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
    name: ''
  })
  formDrawerRef.value.open()
}

const handleSubmit = () => {
  formRef.value.validate(async (valid) => {
    if (!valid) return

    formDrawerRef.value.showLoading()

    const fun = editId.value ? updateUserLevel(editId.value, form.value) : createUserLevel(form.value)

    await fun

    toast(drawerTitle.value + "成功")
    // 修改刷新当前页，新增刷新第一页
    getData()
    formDrawerRef.value.close()

    formDrawerRef.value.hideLoading()

  })
}

const handleEdit = (row) => {
  editId.value = row.id
  showForm(row)
  formDrawerRef.value.open()
}

const handleStatusChange = async (status, id) => {
  console.log(status, id)
  await updateUserLevelStatus(id, status)
  toast("状态更新成功")
  getData()
}

onMounted(() => getData())
</script>
