import request from "@/utils/request"

export function getRoleListAPI(page){
    return request.get(`/admin/role/${page}`)
}

export function createRoleAPI(data){
    return request.post("/admin/role",data)
}

export function updateRoleAPI(id,data){
    return request.post("/admin/role/"+id,data)
}

export function deleteRoleAPI(id){
    return request.post(`/admin/role/${id}/delete`)
}

export function updateRoleStatusAPI(status, data){
    return request.post(`/admin/role/${data.id}/update_status`,{
        status
    })
}

export function setRoleRulesAPI(id,rule_ids){
    return request.post(`/admin/role/set_rules`,{
        id,rule_ids
    })
}
