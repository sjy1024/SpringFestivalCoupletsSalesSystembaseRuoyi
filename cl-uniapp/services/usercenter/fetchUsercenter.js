import { config } from '../../config/index';
import { get } from '../_utils/request';
import { getDeviceId } from '../../utils/device';
import { OrderStatus } from '../../utils/orderConfig';

/** 获取个人中心信息（mock） */
function mockFetchUserCenter() {
  const { delay } = require('../_utils/delay');
  const { genUsercenter } = require('../../model/usercenter');
  return delay(200).then(() => genUsercenter());
}

function countByStatus(orders) {
  const counts = {
    [OrderStatus.PENDING_PAYMENT]: 0,
    [OrderStatus.PAID]: 0,
    [OrderStatus.IN_PRODUCTION]: 0,
    [OrderStatus.COMPLETED]: 0,
    [OrderStatus.CANCELED]: 0,
  };
  (orders || []).forEach((order) => {
    const status = String(order.status ?? order.orderStatus ?? '');
    if (counts[status] !== undefined) {
      counts[status]++;
    }
  });
  return counts;
}

function buildUserCenterPayload(orders = []) {
  const counts = countByStatus(orders);
  return {
    userInfo: {
      avatarUrl: '',
      nickName: '春联用户',
      phoneNumber: '',
    },
    countsData: [
      { num: 0, name: '积分', type: 'point' },
      { num: 0, name: '优惠券', type: 'coupon' },
    ],
    orderTagInfos: [
      { orderNum: counts[OrderStatus.PENDING_PAYMENT], tabType: OrderStatus.PENDING_PAYMENT },
      { orderNum: counts[OrderStatus.PAID], tabType: OrderStatus.PAID },
      { orderNum: counts[OrderStatus.IN_PRODUCTION], tabType: OrderStatus.IN_PRODUCTION },
      { orderNum: counts[OrderStatus.COMPLETED], tabType: OrderStatus.COMPLETED },
      { orderNum: 0, tabType: 0 },
    ],
    customerServiceInfo: {
      servicePhone: '13650638839',
      serviceTimeDuration: '9:00-18:00',
    },
  };
}

export function getDefaultUserCenterPayload() {
  return buildUserCenterPayload([]);
}

function fetchOrdersForUserCenter() {
  return get(
    '/api/app/order/list',
    { deviceId: getDeviceId() },
    {
      showLoading: false,
      showError: false,
      retry: false,
      useCache: false,
    }
  ).then((orderList) => (Array.isArray(orderList) ? orderList : []));
}

/** 获取个人中心信息 */
export function fetchUserCenter() {
  if (config.useMock) {
    return mockFetchUserCenter()
      .then((mockData) => {
        const orders = (mockData.orderTagInfos || []).map((item, index) => ({
          status: ['0', '1', '2', '3', '4'][index] || '0',
        }));
        return {
          ...mockData,
          orderTagInfos: buildUserCenterPayload(orders).orderTagInfos,
        };
      })
      .catch(() => getDefaultUserCenterPayload());
  }

  return fetchOrdersForUserCenter()
    .then((orders) => buildUserCenterPayload(orders))
    .catch((error) => {
      console.error('fetchUserCenter 失败，使用默认数据:', error);
      return getDefaultUserCenterPayload();
    });
}
