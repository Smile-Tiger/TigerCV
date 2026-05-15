<template>
  <FormDrawer ref="formDrawerRef" title="推荐商品" @submit="handleConnect" confirmText="关联">
    <el-table :data="tableData" border stripe style="width:100%;">
      <el-table-column prop="goods_id" label="ID" width="60" />
      <el-table-column label="商品封面" width="180">
        <template #default="{ row }">
          <el-image :src="row.cover" fit="fill" :lazy="true" style="width: 64px;height: 64px;"></el-image>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="商品名称" width="180" />
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-popconfirm title="是否要删除该记录？" confirmButtonText="确认" cancelButtonText="取消" @confirm="handleDelete(row)">
            <template #reference>
              <el-button text type="primary" size="small" :loading="row.loading">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

  </FormDrawer>


  <ChooseGoods ref="chooseGoodsRef" />

</template>

<script setup>
import FormDrawer from "@/components/FormDrawer.vue";
import { ref } from "vue";
import { getCategoryGoods, deleteCategoryGoods, connectCategoryGoods } from "@/apis/category"
import { toast } from "@/composables/util";
import ChooseGoods from "@/components/ChooseGoods.vue"

const category_id = ref(0)
const tableData = ref([])

const getData = async () => {
  const res = await getCategoryGoods(category_id.value)
  tableData.value = res
}

const formDrawerRef = ref(null)
const open = (data) => {
  category_id.value = data.id
  getData()
  formDrawerRef.value.open()
}

const handleDelete = async (id) => {
  await deleteCategoryGoods(id)
  toast('删除成功')
  getData()
}

const chooseGoodsRef = ref(null)
const handleConnect = () => {
  chooseGoodsRef.value.open(async (goods_ids) => {
    await connectCategoryGoods({
      category_id: category_id.value,
      goods_ids: goods_ids
    })
    getData()
    toast('关联成功')
  })
}

defineExpose({
  open
})
</script>
