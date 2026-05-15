<template>
    <el-dialog
        title="规格选择"
        v-model="dialogVisible"
        width="80%"
        top="5vh">

        <el-container style="height:65vh;">

            <el-aside width="220px" class="image-aside">
                <div class="top">

                    <div class="sku-list" :class="{ 'active':(activeId == item.id) }" v-for="(item,index) in tableData" :key="index" @click="handleChangeActiveId(item.id)">
                        {{ item.name }}
                    </div>

                </div>
                <div class="bottom">
                    <el-pagination
                    background
                    layout="prev, next"
                    :total="total"
                    :current-page="currentPage"
                    :page-size="limit"
                    @current-change="getData"/>
                </div>
            </el-aside>

            <el-main>
                <el-checkbox-group v-model="form.list">
                    <el-checkbox v-for="item in list" :key="item" :label="item" border>
                        {{item}}
                    </el-checkbox>
                </el-checkbox-group>
            </el-main>
        </el-container>

        <template #footer>
            <span>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="submit">确定</el-button>
            </span>
        </template>
    </el-dialog>
</template>

<script setup>
import { getSkusListAPI } from '@/apis/skus';
import { ref } from 'vue';

const tableData = ref([])
const currentPage = ref(1)
const total = ref(0)
const loading = ref(false)
const limit = ref(10)

// 这一个是用来传接口的表单
const form = ref({
  name: '',
  list: [] // 选中的规格值
})

const getData = async (p = currentPage.value) => {
  if (typeof p === 'number') currentPage.value = p
  loading.value = true
  const res = await getSkusListAPI(currentPage.value)
  total.value = res.totalCount
  tableData.value = res.list
  if(total.value > 0) handleChangeActiveId(tableData.value[0].id)
  loading.value = false
}

// 打开
const dialogVisible = ref(false)
const callbackFunction = ref(null)
const open = (
  callback = null
) => {
  callbackFunction.value = callback
  getData()
  dialogVisible.value = true
}

//选择所属的sku，并显示相应的规格值
const list = ref([])

const activeId = ref(0)
const handleChangeActiveId = (id) => {
  activeId.value = id
  list.value = []
  const item = tableData.value.find(o => o.id === id)
  if(item) {
    list.value = item.default.split(',')
    form.value.name = item.name
  }
}

const submit = () => {
  if(typeof callbackFunction.value === 'function') callbackFunction.value(form.value)
  dialogVisible.value = false
}

defineExpose({
  open
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
.sku-list {
    border-bottom: 1px solid #f4f4f4;
    @apply p-3 text-sm text-gray-600 flex items-center cursor-pointer;
}
.sku-list:hover,active {
    @apply bg-blue-50;
}
</style>
