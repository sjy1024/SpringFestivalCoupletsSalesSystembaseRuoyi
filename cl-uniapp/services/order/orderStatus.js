import { post } from '../_utils/request';
import { getDeviceId } from '../../utils/device';
import { patchLocalCustomOrderStatus } from '../../utils/customCartCache';

/**
 * 更新订单状态
 */
export function updateOrderStatus(params) {
  return post('/api/app/order/updateStatus', { ...params, deviceId: getDeviceId() });
}

/**
 * 确认收货
 */
export function confirmReceipt(orderId) {
  return post('/api/app/order/confirmReceive', { orderId, deviceId: getDeviceId() });
}

/**
 * 申请取消（已支付/制作中，需商家审核）
 */
export function requestOrderCancel(orderId, reason = '') {
  return post('/api/app/order/requestCancel', {
    orderId,
    reason: reason || '用户申请取消',
    deviceId: getDeviceId(),
  });
}

/**
 * 取消订单（待付款直接取消；已支付/制作中走申请审核）
 * @param {number} orderId
 * @param {string} reason
 * @param {string} orderStatus 订单当前状态
 */
export function cancelOrder(orderId, reason = '', orderStatus = '0') {
  const status = String(orderStatus);
  if (status === '1' || status === '2') {
    return requestOrderCancel(orderId, reason).then((res) => {
      patchLocalCustomOrderStatus(orderId, null, '1');
      return res;
    });
  }
  return updateOrderStatus({
    orderId,
    status: '4',
    remark: reason ? `取消原因：${reason}` : '用户取消订单',
  }).then((res) => {
    patchLocalCustomOrderStatus(orderId, '4', '2');
    return res;
  });
}

/**
 * 商家接单（将已支付改为制作中）
 */
export function startProduction(orderId) {
  return updateOrderStatus({
    orderId,
    status: '2',
    remark: '商家已接单，开始制作',
  });
}
