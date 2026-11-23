/**
 * 设备ID管理工具
 * 用于在小程序中唯一标识用户
 */

const DEVICE_ID_KEY = 'deviceId';

/**
 * 生成设备ID
 * 格式：device_时间戳_随机字符串
 */
function generateDeviceId() {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substr(2, 9);
  return `device_${timestamp}_${randomStr}`;
}

/**
 * 获取设备ID（如果不存在则生成并保存）
 * @returns {String} 设备ID
 */
export function getDeviceId() {
  try {
    let deviceId = wx.getStorageSync(DEVICE_ID_KEY);
    if (!deviceId) {
      deviceId = generateDeviceId();
      wx.setStorageSync(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  } catch (err) {
    console.error('获取设备ID失败:', err);
    // 如果存储失败，返回临时ID（不持久化）
    return generateDeviceId();
  }
}

/**
 * 设置设备ID（一般不需要手动调用）
 * @param {String} deviceId 设备ID
 */
export function setDeviceId(deviceId) {
  try {
    wx.setStorageSync(DEVICE_ID_KEY, deviceId);
  } catch (err) {
    console.error('保存设备ID失败:', err);
  }
}

/**
 * 清除设备ID（用于测试或切换用户）
 */
export function clearDeviceId() {
  try {
    wx.removeStorageSync(DEVICE_ID_KEY);
  } catch (err) {
    console.error('清除设备ID失败:', err);
  }
}

