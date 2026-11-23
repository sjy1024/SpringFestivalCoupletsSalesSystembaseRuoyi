import { config } from '../../config/index';
import { get, post, put, del } from '../_utils/request';
import { getDeviceId } from '../../utils/deviceId';

/** 获取收货地址 */
function mockFetchDeliveryAddress(id) {
  const { delay } = require('../_utils/delay');
  const { genAddress } = require('../../model/address');

  return delay().then(() => genAddress(id));
}

/** 获取收货地址 */
export function fetchDeliveryAddress(id = 0) {
  if (config.useMock) {
    return mockFetchDeliveryAddress(id);
  }

  // 真实接口：获取单个地址详情
  const deviceId = getDeviceId();
  return get(`/api/app/address/${id}`, { deviceId }).then((address) => {
    return transformAddress(address);
  });
}

/** 获取收货地址列表 */
function mockFetchDeliveryAddressList(len = 0) {
  const { delay } = require('../_utils/delay');
  const { genAddressList } = require('../../model/address');

  return delay().then(() =>
    genAddressList(len).map((address) => {
      return {
        ...address,
        phoneNumber: address.phone,
        address: `${address.provinceName}${address.cityName}${address.districtName}${address.detailAddress}`,
        tag: address.addressTag,
      };
    }),
  );
}

/** 获取收货地址列表 */
export function fetchDeliveryAddressList(len = 10) {
  if (config.useMock) {
    return mockFetchDeliveryAddressList(len);
  }

  // 真实接口：获取地址列表
  const deviceId = getDeviceId();
  return get('/api/app/address/list', { deviceId }).then((list) => {
    const safeList = Array.isArray(list) ? list : [];
    return safeList.map((address) => transformAddress(address));
  });
}

/** 新增收货地址 */
export function addDeliveryAddress(address) {
  if (config.useMock) {
    const { delay } = require('../_utils/delay');
    return delay().then(() => ({ success: true }));
  }

  const deviceId = getDeviceId();
  return post('/api/app/address', {
    ...address,
    deviceId,
  });
}

/** 修改收货地址 */
export function updateDeliveryAddress(address) {
  if (config.useMock) {
    const { delay } = require('../_utils/delay');
    return delay().then(() => ({ success: true }));
  }

  const deviceId = getDeviceId();
  return put('/api/app/address', {
    ...address,
    deviceId,
  });
}

/** 删除收货地址 */
export function deleteDeliveryAddress(addressId) {
  if (config.useMock) {
    const { delay } = require('../_utils/delay');
    return delay().then(() => ({ success: true }));
  }

  const deviceId = getDeviceId();
  return del(`/api/app/address/${addressId}?deviceId=${encodeURIComponent(deviceId)}`);
}

/** 设置默认地址 */
export function setDefaultAddress(addressId) {
  if (config.useMock) {
    const { delay } = require('../_utils/delay');
    return delay().then(() => ({ success: true }));
  }

  const deviceId = getDeviceId();
  const query = `addressId=${encodeURIComponent(addressId)}&deviceId=${encodeURIComponent(deviceId)}`;
  return put(`/api/app/address/setDefault?${query}`, {});
}

/** 获取默认地址 */
export function getDefaultAddress() {
  if (config.useMock) {
    return mockFetchDeliveryAddress(0);
  }

  const deviceId = getDeviceId();
  return get('/api/app/address/default', { deviceId }).then((address) => {
    return address ? transformAddress(address) : null;
  });
}

/**
 * 转换地址数据格式（后端 -> 前端）
 */
function transformAddress(address) {
  if (!address) return null;
  
  return {
    ...address,
    id: address.addressId,
    phoneNumber: address.receiverPhone,
    phone: address.receiverPhone,
    name: address.receiverName,
    address: `${address.provinceName || ''}${address.cityName || ''}${address.districtName || ''}${address.detailAddress || ''}`,
    tag: address.addressTag || '',
  };
}
