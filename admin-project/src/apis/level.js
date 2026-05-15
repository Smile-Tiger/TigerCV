import request from '@/utils/request'

export function getUserLevelList(page){
    return request.get(`/admin/user_level/${page}`)
}

export function createUserLevel(data){
    return request.post("/admin/user_level",data)
}

export function updateUserLevel(id,data){
    return request.post("/admin/user_level/"+id,data)
}

export function deleteUserLevel(id){
    return request.post(`/admin/user_level/${id}/delete`)
}

export function updateUserLevelStatus(id,status){
    return request.post(`/admin/user_level/${id}/update_status`,{
        status
    })
}
