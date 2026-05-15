// api接口地址dishaxy.dishait.cn/shopadminapi

import request from "@/utils/request";

export const getLoginAPI = (data) => {
  return request({
    url: '/admin/login',
    method: 'POST',
    data
  })
}

export const getUserInfoAPI = () => {
  return request({
    url: '/admin/getinfo',
    method: 'POST',

  })
}

export const getLogoutAPI = () => {
  return request({
    url: '/admin/logout',
    method: 'POST',
  })
}

export const getUpdatePasswordAPI = (data) => {
  return request({
    url: '/admin/updatepassword',
    method: 'POST',
    data
  })
}
