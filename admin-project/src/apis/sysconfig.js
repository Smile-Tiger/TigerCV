import request from "@/utils/request"
export function getSysconfig(){
    return request.get(`/admin/sysconfig`)
}

export function setSysconfig(data){
    return request.post(`/admin/sysconfig`,data)
}

export const uploadAction = "/api/admin/sysconfig/upload"
