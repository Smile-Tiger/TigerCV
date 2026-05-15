import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      name: 'admin',
      path: '/',
      component: () => import('@/layouts/admin.vue'),
    },
    {

      path: '/login',
      component: () => import('@/pages/login.vue'),
      meta: {
        title: '登录页',
      }
    },


    // 404错误页面
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/pages/404.vue'),
    }
  ],
})

// 动态路由，用于匹配菜单动态添加路由
const asyncRoutes = [{
  path: "/",
  component: () => import('@/pages/index.vue'),
  meta: {
    title: '后台首页',
  }
},
{
  path: "/goods/list",
  component: () => import('@/pages/goods/list.vue'),
  meta: {
    title: '商品列表',
  }
},
{
  path: "/user/list",
  component: () => import('@/pages/user/list.vue'),
  meta: {
    title: '用户列表',
  }
},
{
  path: "/order/list",
  component: () => import('@/pages/order/list.vue'),
  meta: {
    title: '订单列表',
  }
},
{
  path: "/category/list",
  component: () => import('@/pages/category/list.vue'),
  meta: {
    title: '分类列表',
  }
},
{
  path: "/comment/list",
  component: () => import('@/pages/comment/list.vue'),
  meta: {
    title: '评论列表',
  }
},
{
  path: "/coupon/list",
  component: () => import('@/pages/coupon/list.vue'),
  meta: {
    title: '优惠券列表',
  }
},
{
  path: "/image/list",
  component: () => import('@/pages/image/list.vue'),
  meta: {
    title: '图片列表',
  }
},
{
  path: "/notice/list",
  component: () => import('@/pages/notice/list.vue'),
  meta: {
    title: '通知列表',
  }
},
{
  path: "/setting/base",
  component: () => import('@/pages/setting/base.vue'),
  meta: {
    title: '基础设置',
  }
}, {
  path: "/manager/list",
  component: () => import('@/pages/manager/list.vue'),
  meta: {
    title: '用户管理',
  }
}, {
  path: "/access/list",
  component: () => import('@/pages/access/list.vue'),
  meta: {
    title: "菜单权限管理"
  }
}, {
    path: "/role/list",
    component: () => import('@/pages/role/list.vue'),
    meta: {
        title: "角色管理"
    }
},
{
  path: "/skus/list",
  component: () => import('@/pages/skus/list.vue'),
  meta: {
    title: '商品规格列表',
  }
},
{
  path: "/level/list",
  component: () => import('@/pages/level/list.vue'),
  meta: {
    title: '会员列表',
  }
},{
    path:"/setting/buy",
    component: () => import('@/pages/setting/buy.vue'),
    meta:{
        title:"支付设置"
    }
},{
    path:"/setting/ship",
    component: () => import('@/pages/setting/ship.vue'),
    meta:{
        title:"物流设置"
    }
},{
    path:"/distribution/index",
    component: () => import('@/pages/distribution/index.vue'),
    meta:{
        title:"分销员管理"
    }
},{
    path:"/distribution/setting",
    component: () => import('@/pages/distribution/setting.vue'),
    meta:{
        title:"分销设置"
    }
}
]

// 动态从返回后端获取路由，利用递归
export const addRoutes = (menus) => {
  let hasNewRoutes = false
  const findAndAddRoutesByMenus = (arr) => {
    arr.forEach(e => {
      let item = asyncRoutes.find(o => o.path === e.frontpath)
      // 判断还是不是不属于路由数组中的一员
      if (item && !router.hasRoute(item.path)) {
        router.addRoute('admin', item)
        hasNewRoutes = true
      }
      if (e.child && e.child.length > 0) {
        findAndAddRoutesByMenus(e.child)
      }
    })
  }
  findAndAddRoutesByMenus(menus)

  return hasNewRoutes
}

export default router
