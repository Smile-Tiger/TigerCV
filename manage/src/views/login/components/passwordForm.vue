<script setup lang="ts">
import type { FormInstance, FormRules } from "element-plus";
import type { UserRuleForm } from "@/interface/login";
import { reactive, ref, onBeforeMount } from "vue";
import { captchaImage } from "@/apis/login";
import { loginByJson } from "@/apis/login";
import { Encrypt } from "@/utils/aes";
import { ElMessage } from "element-plus";

const ruleFormRef = ref<FormInstance>();
const ruleForm = reactive({
  username: "",
  password: "",
  key: "",
  captcha: "",
});

const rules = reactive<FormRules<UserRuleForm>>({
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
    ]
})

// 图形验证码获取
const captchaUrl = ref<string>('')

const getCaptchaImage = async () => {
  const key = new Date().getTime().toString()
  ruleForm.key = key
  const res = await captchaImage(key)
  const blob = new Blob([res],{type:'application/vnd.ms-excel'}); // 解析返回值
  const imgUrl = URL.createObjectURL(blob); // 生成图片url
  console.log('生成的图片URL:', imgUrl)
  captchaUrl.value = imgUrl
}

onBeforeMount(() => {
  getCaptchaImage()
})

//登录
const login = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.validate(async (valid) => {
    if (valid) {
      const res = await loginByJson({
        username:Encrypt(ruleForm.username),
        password:Encrypt(ruleForm.password),
        key:ruleForm.key,
        captcha:ruleForm.captcha
      })
      if( res.code != '200' ){
        ElMessage.error(res.msg);
        return;
      }
    } else {
        ElMessage.warning('请填写正确内容');
        return;
    }
  })
}
</script>

<template>
    <el-form
        ref="ruleFormRef"
        :model="ruleForm"
        :rules="rules"
        label-width="0"
        size="large"
    >
        <el-form-item prop="username">
            <el-input v-model="ruleForm.username" prefix-icon="user" clearable placeholder="请输入用户名"></el-input>
        </el-form-item>

        <el-form-item prop="password">
            <el-input v-model="ruleForm.password" prefix-icon="lock" clearable show-password  placeholder="请输入用户名"></el-input>
        </el-form-item>


        <el-form-item>
            <div class="box-code">
                <el-input v-model="ruleForm.captcha" prefix-icon="CircleCheck" clearable placeholder="请输入验证码"></el-input>
                <el-image class='code' :src="captchaUrl" @click="getCaptchaImage"></el-image>
            </div>
        </el-form-item>

        <div class="remember">
            <div>
                <el-checkbox label="记住密码"></el-checkbox>
            </div>
            <div>
                <router-link to="">忘记密码?</router-link>
            </div>
        </div>

        <el-form-item>
           <el-button type="primary" round style="width:100%" @click="login(ruleFormRef)">登录</el-button>
        </el-form-item>

    </el-form>
</template>

<style scoped>
.box-code {
  display: flex;
  align-items: center;
  width: 100%;
}
.code {
  margin-left: 10px;
  height: 40px;
  width: 100px;
  cursor: pointer;
}
.remember {
  font-size: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
</style>
