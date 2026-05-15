import request from "@/utils/request"

export function getCategoryList() {
  return request.get("/admin/category")
}

export function createCategory(data) {
  return request.post("/admin/category", data)
}

export function updateCategory(id, data) {
  return request.post("/admin/category/" + id, data)
}

export function updateCategoryStatus(id, status) {
  return request.post(`/admin/category/${id}/update_status`, {
    status
  })
}

export function deleteCategory(id) {
  return request.post(`/admin/category/${id}/delete`)
}

export function getCategoryGoods(id) {
  return request.get(`/admin/app_category_item/list?category_id=${id}`)
}

export function deleteCategoryGoods(id) {
  return request.post(`/admin/app_category_item/${id}/delete`)
}

export function connectCategoryGoods(data){
    return request.post(`/admin/app_category_item`,data)
}
