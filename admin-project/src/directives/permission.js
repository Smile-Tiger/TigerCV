// 利用自定义指令，根据用户的权限，完成元素是否渲染功能
import { useUserStore } from '@/stores/user'

export default {
  install(app){
    app.directive('permission', {
      mounted(el, binding){
        const userStore = useUserStore()
        const routeList = userStore.userInfo.ruleNames
        const isShow = routeList.includes(binding.value)
        if(!isShow){
          el.parentNode.removeChild(el)
        }
      }
    })
  }
}
