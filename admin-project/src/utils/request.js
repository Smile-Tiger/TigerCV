import axios from 'axios'
import { useUserStore } from '@/stores/user';
import { toast } from '@/composables/util'
import { useRouter } from 'vue-router'

const router = useRouter()
const userStore = useUserStore()

const request = axios.create({
  baseURL: '/api',
  timeout: 5000
})

// 添加请求拦截器
request.interceptors.request.use(function (config) {
  // 在发送请求之前做些什么

  //* 从header头自动添加token
  if(userStore.token) {
    config.headers["token"] = userStore.token
  }

  return config;
}, function (error) {
  // 对请求错误做些什么
  return Promise.reject(error);
});

// 添加响应拦截器
request.interceptors.response.use(function (response) {
  // 2xx 范围内的状态码都会触发该函数。
  // 对响应数据做点什么
  return response.data.data;
}, function (error) {
  // 超出 2xx 范围的状态码都会触发该函数。
  // 对响应错误做点什么
  if(error.response.data.msg == "非法token，请先登录！"){
    userStore.clearUserInfo()
    router.push('/login')
  }

  toast(error.response.data.msg || '请求失败', 'error')
  return Promise.reject(error);
});

export default request
