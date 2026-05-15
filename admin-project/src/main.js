import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'virtual:windi.css'
import App from './App.vue'
import router from './router'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const app = createApp(App)
app.use(ElementPlus)
app.use(createPinia().use(piniaPluginPersistedstate))
app.use(router)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }

// 全局引入前置首位
import '@/utils/permission'

import "nprogress/nprogress.css"

// 全局引入自定义指令
import permission from '@/directives/permission'

app.use(permission)

app.mount('#app')
