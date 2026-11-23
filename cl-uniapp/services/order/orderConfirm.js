import { config } from '../../config/index';
import { post } from '../_utils/request';
import { mockIp, mockReqId } from '../../utils/mock';
import { getDeviceId } from '../../utils/device';

/** 获取结算mock数据 */
function mockFetchSettleDetail(params) {
  const { delay } = require('../_utils/delay');
  const { genSettleDetail } = require('../../model/order/orderConfirm');

  return delay().then(() => genSettleDetail(params));
}

/** 提交mock订单 */
function mockDispatchCommitPay() {
  const { delay } = require('../_utils/delay');

  return delay().then(() => ({
    data: {
      isSuccess: true,
      tradeNo: '350930961469409099',
      payInfo: '{}',
      code: null,
      transactionId: 'E-200915180100299000',
      msg: null,
      interactId: '15145',
      channel: 'wechat',
      limitGoodsList: null,
    },
    code: 'Success',
    msg: null,
    requestId: mockReqId(),
    clientIp: mockIp(),
    rt: 891,
    success: true,
  }));
}

/** 获取结算数据 */
export function fetchSettleDetail(params) {
  if (config.useMock) {
    return mockFetchSettleDetail(params);
  }

  // 你当前后端还没有专门的“预结算”接口，这里直接把前端传入的商品+金额原样返回
  // 确保页面能正常展示
  return Promise.resolve({
    ...params,
  });
}

/* 提交订单 */
export function dispatchCommitPay(params) {
  if (config.useMock) {
    return mockDispatchCommitPay(params);
  }

  // 对接若依 C 端创建订单接口（后续你可以在 AppOrderController 里补充 /create）
  // 这里先约定：POST /api/app/order/create，body 里包含商品、金额、收货信息等
  return post('/api/app/order/create', { ...params, deviceId: params.deviceId || getDeviceId() }).then((res) => {
    // 兼容模板：返回结构中至少包含 isSuccess 和 orderId/orderNo
    return {
      data: {
        isSuccess: true,
        orderId: res.orderId,
        orderNo: res.orderNo,
      },
      code: 'Success',
      msg: null,
      requestId: mockReqId(),
      clientIp: mockIp(),
      success: true,
    };
  });
}

/** 开发票 */
export function dispatchSupplementInvoice() {
  if (config.useMock) {
    const { delay } = require('../_utils/delay');
    return delay();
  }

  return new Promise((resolve) => {
    resolve('real api');
  });
}
