import { ref } from 'vue'
import { defineStore } from 'pinia'


export const useUserStore = defineStore('user', () => {
  const token = ref(null)
  const userInfo = ref(null)

  // 设置
  const setToken = (newToken) => {
    token.value = newToken
  }
  const setUserInfo = (newUserInfo) => {
    userInfo.value = newUserInfo
  }

  // 清空用户信息
  const clearUserInfo = () => {
    token.value = null
    userInfo.value = null
  }

  return {
    token,
    setToken,
    userInfo,
    setUserInfo,
    clearUserInfo
  }
},
  {
    persist: {
      enabled: true,
      storage: localStorage,
      key: 'user'
    }
  })
