<template>
    <el-drawer title="导出订单" v-model="dialogVisible" size="40%">
        <el-form :model="form" label-width="80px">
            <el-form-item label="订单类型">
                <el-select v-model="form.tab" placeholder="请选择">
                    <el-option v-for="item in tabs"
                        :key="item.key"
                        :label="item.name"
                        :value="item.key">
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="时间范围">
                <el-date-picker
                    v-model="form.time"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    value-format="YYYY-MM-DD"
                />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="onSubmit" :loading="loading">导出</el-button>
            </el-form-item>
        </el-form>
    </el-drawer>
</template>

<script setup>
import { exportOrder } from "@/apis/order"
import { ref } from "vue"
import { toast } from "@/composables/util"

defineProps({
  tabs: {
    type: Array,
    default: () => []
  }
})

const dialogVisible = ref(false)

const open = () => dialogVisible.value = true
const close = () => dialogVisible.value = false

const form = ref({
  tab: null,
  time: null,
})

const onSubmit = async () => {
  if(!form.value.tab) return toast('请选择订单类型')
  const startTime = null
  const endTime = null
  if(form.value.time){
    startTime = form.value.time[0]
    endTime = form.value.time[1]
  }
  const res = await exportOrder({
    tab: form.value.tab,
    startTime,
    endTime,
  })
  console.log(res)
  const url = window.URL.createObjectURL(new Blob([res])) // 创建一个临时的下载地址，用数组包裹是硬性要求
  const link = document.createElement('a') // 创建一个a标签来放入这个临时地址
  link.style.display = 'none' // 隐藏小a标签
  link.href = url
  const filename = (new Date()).getTime() + '.xlsx'
  link.setAttribute('download', filename) // 给a标签添加下载属性，文件名就是当前时间戳
  document.body.appendChild(link) // 把a标签添加到body中
  link.click() // 模拟点击a标签，触发下载
  document.body.removeChild(link) // 下载完成后移除a标签
  close()
  toast('导出成功')
}

defineExpose({
  open
})
</script>

