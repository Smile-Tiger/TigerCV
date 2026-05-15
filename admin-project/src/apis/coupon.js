import request from "@/utils/request"

export function getCouponListAPI(page){
    return request.get(`/admin/coupon/${page}`)
}

export function createCouponAPI(data){
    return request.post("/admin/coupon",data)
}

export function updateCouponAPI(id,data){
    return request.post("/admin/coupon/"+id,data)
}

export function deleteCouponAPI(id){
    return request.post(`/admin/coupon/${id}/delete`)
}

export function updateCouponStatusAPI(id){
    return request.post(`/admin/coupon/${id}/update_status`,{
        status:0
    })
}
