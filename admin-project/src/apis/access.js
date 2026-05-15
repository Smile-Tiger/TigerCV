import request from "@/utils/request";

export const getAccessListAPI = (page) => {
  return request({
    url: "/admin/rule/" + page,
    method: "GET",
  })
}

export function getAddAccessAPI(data){
    return request({
        url: "/admin/rule",
        method: "POST",
        data
    })
}

export function getUpdateAccessAPI(id,data){
    return request({
        url: "/admin/rule/"+id,
        method: "POST",
        data
    })
}

export function getStatusChangeAPI(status, data){
    return request({
        url: `/admin/rule/${data.id}/update_status`,
        method: "POST",
        data: {
            status
        }
    })
}

export function getDeleteAccessAPI(id){
    return request({
        url: `/admin/rule/${id}/delete`,
        method: "POST",
    })
}
