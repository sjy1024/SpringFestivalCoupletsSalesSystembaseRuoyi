import { config } from '../../config/index';
import { get, toAbsoluteUrl } from '../_utils/request';
import { getDeviceId } from '../../utils/device';

/** 获取订单详情mock数据 */
function mockFetchOrderDetail(params) {
  const { delay } = require('../_utils/delay');
  const { genOrderDetail } = require('../../model/order/orderDetail');

  return delay().then(() => genOrderDetail(params));
}

/** 获取订单详情数据 */
export function fetchOrderDetail(params) {
  if (config.useMock) {
    return mockFetchOrderDetail(params);
  }

  // params.parameter 对应 ClOrder.orderId 或 orderNo
  const orderId = params.parameter || params.orderId;
  const deviceId = getDeviceId();
  return get(`/api/app/order/${orderId}`, { deviceId }, { showLoading: true }).then((orderDetail) => {
    if (!orderDetail) return { data: null };
    
    // 处理商品图片路径
    if (orderDetail.orderItemVOs && orderDetail.orderItemVOs.length > 0) {
      orderDetail.orderItemVOs.forEach(item => {
        if (item.goodsPictureUrl) {
          item.goodsPictureUrl = toAbsoluteUrl(item.goodsPictureUrl);
        }
        if (item.thumb) {
          item.thumb = toAbsoluteUrl(item.thumb);
        }
      });
    }

    // 处理物流信息中的图片路径
    if (orderDetail.logisticsVO) {
      // 这里可以处理物流信息中的图片路径
    }

    // 处理拼团信息中的图片路径
    if (orderDetail.groupInfoVo && orderDetail.groupInfoVo.goodsPictureUrl) {
      orderDetail.groupInfoVo.goodsPictureUrl = toAbsoluteUrl(orderDetail.groupInfoVo.goodsPictureUrl);
    }

    // 映射成前端订单详情结构
    return {
      data: orderDetail
    };
  });
}

/** 获取客服mock数据 */
function mockFetchBusinessTime(params) {
  const { delay } = require('../_utils/delay');
  const { genBusinessTime } = require('../../model/order/orderDetail');

  return delay().then(() => genBusinessTime(params));
}

/** 获取客服数据 */
export function fetchBusinessTime(params) {
  if (config.useMock) {
    return mockFetchBusinessTime(params);
  }

  // 你当前项目暂无真实客服时间接口，这里先返回一个固定时间段，避免前端出错
  return Promise.resolve({
    data: {
      telphone: '400-123-4567',
      businessTime: ['周一至周日', '09:00-21:00']
    }
  });
}
