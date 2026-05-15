<template>
    <el-card shadow="never">
        <template #header>
            <div class="flex justify-between">
                <span class="text-sm">订单统计</span>
                <div>
                    <el-check-tag v-for="(item, index) in options" :key="index" :checked="current == item.value"
                        style="margin-right: 8px" @click="handleChoose(item.value)">{{ item.text }}</el-check-tag>
                </div>
            </div>
        </template>
        <div ref="el" id="chart" style="width: 100%;height: 300px;"></div>
    </el-card>
</template>
<script setup>
import { getStatistic3API } from '@/apis/layout';
import * as echarts from 'echarts'
import { onBeforeMount, onMounted, ref } from 'vue';
import { useResizeObserver } from '@vueuse/core'

const current = ref("week")
const options = [{
    text: "近1个月",
    value: "month"
}, {
    text: "近1周",
    value: "week"
}, {
    text: "近24小时",
    value: "hour"
}]

const handleChoose = (type) => {
    current.value = type
    getData()
}

let myChart = null
onMounted(() => {
  let chart = document.getElementById('chart')
  if(chart){
    myChart = echarts.init(chart)
    getData()
  }
})

onBeforeMount(() => {
  if (myChart) {
    myChart.dispose()
  }
})

const getData = async () => {
  let option = {
      xAxis: {
          type: 'category',
          data: []
      },
      yAxis: {
          type: 'value'
      },
      series: [
          {
              data: [],
              type: 'bar',
              showBackground: true,
              backgroundStyle: {
                  color: 'rgba(180, 180, 180, 0.2)'
              }
          }
      ]
    };


    myChart.showLoading()
    const res = await getStatistic3API(current.value).finally(() => {
      myChart.hideLoading()
    })
    option.xAxis.data = res.x
    option.series[0].data = res.y

    myChart.setOption(option)
}

// vueUse 监听元素变化，完成等比例缩放,el指的是id绑定的标签
const el = ref(null)
useResizeObserver(el, () => {
  if (myChart) {
    myChart.resize()
  }
})
</script>
