/**
 * 小程序订单服务
 */
import { request } from '../_utils/request';
import { getDeviceId } from '../../utils/device';

function withDeviceId(data) {
  const deviceId = getDeviceId();
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    return { ...data, deviceId };
  }
  return { deviceId };
}

/**
 * 创建订单
 * @param {Object} data 订单数据
 * @returns {Promise}
 */
export function createOrder(data) {
  return request({
    url: '/api/app/order/create',
    method: 'POST',
    data: withDeviceId(data),
    showLoading: true
  });
}

/**
 * 模拟支付
 * @param {Number} orderId 订单ID
 * @returns {Promise}
 */
export function mockPay(orderId) {
  return request({
    url: '/api/app/order/mockPay',
    method: 'POST',
    data: withDeviceId({ orderId }),
    showLoading: true
  });
}

/**
 * 确认收货
 * @param {Number} orderId 订单ID
 * @returns {Promise}
 */
export function confirmReceive(orderId) {
  return request({
    url: '/api/app/order/confirmReceive',
    method: 'POST',
    data: withDeviceId({ orderId }),
    showLoading: true
  });
}

/**
 * 获取订单列表
 * @param {Object} params 查询参数
 * @returns {Promise}
 */
export function getOrderList(params) {
  return request({
    url: '/api/app/order/list',
    method: 'GET',
    data: {
      ...params,
      deviceId: params && params.deviceId ? params.deviceId : getDeviceId()
    },
    showLoading: true
  });
}

/**
 * 获取订单详情
 * @param {Number} orderId 订单ID
 * @returns {Promise}
 */
export function getOrderDetail(orderId) {
  const deviceId = getDeviceId();
  return request({
    url: `/api/app/order/${orderId}`,
    method: 'GET',
    data: { deviceId },
    showLoading: true
  });
}
