<template>
  <div>
    <el-tabs v-model="searchForm.tab" @tab-change="getData(1)">
      <el-tab-pane :label="item.name" :name="item.key" v-for="(item, index) in tabbars" :key="index"></el-tab-pane>
    </el-tabs>

    <el-card shadow="never" class="border-0">
      <!-- 搜索 -->
      <Search :model="searchForm" @search="getData" @reset="resetSearchForm">
        <SearchItem label="订单编号">
          <el-input v-model="searchForm.no" placeholder="订单编号" clearable></el-input>
        </SearchItem>
        <template #show>
          <SearchItem label="收货人">
            <el-input v-model="searchForm.name" placeholder="收货人" clearable></el-input>
          </SearchItem>
          <SearchItem label="手机号">
            <el-input v-model="searchForm.phone" placeholder="手机号" clearable></el-input>
          </SearchItem>
          <SearchItem label="开始时间">
            <el-date-picker v-model="searchForm.starttime" type="date" placeholder="开始日期" style="width: 90%;"
              value-format="YYYY-MM-DD" />
          </SearchItem>
          <SearchItem label="结束时间">
            <el-date-picker v-model="searchForm.endtime" type="date" placeholder="结束日期" style="width: 90%;"
              value-format="YYYY-MM-DD" />
          </SearchItem>
        </template>
      </Search>

      <!-- 新增|刷新 -->
      <ListHeader layout="refresh,download" @refresh="getData" @download="handleExportExcel">
        <el-button type="danger" size="small" @click="handleMultiDelete"
          :disabled="selections.length === 0">批量删除</el-button>
      </ListHeader>

      <el-table ref="multipleTableRef" @selection-change="handleSelectionChange" :data="tableData" stripe
        style="width: 100%" v-loading="loading">
        <el-table-column type="selection" width="55" />
        <el-table-column label="商品" width="300">
          <template #default="{ row }">
            <div>
              <div class="flex text-sm">
                <div class="flex-1">
                  <p>订单号：</p>
                  <small>{{ row.no }}</small>
                </div>
                <div>
                  <p>下单时间：</p>
                  <small>{{ row.create_time }}</small>
                </div>
              </div>
              <div class="flex py-2" v-for="(item, index) in row.order_items" :key="index">
                <el-image :src="item.goods_item ? item.goods_item.cover : ''" fit="cover" :lazy="true"
                  style="width: 30px;height: 30px;"></el-image>
                <p class="text-blue-500 ml-2">
                  {{ item.goods_item ? item.goods_item.title : '商品已被删除' }}
                </p>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="实际付款" width="120" prop="total_price" align="center" />
        <el-table-column align="center" label="买家" width="120">
          <template #default="{ row }">
            <p>{{ row.user.nickname || row.user.username }}</p>
            <small>(用户ID：{{ row.user.id }})</small>
          </template>
        </el-table-column>
        <el-table-column label="交易状态" width="170" align="center">
          <template #default="{ row }">
            <div>
              付款状态：
              <el-tag v-if="row.payment_method == 'wechat'" type="success" size="small">微信支付</el-tag>
              <el-tag v-else-if="row.payment_method == 'alipay'" size="small">支付宝支付</el-tag>
              <el-tag v-else type="info" size="small">未支付</el-tag>
            </div>
            <div>
              发货状态：
              <el-tag :type="row.ship_data ? 'success' : 'info'" size="small">{{ row.ship_data ? '已发货' : '未发货'
                }}</el-tag>
            </div>
            <div>
              收货状态：
              <el-tag :type="row.ship_status == 'received' ? 'success' : 'info'" size="small">{{ row.ship_status ==
                'received' ? '已收货' : '未收货' }}</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center">
          <template #default="{ row }">
            <el-button class="px-1" type="primary" size="small" text @click="openInfoModal(row)">订单详情</el-button>
            <el-button v-if="searchForm.tab === 'noship'" class="px-1" type="primary" size="small" text>订单发货</el-button>
            <el-button v-if="searchForm.tab === 'refunding'" class="px-1" type="primary" size="small" text
              @click="handleRefund(row.id, 1)">同意退款</el-button>
            <el-button v-if="searchForm.tab === 'refunding'" class="px-1" type="primary" size="small" text
              @click="handleRefund(row.id, 0)">拒绝退款</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="flex items-center justify-center mt-5">
        <el-pagination background layout="prev, pager ,next" :total="total" :current-page="currentPage"
          :page-size="limit" @current-change="getData" />
      </div>
    </el-card>

    <ExportExcel :tabs="tabbars" ref="ExportExcelRef" />

    <InfoModal ref="InfoModalRef" :info="info" />
    <ExportExcel :tabs="tabbars" ref="ExportExcelRef" />
  </div>
</template>

<script setup>
import ListHeader from '@/components/ListHeader.vue'
import { getOrderList, deleteOrder, refundOrder } from '@/apis/order'
import { onMounted, ref } from 'vue';
import { showModal, toast, showPrompt } from '@/composables/util';
import SearchItem from '@/components/SearchItem.vue';
import Search from '@/components/Search.vue';
import InfoModal from '@/pages/order/InfoModal.vue'
import ExportExcel from '@/pages/order/ExportExcel.vue'

const limit = ref(10)
const total = ref(0)
const currentPage = ref(1)
const tableData = ref([])
const loading = ref(false)
const selections = ref([])

const tabbars = [
  {
    key: "all",
    name: "全部"
  }, {
    key: "nopay",
    name: "待支付"
  }, {
    key: "noship",
    name: "待发货"
  }, {
    key: "shiped",
    name: "待收货"
  }, {
    key: "received",
    name: "已收货"
  }, {
    key: "finish",
    name: "已完成"
  }, {
    key: "closed",
    name: "已关闭"
  }, {
    key: "refunding",
    name: "退款中"
  }
]

const searchForm = ref({
  no: "",
  tab: "all",
  starttime: "",
  endtime: "",
  name: "",
  phone: ""
})

const getData = async (p = currentPage.value) => {
  if (typeof p === 'number') { currentPage.value = p }
  loading.value = true
  const params = { ...searchForm.value }
  for (const key in searchForm.value) {
    if (!params[key]) delete params[key]
  }
  const res = await getOrderList(p, params)
  loading.value = false
  total.value = res.totalCount
  tableData.value = res.list
}

const resetSearchForm = () => {
  for (const key in searchForm.value) {
    searchForm.value[key] = ''
  }
  getData()
}

const handleSelectionChange = (row) => selections.value = row.map(o => o.id)

const handleMultiDelete = async () => {
  await deleteOrder(selections.value)
  toast('删除成功')
  getData()
}

const InfoModalRef = ref(null)
const info = ref({})
const openInfoModal = (row) => {
  row.order_items = row.order_items.map(o => {
    if (o.goods_skus && o.skus_type === 1) {
      o.skus = (Object.keys(o.goods_skus.skus)
        .map(key => o.goods_skus.skus[key])) // 第一段返回skus的对象数组
        .map(sku => sku.value).join(',') // 这里取skus的value值进行拼接字符串
    }
    return o
  })
  info.value = row
  InfoModalRef.value.open(row)
}

// 退款功能
const handleRefund = async (id, type) => {
  try {
    // 两个提示框是个promise对象
    const res = await (type === 1 ? showModal("是否要同意该订单退款?") : showPrompt("请输入拒绝的理由"))
    if (type === 1) {
      await refundOrder(id, { agree: type })
    } else {
      res.value ? await refundOrder(id, { agree: type, disagree_reason: res.value }) : toast('拒绝理由不能为空', 'error')
    }
  } catch {
    toast('用户取消操作')
  }
}

const ExportExcelRef = ref(null)
const handleExportExcel = () => ExportExcelRef.value.open()

onMounted(() => getData())
</script>
