import request from '@/utils/request'

export function getSkusListAPI(page){
    return request.get(`/admin/skus/${page}`)
}

export function createSkusAPI(data){
    return request.post("/admin/skus",data)
}

export function updateSkusAPI(id,data){
    return request.post("/admin/skus/"+id,data)
}

export function deleteSkusAPI(ids){
    ids = !Array.isArray(ids) ? [ids] : ids // 保证单个或者多个都能用数组存储
    return request.post(`/admin/skus/delete_all`,{ ids })
}

export function updateSkusStatusAPI(status, id){
    return request.post(`/admin/skus/${id}/update_status`,{
        status
    })
}
