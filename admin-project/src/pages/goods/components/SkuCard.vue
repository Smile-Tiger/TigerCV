<template>
  <el-form-item label="规格选项">
    <el-card shadow="never" class="w-full mb-3" v-for="(item, index) in sku_card_list" :key="index">
      <template #header>
        <div class="flex items-center">
          <el-input v-model="item.text" placeholder="规格名称" style="width:200px;" @change="handleUpdate(item)">
            <template #append>
              <el-icon @click="handleChooseSku(item)">
                <more />
              </el-icon>
            </template>
          </el-input>

          <el-button class="ml-auto" size="small" @click="sortArray('up', index)" :disabled="index === 0"><el-icon>
              <Top />
            </el-icon></el-button>

          <el-button class="ml-auto" size="small" @click="sortArray('down', index)" :disabled="index === sku_card_list.length - 1"><el-icon>
              <Bottom />
            </el-icon></el-button>

          <el-popconfirm title="是否要删除该选项？" confirmButtonText="确认" cancelButtonText="取消" @confirm="handleDelete(item)">
            <template #reference>
              <el-button size="small"><el-icon>
                  <Delete />
                </el-icon></el-button>
            </template>
          </el-popconfirm>

        </div>
      </template>
      <!-- 这块是每个规格的规格值部分 -->
      <SkuCardItem :skuCardId="item.id" />
    </el-card>
    <el-button type="success" size="small" :loading="btnLoading" @click="addSkuCardEvent">添加规格选项</el-button>

  </el-form-item>
  <ChooseSku ref="ChooseSkuRef" />
</template>
<script setup>
import {
  sku_card_list,
  btnLoading,
  addSkuCardEvent,
  handleUpdate,
  handleDelete,
  sortArray,
  handleChooseSetGoodsSkusCard
} from '@/composables/useSKu';
import SkuCardItem from "@/pages/goods/components/SkuCardItem.vue"
import ChooseSku from '@/components/ChooseSku.vue';
import { ref } from 'vue';

const ChooseSkuRef = ref(null)
const handleChooseSku = (item) => {
  ChooseSkuRef.value.open((value) => {
    handleChooseSetGoodsSkusCard(item.id, {
      name: value.name,
      value: value.list
    })
  })
}
</script>

<style>
.el-card__header {
  @apply !p-2 bg-gray-50;
}
</style>
