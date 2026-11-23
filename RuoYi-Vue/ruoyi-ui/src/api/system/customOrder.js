import request from '@/utils/request'

// 查询定制订单列表
export function listCustomOrder(query) {
  return request({
    url: '/system/customOrder/list',
    method: 'get',
    params: query
  })
}

// 查询定制订单详细
export function getCustomOrder(customId) {
  return request({
    url: '/system/customOrder/' + customId,
    method: 'get'
  })
}

// 修改定制订单
export function updateCustomOrder(data) {
  return request({
    url: '/system/customOrder',
    method: 'put',
    data: data
  })
}

// 删除定制订单
export function delCustomOrder(customId) {
  return request({
    url: '/system/customOrder/' + customId,
    method: 'delete'
  })
}

// 导出定制订单
export function exportCustomOrder(query) {
  return request({
    url: '/system/customOrder/export',
    method: 'post',
    params: query
  })
}
