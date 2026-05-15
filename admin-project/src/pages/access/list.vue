<template>
  <el-card shadow="never" class="border-0">
    <ListHeader @refresh="getAccessList" @create="handleCreate" />
    <el-tree :data="list" :props="{ label: 'name', children: 'child' }" v-loading="loading" node-key="id"
      :default-expanded-keys="defaultExpandedKeys">
      <template #default="{ data }">
        <div class="custom-tree-node">
          <el-tag size="small" :type="data.menu ? 'primary' : 'info'">{{ data.menu ? "菜单" : "权限" }}</el-tag>
          <el-icon v-if="data.icon" :size="16" class="ml-2">
            <component :is="data.icon" />
          </el-icon>
          <span>{{ data.name }}</span>

          <div class="ml-auto">
            <el-switch :modelValue="data.status" :active-value="1" :inactive-value="0"
              @change="handleStatusChange($event, data)" />
            <el-button text type="primary" size="small" @click.stop="handleEdit(data)">修改</el-button>
            <el-button text type="primary" size="small" @click.stop="addChild(data.id)">增加</el-button>
            <el-popconfirm title="是否要删除该记录？" confirmButtonText="确认" cancelButtonText="取消"
              @confirm.stop="handleDelete(data.id)">
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
        <el-form-item label="上级菜单" prop="rule_id">
          <el-cascader v-model="form.rule_id" :options="options"
            :props="{ value: 'id', label: 'name', children: 'child', checkStrictly: true, emitPath: false }"
            placeholder="请选择上级菜单" />
        </el-form-item>
        <el-form-item label="菜单/规则" prop="menu">
          <el-radio-group v-model="form.menu">
            <el-radio :label="1" border>菜单</el-radio>
            <el-radio :label="0" border>规则</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" style="width: 30%;" placeholder="名称"></el-input>
        </el-form-item>
        <el-form-item label="菜单图标" prop="icon" v-if="form.menu == 1">
          <IconSelect v-model="form.icon" />
        </el-form-item>
        <el-form-item label="前端路由" prop="frontpath" v-if="form.menu == 1 && form.rule_id > 0">
          <el-input v-model="form.frontpath" placeholder="前端路由"></el-input>
        </el-form-item>
        <el-form-item label="后端规则" prop="condition" v-if="form.menu == 0">
          <el-input v-model="form.condition" placeholder="后端规则"></el-input>
        </el-form-item>
        <el-form-item label="请求方式" prop="method" v-if="form.menu == 0">
          <el-select v-model="form.method" class="m-2" placeholder="请选择请求方式">
            <el-option v-for="item in ['GET', 'POST', 'PUT', 'DELETE']" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序" prop="order">
          <el-input-number v-model="form.order" :min="0" :max="1000" />
        </el-form-item>
      </el-form>
    </FormDrawer>
  </el-card>
</template>

<script setup>
import ListHeader from '@/components/ListHeader.vue'
import { getAccessListAPI, getAddAccessAPI, getUpdateAccessAPI, getStatusChangeAPI, getDeleteAccessAPI } from '@/apis/access'
import { onMounted, ref, computed } from 'vue';
import FormDrawer from '@/components/FormDrawer.vue'
import { toast } from '@/composables/util';
import IconSelect from '@/components/IconSelect.vue';

const currentPage = ref(1)
const list = ref([])
const loading = ref(false)
const defaultExpandedKeys = ref([])
const formDrawerRef = ref(null)
const editId = ref(0)
const drawerTitle = computed(() => editId.value === 0 ? "新增权限" : "修改权限")
const options = ref([])

const getAccessList = async (p = currentPage.value) => {
  currentPage.value = p
  loading.value = true
  const res = await getAccessListAPI(p)
  loading.value = false
  list.value = res.list
  defaultExpandedKeys.value = res.list.map(o => o.id)
  options.value = res.rules
  console.log(options.value)
}

const formRef = ref(null)
const form = ref({
  rule_id: 0,
  menu: 0,
  name: "",
  condition: "",
  method: "GET",
  status: 1,
  order: 50,
  icon: "",
  frontpath: ""
})
const rules = {}

const handleDelete = async (id) => {
  loading.value = true
  await getDeleteAccessAPI(id)
  getAccessList()
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
    rule_id: 0,
    menu: 0,
    name: "",
    condition: "",
    method: "GET",
    status: 1,
    order: 50,
    icon: "",
    frontpath: ""
  })
  formDrawerRef.value.open()
}

const handleSubmit = () => {
  formRef.value.validate(async (valid) => {
    if (!valid) return

    formDrawerRef.value.showLoading()

    const fun = editId.value ? getUpdateAccessAPI(editId.value, form.value) : getAddAccessAPI(form.value)

    await fun

    toast(drawerTitle.value + "成功")
    // 修改刷新当前页，新增刷新第一页
    getAccessList()
    formDrawerRef.value.close()

    formDrawerRef.value.hideLoading()

  })
}

const handleEdit = (row) => {
  editId.value = row.id
  showForm(row)
  formDrawerRef.value.open()
}

const addChild = (id) => {
  handleCreate()
  form.value.rule_id = id
  form.value.status = 1
}

const handleStatusChange = async (status, data) => {
  await getStatusChangeAPI(status, data)
  toast("状态更新成功")
}

onMounted(() => getAccessList())
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
