import { config } from '../../config/index';
import { get } from '../_utils/request';
import { getDeviceId } from '../../utils/device';
import { OrderStatus } from '../../utils/orderConfig';

/** 获取订单列表mock数据 */
function mockFetchOrders(params) {
  const { delay } = require('../_utils/delay');
  const { genOrders } = require('../../model/order/orderList');

  return delay(200).then(() => genOrders(params));
}

/** 获取订单列表数据 */
export function fetchOrders(params) {
  if (config.useMock) {
    return mockFetchOrders(params);
  }

  // 调用若依小程序端订单列表接口：
  // GET /api/app/order/list?deviceId=xxx
  const query = {};
  if (params && params.parameter) {
    if (params.parameter.deviceId) {
      query.deviceId = params.parameter.deviceId;
    }
    if (params.parameter.orderStatus !== undefined && params.parameter.orderStatus !== null) {
      query.status = params.parameter.orderStatus;
    }
  }
  if (!query.deviceId) {
    query.deviceId = getDeviceId();
  }

  console.log('========== fetchOrders 开始 ==========');
  console.log('原始参数 params:', JSON.stringify(params));
  console.log('构建的查询参数 query:', JSON.stringify(query));
  console.log('是否包含status过滤:', 'status' in query);
  console.log('========================================');

  return get('/api/app/order/list', query, { showLoading: false }).then((orderList) => {
    // get 方法已经自动解析了若依格式，直接返回 data 字段（订单数组）
    console.log('========== fetchOrders 返回 ==========');
    console.log('后端返回订单数量:', Array.isArray(orderList) ? orderList.length : 0);
    if (Array.isArray(orderList) && orderList.length > 0) {
      console.log('订单状态分布:', orderList.map(o => o.status).join(', '));
    }
    console.log('========================================');
    
    const safeList = Array.isArray(orderList) ? orderList : [];
    
    // 将后端 ClOrder 列表转换成前端模板期望的结构
    const orders = safeList.map((o) => ({
      orderId: o.orderId,
      orderNo: o.orderNo,
      parentOrderNo: o.orderNo, // 使用订单号作为父订单号
      storeId: '1000', // 默认店铺ID
      storeName: '春联小程序', // 默认店铺名称
      orderStatus: o.status, // 订单状态
      cancelStatus: o.cancelStatus || '0',
      orderStatusName: getStatusName(o.status), // 状态名称
      paymentAmount: o.totalAmount,
      totalAmount: o.totalAmount,
      createTime: o.createTime,
      logisticsVO: {
        logisticsNo: '',
        receiverName: o.receiverName,
        receiverPhone: o.receiverPhone,
        receiverAddress: o.receiverAddress,
      },
      orderItemVOs: [], // 订单项，需要单独获取
      buttonVOs: getOrderButtons(o.status, o.cancelStatus),
      freightFee: 0,
      groupInfoVo: {},
    }));

    console.log('转换后的订单数据:', orders);

    // 返回前端期望的数据结构
    return {
      data: {
        pageNum: 1,
        pageSize: 10,
        totalCount: orders.length,
        orders: orders
      }
    };
  }).catch(error => {
    console.error('fetchOrders 错误:', error);
    return {
      data: {
        pageNum: 1,
        pageSize: 10,
        totalCount: 0,
        orders: []
      }
    };
  });
}

// 获取订单状态名称
function getStatusName(status) {
  const statusMap = {
    '0': '待支付',
    '1': '已支付',
    '2': '制作中',
    '3': '已收货',
    '4': '已取消'
  };
  return statusMap[status] || '未知状态';
}

// 获取订单按钮
function getOrderButtons(status, cancelStatus = '0') {
  const pendingCancel = String(cancelStatus) === '1';
  switch (status) {
    case '0': // 待支付
      if (pendingCancel) {
        return [{ primary: true, type: 1, name: '去支付' }];
      }
      return [
        { primary: false, type: 2, name: '取消订单' },
        { primary: true, type: 1, name: '去支付' },
      ];
    case '1': // 已支付
      if (pendingCancel) {
        return [{ primary: true, type: 3, name: '确认收货' }];
      }
      return [
        { primary: false, type: 2, name: '申请取消' },
        { primary: true, type: 3, name: '确认收货' },
      ];
    case '2': // 制作中
      if (pendingCancel) {
        return [{ primary: true, type: 3, name: '确认收货' }];
      }
      return [
        { primary: false, type: 2, name: '申请取消' },
        { primary: true, type: 3, name: '确认收货' },
      ];
    case '3': // 已完成
      return [
        { primary: true, type: 9, name: '再次购买' }
      ];
    case '4': // 已取消
      return [
        { primary: true, type: 9, name: '再次购买' }
      ];
    default:
      return [];
  }
}

/** 获取订单列表mock数据 */
function mockFetchOrdersCount(params) {
  const { delay } = require('../_utils/delay');
  const { genOrdersCount } = require('../../model/order/orderList');

  return delay().then(() => genOrdersCount(params));
}

/** 获取订单列表统计 */
export function fetchOrdersCount(params) {
  if (config.useMock) {
    return mockFetchOrdersCount(params);
  }

  // 获取所有订单并统计各状态数量
  return fetchOrders({ parameter: { deviceId: params?.deviceId || getDeviceId() } }).then((result) => {
    const orders = result?.data?.orders || [];
    
    // 按状态统计订单数量
    const countMap = {
      [OrderStatus.PENDING_PAYMENT]: 0,
      [OrderStatus.PAID]: 0,
      [OrderStatus.IN_PRODUCTION]: 0,
      [OrderStatus.COMPLETED]: 0,
      [OrderStatus.CANCELED]: 0,
    };

    orders.forEach((order) => {
      const status = String(order.orderStatus ?? order.status ?? '');
      if (countMap[status] !== undefined) {
        countMap[status]++;
      }
    });

    return {
      data: [
        { tabType: OrderStatus.PENDING_PAYMENT, orderNum: countMap[OrderStatus.PENDING_PAYMENT] },
        { tabType: OrderStatus.PAID, orderNum: countMap[OrderStatus.PAID] },
        { tabType: OrderStatus.IN_PRODUCTION, orderNum: countMap[OrderStatus.IN_PRODUCTION] },
        { tabType: OrderStatus.COMPLETED, orderNum: countMap[OrderStatus.COMPLETED] },
      ],
    };
  }).catch(error => {
    console.error('fetchOrdersCount 错误:', error);
    return {
      data: []
    };
  });
}
