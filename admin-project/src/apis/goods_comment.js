import request from '@/utils/request'
import { queryParams } from "@/composables/util"

export function getGoodsCommentList(page,query = {}){
    let r = queryParams(query)
    return request.get(`/admin/goods_comment/${page}?${r}`)
}


export function updateGoodsCommentStatus(id,status){
    return request.post(`/admin/goods_comment/${id}/update_status`,{
        status
    })
}

export function reviewGoodsComment(id,data){
    return request.post(`/admin/goods_comment/review/${id}`,{
        data
    })
}

