import request from "@/utils/request"

export const getManagerListAPI = (page, query = {}) => {
  return request({
    url: `/admin/manager/${page}?limit=${query.limit}&keyword=${query.keyword}`,
    method: 'GET'
  })
}

// export function getManagerList(page,query = {}){
//     let q = []
//     for (const key in query) {
//         if(query[key]){
//             q.push(`${key}=${encodeURIComponent(query[key])}`)
//         }
//     }
//     let r = q.join("&")
//     r = r ? ("?"+r) : ""

//     return request.get(`/admin/manager/${page}${r}`)
// }

export const getAddManagerAPI = (data) => {
  return request({
    url: `/admin/manager`,
    method: 'POST',
    data
  })
}

export const getDeleteManagerAPI = (id) => {
  return request({
    url: `/admin/manager/${id}/delete`,
    method: 'POST'
  })
}

export const getUpdateManagerAPI = (id, data) => {
return request({
    url: `/admin/manager/${id}`,
    method: 'POST',
    data
  })
}

export const getUpdateStatusAPI = (id, status) => {
  return request({
    url: `/admin/manager/${id}/update_status`,
    method: 'POST',
    data: {
      status
    }
  })
}
