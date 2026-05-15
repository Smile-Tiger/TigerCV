import request from '@/utils/request'
import { queryParams } from "@/composables/util"

export function getOrderList(page,query = {}){
    let r = queryParams(query)
    return request.get(`/admin/order/${page}?${r}`)
}


export function deleteOrder(ids){
    return request.post(`/admin/order/delete_all`,{
        ids
    })
}

export function exportOrder(query = {}){
    let r = queryParams(query)
    return request.post(`/admin/order/excelexport?${r}`,{}, {
        responseType:"blob" // 这里声明返回的是一个文件
    })
}

export function getShipInfo(id){
    return request.get(`/admin/order/${id}/get_ship_info`)
}

export function refundOrder(id,data){
    return request.post(`/admin/order/${id}/handle_refund`,data)
}
