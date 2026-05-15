import request from '@/utils/request'

export const getStatistic1API = () => {
  return request({
    url: '/admin/statistics1',
    method: 'get'
  })
}

export const getStatistic2API = (data) => {
  return request({
    url: '/admin/statistics2',
    method: 'get',
  })
}

export const getStatistic3API = (data) => {
  return request({
    url: '/admin/statistics3?type='+data,
    method: 'get',
  })
}
