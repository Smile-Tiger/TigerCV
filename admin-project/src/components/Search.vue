<template>
    <el-form :model="model" label-width="80px" class="mb-3" size="small">
    <el-row :gutter="20">
        <slot/>

        <template v-if="showSearch">
            <slot name="show" />
        </template>
        <el-col :span="8" :offset="showSearch ? 0 : 8">
            <div class="flex items-center justify-end">
                <el-button type="primary" @click="$emit('search')">搜索</el-button>
                <el-button @click="$emit('reset')">重置</el-button>
                <el-button type="primary" text @click="showSearch = !showSearch" v-if="hasShowSearch">
                {{ showSearch ? '收起' : "展开" }}
                    <el-icon>
                        <ArrowUp v-if="showSearch"/>
                        <ArrowDown v-else/>
                    </el-icon>
                </el-button>
            </div>
        </el-col>
    </el-row>
    </el-form>
</template>
<script setup>
import { ref,useSlots } from 'vue';
defineProps({
    model:Object
})

defineEmits(["search","reset"])
const showSearch = ref(false)

const slots = useSlots()
const hasShowSearch = ref(!!slots.show)
// 两个叹号表示如果slots.show（show这个名字的插槽）存在，就返回true，否则返回false，返回的结果转换为boolean类型
</script>
