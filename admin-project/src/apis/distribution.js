import request from "@/utils/request"
import { queryParams } from "@/composables/util"

export function getAgentList(page,query = {}){
    let r = queryParams(query)
    return request.get(`/admin/agent/${page}?${r}`)
}

export function getAgentOrderList(page,query = {}){
    let r = queryParams(query)
    return request.get(`/admin/user_bill/${page}?${r}`)
}

export function getAgentStatistics(){
    return request.get("/admin/agent/statistics")
}

export function getConfig(){
    return request.get(`/admin/distribution_setting/get`)
}

export function setConfig(data){
    return request.post(`/admin/distribution_setting/set`,data)
}
