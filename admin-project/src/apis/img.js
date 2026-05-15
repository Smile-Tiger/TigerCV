import request from "@/utils/request";

export const getImgListAPI = (data) => {
  return request({
    url: '/admin/image_class/' + data,
    method: 'GET',
  })
}

export const createImgListAPI = (data) => {
  return request({
    url: '/admin/image_class',
    method: 'POST',
    data
  })
}

export const updateImgListAPI = (id,data) => {
  return request({
    url: '/admin/image_class/' + id,
    method: 'POST',
    data
  })
}

export const deleteImgListAPI = (id) => {
  return request({
    url: `/admin/image_class/${id}/delete`,
    method: 'POST',
  })
}

export const getImgAPI = (id, page) => {
  return request({
    url: `/admin/image_class/${id}/image/${page}`,
    method: 'GET',
  })
}

export const updateImgAPI = (id, name) => {
  return request({
    url: `/admin/image/${id}`,
    method: 'POST',
    name
  })
}

export const deleteImgAPI = (ids) => {
  return request({
    url: `/admin/image/delete_all`,
    method: 'POST',
    ids
  })
}

export const uploadImgAPI = '/api/admin/image/upload'
