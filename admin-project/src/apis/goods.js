import request from "@/utils/request"
import { queryParams } from "@/composables/util"

export function getGoodsListAPI(page,query = {}){
    let r = queryParams(query)
    return request.get(`/admin/goods/${page}?${r}`)
}


export function updateGoodsStatusAPI(ids,status){
    return request.post(`/admin/goods/changestatus`,{
        ids,
        status
    })
}


export function createGoodsAPI(data){
    return request.post(`/admin/goods`,data)
}

export function updateGoodsAPI(id,data){
    return request.post(`/admin/goods/${id}`,data)
}

export function deleteGoodsAPI(ids){
    return request.post(`/admin/goods/delete_all`,{
        ids
    })
}

export function restoreGoods(ids){
    return request.post(`/admin/goods/restore`,{
        ids
    })
}

// 彻底删除商品
export function destroyGoods(ids){
    return request.post(`/admin/goods/destroy`,{
        ids
    })
}

export function readGoods(id){
    return request.get(`/admin/goods/read/${id}`)
}

export function setGoodsBanner(id,data){
    return request.post(`/admin/goods/banners/${id}`,data)
}

export function updateGoodsSkusAPI(id,data){
    return request.post(`/admin/goods/updateskus/${id}`,data)
}


export function createGoodsSkusCardAPI(data){
    return request.post(`/admin/goods_skus_card`,data)
}


export function updateGoodsSkusCardAPI(id,data){
    return request.post(`/admin/goods_skus_card/${id}`,data)
}

export function deleteGoodsSkusCardAPI(id){
    return request.post(`/admin/goods_skus_card/${id}/delete`)
}

export function sortGoodsSkusCard(data){
    return request.post(`/admin/goods_skus_card/sort`,data)
}

export function createGoodsSkusCardValue(data){
    return request.post(`/admin/goods_skus_card_value`,data)
}

export function updateGoodsSkusCardValue(id,data){
    return request.post(`/admin/goods_skus_card_value/${id}`,data)
}

export function deleteGoodsSkusCardValue(id){
    return request.post(`/admin/goods_skus_card_value/${id}/delete`)
}

export function chooseAndSetGoodsSkusCard(id,data){
    return request.post(`/admin/goods_skus_card/${id}/set`,data)
}
