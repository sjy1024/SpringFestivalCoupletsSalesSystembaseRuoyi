/**
 * 小程序购物车服务
 */
import { request, toAbsoluteUrl } from '../_utils/request';
import { getDeviceId } from '../../utils/device';

/**
 * 添加商品到购物车
 * @param {Object} data 购物车数据
 * @returns {Promise}
 */
export function addToCart(data) {
  // 确保包含设备ID
  const requestData = {
    ...data,
    deviceId: getDeviceId()
  };
  
  return request({
    url: '/api/app/cart/add',
    method: 'POST',
    data: requestData,
    showLoading: true
  });
}

/**
 * 获取购物车列表
 * @param {Object} params 查询参数
 * @returns {Promise}
 */
export function getCartList(params = {}) {
  // 确保包含设备ID
  const requestData = {
    ...params,
    deviceId: getDeviceId()
  };
  
  return request({
    url: '/api/app/cart/list',
    method: 'GET',
    data: requestData,
    showLoading: false,
    showError: false,
    retry: false,
  }).then(list => {
    // 处理图片地址
    if (Array.isArray(list)) {
      return list.map(item => ({
        ...item,
        coverImage: toAbsoluteUrl(item.coverImage)
      }));
    }
    return list;
  });
}

/**
 * 更新购物车商品数量
 * @param {Number} cartId 购物车ID
 * @param {Number} quantity 数量
 * @returns {Promise}
 */
export function updateCartQuantity(cartId, quantity) {
  return request({
    url: '/api/app/cart/update',
    method: 'PUT',
    data: { cartId, quantity, deviceId: getDeviceId() },
    showLoading: true
  });
}

/**
 * 删除购物车商品
 * @param {Number} cartId 购物车ID
 * @returns {Promise}
 */
export function removeFromCart(cartId) {
  const q = encodeURIComponent(getDeviceId());
  return request({
    url: `/api/app/cart/${cartId}?deviceId=${q}`,
    method: 'DELETE',
    showLoading: true
  });
}

/**
 * 批量删除购物车商品
 * @param {Array} cartIds 购物车ID数组
 * @returns {Promise}
 */
export function batchRemoveFromCart(cartIds) {
  return request({
    url: '/api/app/cart/batchDelete',
    method: 'DELETE',
    data: { cartIds, deviceId: getDeviceId() },
    showLoading: true
  });
}

/**
 * 清空购物车
 * @param {String} deviceId 设备ID
 * @returns {Promise}
 */
export function clearCart(deviceId) {
  return request({
    url: '/api/app/cart/clear',
    method: 'DELETE',
    data: { deviceId: deviceId || getDeviceId() },
    showLoading: true
  });
}