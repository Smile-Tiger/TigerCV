import request from "@/utils/request";

export const getNoticeListAPI = (page) => {
  return request({
    url: `/admin/notice/${page}`,
    method: 'GET'
  })
}

export const getDeleteNoticeAPI = (id) => {
  return request({
    url: `/admin/notice/${id}/delete`,
    method: 'POST'
  })
}

export const getUpdateNoticeAPI = (id,data) => {
  return request({
    url: `/admin/notice/${id}`,
    method: 'POST',
    data
  })
}

export const getAddNoticeAPI = (data) => {
  return request({
    url: `/admin/notice`,
    method: 'POST',
    data
  })
}
