<template>
  <div>
    <el-tabs v-model="searchForm.tab" @tab-change="getData">
      <el-tab-pane :label="item.name" :name="item.key" v-for="(item, index) in tabbars" :key="index"></el-tab-pane>
    </el-tabs>

    <el-card shadow="never" class="border-0">
      <!-- 搜索 -->
      <Search :model="searchForm" @search="getData" @reset="resetSearchForm">
        <SearchItem label="关键词">
          <el-input v-model="searchForm.title" placeholder="商品名称" clearable></el-input>
        </SearchItem>
        <!-- 带名字的插槽叫具名插槽 -->
        <template #show>
          <SearchItem label="商品分类">
            <el-select v-model="searchForm.category_id" placeholder="请选择商品分类" clearable>
              <el-option v-for="item in category_list" :key="item.id" :label="item.name" :value="item.id">
              </el-option>
            </el-select>
          </SearchItem>
        </template>
      </Search>

      <!-- 新增|刷新 -->
       <!-- 在组件内书写内容，要意识到使用插槽 -->
      <ListHeader layout="create,delete,refresh" @create="handleCreate" @refresh="getData" @delete="handleMultiDelete"
        :selection="selection">
        <el-button type="warning" size="small" @click="handleRestoreGoods" v-if="searchForm.tab === 'delete'" :disabled="selection.length === 0">恢复商品</el-button>
        <el-button size="small" @click="handleMultiStatusChange(1)"
          v-if="searchForm.tab == 'all' || searchForm.tab == 'off'">上架</el-button>
        <el-button size="small" @click="handleMultiStatusChange(0)"
          v-if="searchForm.tab == 'all' || searchForm.tab == 'saling'">下架</el-button>
      </ListHeader>

      <el-table ref="multipleTableRef" @selection-change="handleSelectionChange" :data="tableData" stripe
        style="width: 100%" v-loading="loading">
        <el-table-column type="selection" width="55" />
        <el-table-column label="商品" width="300">
          <template #default="{ row }">
            <div class="flex">
              <el-image class="mr-3 rounded" :src="row.cover" fit="cover" :lazy="true" style="width:50px;height: 50px;">
              </el-image>
              <div class="flex-1">
                <p>{{ row.title }}</p>
                <div>
                  <span class="text-rose-500">￥{{ row.min_price }}</span>
                  <el-divider direction="vertical" />
                  <span class="text-gray-500 text-xs">￥{{ row.min_oprice }}</span>
                </div>
                <p class="text-gray-400 text-xs mb-1">分类:{{ row.category ? row.category.name : "未分类" }}</p>
                <p class="text-gray-400 text-xs">创建时间：{{ row.create_time }}</p>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="实际销量" width="70" prop="sale_count" align="center" />
        <el-table-column label="商品状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status ? 'success' : 'danger'" size="small">{{ row.status ? '上架' : '仓库' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="审核状态" width="120" align="center" v-if="searchForm.tab != 'delete'">
          <template #default="{ row }">
            <div class="flex flex-col" v-if="row.ischeck == 0">
              <el-button type="success" size="small" plain>审核通过</el-button>
              <el-button class="mt-2 !ml-0" type="danger" size="small" plain>审核拒绝</el-button>
            </div>
            <span v-else>{{ row.ischeck == 1 ? '通过' : '拒绝' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="总库存" width="90" prop="stock" align="center" />
        <el-table-column label="操作" align="center">
          <template #default="scope">
            <div v-if="searchForm.tab != 'delete'">
              <el-button class="px-1" type="primary" size="small" text @click="handleEdit(scope.row)">修改</el-button>

              <el-button
              :type=" (scope.row.sku_type == 0 && !scope.row.sku_value) || (scope.row.sku_type == 1 && !scope.row.goods_skus.length) ? 'danger' : 'primary'"
               class="px-1" size="small" text
              :loading="scope.row.skusLoading"
              @click="handleSetGoodsSkus(scope.row)">商品规格</el-button>

              <el-button class="px-1" :type="scope.row.goods_banner.length == 0 ? 'danger' : 'primary'" size="small" text @click="handleSetGoodsBanners(scope.row)" :loading="scope.row.bannersLoading">设置轮播图</el-button>

              <el-button class="px-1" :type="!scope.row.content ? 'danger' : 'primary'" size="small" text  :loading="scope.row.contentLoading">商品详情</el-button>

              <el-popconfirm title="是否要删除该商品？" confirmButtonText="确认" cancelButtonText="取消"
                @confirm="handleDelete(scope.row.id)">
                <template #reference>
                  <el-button class="px-1" text type="primary" size="small">删除</el-button>
                </template>
              </el-popconfirm>
            </div>
            <span v-else>暂无操作</span>
          </template>
        </el-table-column>
      </el-table>

      <div class="flex items-center justify-center mt-5">
        <el-pagination background layout="prev, pager ,next" :total="total" :current-page="currentPage"
          :page-size="limit" @current-change="getData" />
      </div>

      <FormDrawer ref="formDrawerRef" :title="drawerTitle" @submit="handleSubmit">
        <el-form :model="form" ref="formRef" :rules="rules" label-width="80px" :inline="false">
          <el-form-item label="商品名称" prop="title">
            <el-input v-model="form.title" placeholder="请输入商品名称，不能超过60个字符"></el-input>
          </el-form-item>
          <el-form-item label="封面" prop="cover">
            <ChooseImage v-model="form.cover" />
          </el-form-item>
          <el-form-item label="商品分类" prop="category_id">
            <el-select v-model="form.category_id" placeholder="选择所属商品分类">
              <el-option v-for="item in category_list" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="商品描述" prop="desc">
            <el-input type="textarea" v-model="form.desc" placeholder="选填，商品卖点"></el-input>
          </el-form-item>
          <el-form-item label="单位" prop="unit">
            <el-input v-model="form.unit" placeholder="请输入单位" style="width:50%;"></el-input>
          </el-form-item>
          <el-form-item label="总库存" prop="stock">
            <el-input v-model="form.stock" type="number" style="width:40%;">
              <template #append>件</template>
            </el-input>
          </el-form-item>
          <el-form-item label="库存预警" prop="min_stock">
            <el-input v-model="form.min_stock" type="number" style="width:40%;">
              <template #append>件</template>
            </el-input>
          </el-form-item>
          <el-form-item label="最低销售价" prop="min_price">
            <el-input v-model="form.min_price" type="number" style="width:40%;">
              <template #append>元</template>
            </el-input>
          </el-form-item>
          <el-form-item label="最低原价" prop="min_oprice">
            <el-input v-model="form.min_oprice" type="number" style="width:40%;">
              <template #append>元</template>
            </el-input>
          </el-form-item>
          <el-form-item label="库存显示" prop="stock_display">
            <el-radio-group v-model="form.stock_display">
              <el-radio :label="0">隐藏</el-radio>
              <el-radio :label="1">显示</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="是否上架" prop="status">
            <el-radio-group v-model="form.status">
              <el-radio :label="0">放入仓库</el-radio>
              <el-radio :label="1">立即上架</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </FormDrawer>

    </el-card>

    <Banners ref="bannersRef" @reloadData="getData" />
    <skus ref="skusRef" @reload-data="getData"/>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import FormDrawer from '@/components/FormDrawer.vue';
import { getGoodsListAPI, createGoodsAPI, updateGoodsAPI, deleteGoodsAPI, updateGoodsStatusAPI, restoreGoods, destroyGoods } from '@/apis/goods';
import { toast } from '@/composables/util';
import ListHeader from '@/components/ListHeader.vue'
import { getCategoryList } from '@/apis/category'
import SearchItem from '@/components/SearchItem.vue'
import Search from '@/components/Search.vue'
import ChooseImage from '@/components/ChooseImage.vue';
import Banners from './banners.vue';
import skus from './skus.vue';

const formDrawerRef = ref(null)

const tableData = ref([])
const currentPage = ref(1)
const total = ref(0)
const loading = ref(false)
const limit = ref(10)
const tabbars = [{
  key: "all",
  name: "全部"
}, {
  key: "checking",
  name: "审核中"
}, {
  key: "saling",
  name: "出售中"
}, {
  key: "off",
  name: "已下架"
}, {
  key: "min_stock",
  name: "库存预警"
}, {
  key: "delete",
  name: "回收站"
}]
const searchForm = ref({
  title: "",
  tab: "all",
})

const getData = async (p = currentPage.value) => {
  if (typeof p === 'number') currentPage.value = p
  loading.value = true
  // 构建请求参数，排除null值的category_id
  const params = { ...searchForm.value }
  if (!params.category_id) delete params.category_id
  const res = await getGoodsListAPI(currentPage.value, params)
  total.value = res.totalCount
  tableData.value = res.list.map(o => {
    o.bannersLoading = false
    return o
  })
  loading.value = false
}

const formRef = ref(null)
const form = ref({
  title: null, //商品名称
  category_id: null, //商品分类
  cover: null, //商品封面
  desc: null, //商品描述
  unit: "件", //商品单位
  stock: 100, //总库存
  min_stock: 10, //库存预警
  status: 1, //是否上架 0仓库1上架
  stock_display: 1, //库存显示 0隐藏1显示
  min_price: 0, //最低销售价
  min_oprice: 0 //最低原价
})

const rules = {}

const editId = ref(0)
const drawerTitle = computed(() => editId.value === 0 ? "新增公告" : "修改公告")

const handleDelete = async (id) => {
  loading.value = true
  await deleteGoodsAPI([id])
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
  title: null, //商品名称
  category_id: null, //商品分类
  cover: null, //商品封面
  desc: null, //商品描述F
  unit: "件", //商品单位
  stock: 100, //总库存
  min_stock: 10, //库存预警
  status: 1, //是否上架 0仓库1上架
  stock_display: 1, //库存显示 0隐藏1显示
  min_price: 0, //最低销售价
  min_oprice: 0 //最低原价
})
  formDrawerRef.value.open()
}
// 提交部分
const handleSubmit = () => {
  formRef.value.validate(async (valid) => {
    if (!valid) return

    formDrawerRef.value.showLoading()

    const fun = editId.value ? updateGoodsAPI(editId.value, form.value) : createGoodsAPI(form.value)

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

// const handleStatusChange = async (data) => {
//   await updateCouponStatusAPI(data.id)
//   toast("状态更新成功")
//   getData()
// }

// 多选
const selection = ref([])
const handleSelectionChange = (e) => {
  selection.value = e.map(o => o.id)
}

// 批量删除
const handleMultiDelete = async () => {
  if(searchForm.value.tab !== 'delete'){
    await deleteGoodsAPI(selection.value)
    getData()
    toast("加入回收站")
  } else {
    await destroyGoods(selection.value)
    toast("彻底删除成功")
    getData()
  }
}

// 重置表单
const resetSearchForm = () => {
  for(const key in searchForm.value){
    searchForm.value[key] = ''
  }
  searchForm.value.tab = 'all'
  getData()
}

const category_list = ref([]) // 商品分类
getCategoryList().then(res => category_list.value = res)

// 批量修改状态
const handleMultiStatusChange = async (status) => {
  await updateGoodsStatusAPI(selection.value, status)
  getData()
  toast("状态更新成功")
}

// 设置轮播图的内容
const bannersRef = ref(null)
const handleSetGoodsBanners = (row) => bannersRef.value.open(row)

// 设置商品规格部分
const skusRef = ref(null)
const handleSetGoodsSkus = (row) => skusRef.value.open(row)

// 恢复回收站商品
const handleRestoreGoods = async () => {
  await restoreGoods(selection.value)
  toast("恢复成功")
  getData()
}

onMounted(() => {
  getData()
})
</script>
