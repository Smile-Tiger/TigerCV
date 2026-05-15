<template>
  {{ d.num.toFixed(0) }}
</template>

<script setup>
// 利用gsap完成数字滚动效果

import { ref } from 'vue'
import gsap from "gsap"

const props = defineProps({
  value: {
    type: Number,
    default: 0
  }
})

const d = ref({
  num: 0
})

const countAdd = () => {
  gsap.to(d.value,{
    duration: 0.5,
    num: props.value,
  })
}

countAdd()


</script>
