// 前置守卫
import { toast, showFullLoading, hideFullLoading } from "@/composables/util";
import router from "@/router";
import { addRoutes } from '@/router/index'
import { useUserStore } from "@/stores/user";


// from表示从哪里来，to是到哪里去（写了push的时候会自动存入）
router.beforeEach((to, from, next) => {

  showFullLoading()

  const token = useUserStore().token

  // 没有登录时，强制回到登录页
  if (!token && to.path != '/login') {
    toast('请先登录', 'error')
    return next('/login')
  }

  // 已经登录，避免重复登录
  if (token && to.path == '/login') {
    toast('您已登录，无需重复登录', 'warning')
    return next({ path: from.path ? from.path : '/' })
  }


  // ？？？待解决问题：添加路由后，点击到指定路由刷新后丢失

  // 如果登录，添加路由
  // 在这里添加路由是为了方便调用next
  // 由于新增加的路由与当前位置相匹配，就需要你用 router.push() 或 router.replace() 来手动导航，才能显示该新路由
  if (token) {
    addRoutes(useUserStore().userInfo.menus)
  }

  // 默认放行，根据上面的return进行执行，如果不放行默认是阻止页面跳转
  next()
})

// 后置守卫
router.afterEach(() => hideFullLoading())


