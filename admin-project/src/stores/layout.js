import { ref } from "vue";
import { defineStore } from 'pinia'
import { useUserStore } from "./user";
import { useRoute, useRouter } from "vue-router";

export const useLayoutStore = defineStore('layout', () => {
  const route = useRoute()
  const router = useRouter()

  // 侧边栏
  // 侧边栏展开功能
  const asideWidth = ref('250px')

  const handleAsideWidth = () => {
    asideWidth.value === '250px' ? asideWidth.value = '64px' : asideWidth.value = '250px'
  }

  //侧边栏的内容获取
  const userStore = useUserStore()
  const menus = ref(userStore.userInfo.menus)
  const ruleNames = ref(userStore.userInfo.ruleNames)


  // 标签导航栏
  const activeTab = ref(route.path)

  const tabList = ref([
    {
      title: '后台首页',
      path: '/'
    }
  ])

  const addTab = (tab) => {
    let t = tabList.value.find(e => e.path === tab.path)
    if (!t) tabList.value.push(tab)
    activeTab.value = tab.path
  }

  const changeTab = (tab) => {
    router.push(tab)
  }

  const removeTab = (t) => {
    // 确保首页标签不会被删除
    if (t === '/') {
      return
    }

    let tabs = tabList.value
    let a = activeTab.value

    if (a === t) {
      tabs.forEach((tab, index) => {
        if (tab.path === t) {
          const lastTab = tabs[index - 1]
          a = lastTab.path
        }
      })
    }

    activeTab.value = a
    tabList.value = tabList.value.filter(tab => tab.path !== t)

    router.push(a)
  }

  const handleClose = (c) => {
    if ( c === 'clearOther') {
      tabList.value = tabList.value.filter(tab => tab.path === '/' || tab.path === activeTab.value )
    }else if ( c === 'clearAll') {
      activeTab.value = '/'
      tabList.value = [{
        title: '后台首页',
        path: '/'
      }]
    }
  }

  return {
    asideWidth,
    handleAsideWidth,
    menus,
    ruleNames,
    tabList,
    addTab,
    changeTab,
    removeTab,
    activeTab,
    handleClose
  }
}, {
  persist: true
})
