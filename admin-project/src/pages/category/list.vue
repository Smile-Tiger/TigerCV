<template>
    <el-card shadow="never" class="border-0">
        <ListHeader @create="handleCreate" @refresh="getData"/>
        <el-tree :data="tableData" :props="{ label:'name',children:'child' }" v-loading="loading" node-key="id">
            <template #default="{ data }">
                <div class="custom-tree-node">
                    <span>{{ data.name }}</span>

                    <div class="ml-auto">
                        <el-button text type="primary" size="small" @click="openGoodsDrawer(data)">推荐商品</el-button>

                        <el-switch :modelValue="data.status" :active-value="1" :inactive-value="0" @change="handleStatusChange($event,data.id)"/>
                        <el-button text type="primary" size="small" @click.stop="handleEdit(data)">修改</el-button>

                        <el-popconfirm title="是否要删除该记录？" confirmButtonText="确认" cancelButtonText="取消" @confirm="handleDelete(data.id)">
                            <template #reference>
                                <el-button text type="primary" size="small">删除</el-button>
                            </template>
                        </el-popconfirm>
                    </div>

                </div>
            </template>
        </el-tree>

        <FormDrawer ref="formDrawerRef" :title="drawerTitle" @submit="handleSubmit">
            <el-form :model="form" ref="formRef" :rules="rules" label-width="80px" :inline="false">
                <el-form-item label="分类名称" prop="name">
                    <el-input v-model="form.name" placeholder="分类名称"></el-input>
                </el-form-item>
            </el-form>
        </FormDrawer>

        <GoodsDrawer ref="GoodsDrawerRef" />

    </el-card>
</template>

<script setup>
import ListHeader from '@/components/ListHeader.vue'
import { getCategoryList, createCategory, updateCategory, updateCategoryStatus, deleteCategory } from '@/apis/category'
import { onMounted, ref, computed } from 'vue';
import FormDrawer from '@/components/FormDrawer.vue'
import { toast } from '@/composables/util';
import GoodsDrawer from './components/GoodsDrawer.vue'

const tableData = ref([])
const loading = ref(false)
const formDrawerRef = ref(null)
const editId = ref(0)
const drawerTitle = computed(() => editId.value === 0 ? "新增分类" : "修改分类")

const getData = async () => {
  loading.value = true
  const res = await getCategoryList()
  loading.value = false
  console.log(res)
  tableData.value = res
}

const formRef = ref(null)
const form = ref({
  name: ''
})
const rules = {}

const handleDelete = async (id) => {
  loading.value = true
  await deleteCategory(id)
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

    const fun = editId.value ? updateCategory(editId.value, form.value) : createCategory(form.value)

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
  console.log(id)
  await updateCategoryStatus(id, status)
  toast("状态更新成功")
  getData()
}

//推荐商品模块
const GoodsDrawerRef = ref(null)
const openGoodsDrawer = (data) => GoodsDrawerRef.value.open(data)

onMounted(() => getData())
</script>

<style>
.custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    font-size: 14px;
    padding-right: 8px;
}
.el-tree-node__content {
    padding: 20px 0;
}
</style>
