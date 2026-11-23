import request from '@/utils/request'

/**
 * 获取大屏/统计汇总数据（统一接口）
 */
export function getDashboardData() {
  return request({
    url: '/system/dashboard/data',
    method: 'get'
  })
}

/**
 * 获取大屏概览数据
 */
export function getOverviewData() {
  return request({
    url: '/api/dashboard/overview',
    method: 'get'
  })
}

/**
 * 获取订单状态分布
 */
export function getOrderStatus() {
  return request({
    url: '/api/dashboard/order-status',
    method: 'get'
  })
}

/**
 * 获取销售趋势
 * @param {Number} days - 天数
 */
export function getSalesTrend(days = 7) {
  return request({
    url: '/api/dashboard/sales-trend',
    method: 'get',
    params: { days }
  })
}

/**
 * 获取热门商品
 * @param {Number} limit - 数量限制
 */
export function getHotGoods(limit = 5) {
  return request({
    url: '/api/dashboard/hot-goods',
    method: 'get',
    params: { limit }
  })
}

/**
 * 获取实时订单
 * @param {Number} limit - 数量限制
 */
export function getRecentOrders(limit = 10) {
  return request({
    url: '/api/dashboard/recent-orders',
    method: 'get',
    params: { limit }
  })
}

/**
 * 获取定制订单队列
 */
export function getCustomQueue() {
  return request({
    url: '/api/dashboard/custom-queue',
    method: 'get'
  })
}

/**
 * 获取库存预警
 * @param {Number} threshold - 库存阈值
 */
export function getStockAlert(threshold = 10) {
  return request({
    url: '/api/dashboard/stock-alert',
    method: 'get',
    params: { threshold }
  })
}

/**
 * 获取用户活跃度
 */
export function getUserActivity() {
  return request({
    url: '/api/dashboard/user-activity',
    method: 'get'
  })
}
