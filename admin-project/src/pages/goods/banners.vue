<template>
  <el-drawer title="设置轮播图" v-model="dialogVisible" size="50%" destroy-on-close>
    <el-form :model="form" label-width="80px">
      <el-form-item label="轮播图">
        <ChooseImage :limit="9" v-model="form.banners" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submit" :loading="loading">提交</el-button>
      </el-form-item>
    </el-form>
  </el-drawer>
</template>

<script setup>
import { readGoods, setGoodsBanner } from '@/apis/goods';
import { ref } from 'vue';
import ChooseImage from '@/components/ChooseImage.vue'
import { toast } from '@/composables/util';

const dialogVisible = ref(false)

const form = ref({
  banners: []
})

const goodsId = ref(0)
const open = async (row) => {
  row.bannersLoading = true
  goodsId.value = row.id
  const res = await readGoods(goodsId.value)
  form.value.banners = res.goodsBanner.map(o => o.url)
  dialogVisible.value = true
  row.bannersLoading = false
}

const emit = defineEmits(['reloadData'])
const loading = ref(false)
const submit = async () => {
  loading.value = true
  await setGoodsBanner(goodsId.value, form.value)
  toast('设置成功')
  dialogVisible.value = false
  emit('reloadData')
}

defineExpose({
  open
})
</script>
