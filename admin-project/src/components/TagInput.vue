<template>
  <div class="flex gap-2">
    <!-- 这里需要传入数组，数组通过父组件接收 -->
    <el-tag
      v-for="tag in dynamicTags"
      :key="tag"
      closable
      :disable-transitions="false"
      @close="handleClose(tag)"
    >
      {{ tag }}
    </el-tag>
    <el-input
      v-if="inputVisible"
      ref="InputRef"
      v-model="inputValue"
      class="w-20"
      size="small"
      @keyup.enter="handleInputConfirm"
      @blur="handleInputConfirm"
    />
    <el-button v-else class="button-new-tag" size="small" @click="showInput">
      + 增加值
    </el-button>
  </div>
</template>

<script setup>
import { nextTick, ref } from 'vue'

const props = defineProps({
  modelValue: String
})

const emit = defineEmits(['update:modelValue'])

const inputValue = ref('')
const dynamicTags = ref(props.modelValue ? props.modelValue.split(',' || '，') : [])
const inputVisible = ref(false)
const InputRef = ref()

const handleClose = (tag) => {
  dynamicTags.value.splice(dynamicTags.value.indexOf(tag), 1)
  emit("update:modelValue",dynamicTags.value.join(","))
}

const showInput = () => {
  inputVisible.value = true
  nextTick(() => {
    InputRef.value.input.focus()
  })
}

const handleInputConfirm = () => {
  if (inputValue.value) {

    dynamicTags.value.push(inputValue.value)
    emit('update:modelValue', dynamicTags.value.join(',')) // 表示将数组转化成以什么为分割的字符串
  }
  inputVisible.value = false
  inputValue.value = ''
}
</script>
