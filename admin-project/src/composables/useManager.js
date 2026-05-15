import { getUpdatePasswordAPI, getLogoutAPI } from '@/apis/login'
import { reactive, ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { toast } from '@/composables/util'
import { useRouter } from 'vue-router'
import { showModal } from '@/composables/util'

export const useRepassword = () => {
  const router = useRouter()
  const userStore = useUserStore()
  const formDrawerRef = ref(null)// 这个可以直接获取组件，并利用它的value进行调用组件里面的方法和属性

  const form = reactive({
    oldPassword: '',
    password: '',
    repassword: ''
  })

  const rules = {
    oldPassword: [
      {
        required: true,
        message: '旧密码不能为空',
        trigger: 'blur'
      },
    ],
    password: [
      {
        required: true,
        message: '新密码不能为空',
        trigger: 'blur'
      },
    ],
    repassword: [
      {
        required: true,
        message: '确认密码不能为空',
        trigger: 'blur'
      },
    ]
  }

  const formRef = ref(null)
  const onSubmit = () => {
    formRef.value.validate(async (valid) => {
      if (!valid) { return false }

      formDrawerRef.value.showLoading()
      await getUpdatePasswordAPI(form)
      userStore.clearUserInfo()
      formDrawerRef.value.hideLoading()
      router.push('/login')
      toast("修改密码成功，请重新登录")
    })
  }

  const openRePasswordForm = () => formDrawerRef.value.open()

  return {
    form,
    rules,
    formRef,
    onSubmit,
    formDrawerRef,
    openRePasswordForm
  }
}

export const useLogout = () => {
  const router = useRouter()
  const userStore = useUserStore()
  const Logout = () => {
    showModal("是否要退出登录").then(async () => {
      await getLogoutAPI()
      userStore.clearUserInfo()
      toast("退出登录成功")
      router.push("/login")
    })
  }

  return {
    Logout
  }
}
