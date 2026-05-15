import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * 低代码工作台页面的基础状态。
 * 仅用于 UI 展示，不包含拖拽、属性绑定、代码生成等业务能力。
 */
export const useWorkbenchStore = defineStore('workbench', () => {
  const materialGroups = ref([
    {
      title: '基础组件',
      items: ['按钮 Button', '输入框 Input', '选择器 Select', '文本 Text'],
    },
    {
      title: '布局组件',
      items: ['行容器 Row', '列容器 Col', '卡片 Card', '分割线 Divider'],
    },
  ])

  const selectedComponentName = ref('按钮 Button')
  const canvasBlocks = ref(['页面头部区域', '内容占位区域'])

  function setSelectedComponent(name) {
    selectedComponentName.value = name
  }

  return {
    materialGroups,
    selectedComponentName,
    canvasBlocks,
    setSelectedComponent,
  }
})
