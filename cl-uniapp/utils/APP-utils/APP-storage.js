// 存储工具

import { STORAGE_CONFIG } from '../../config/APP-config';

/**
 * 存储工具类
 */
class StorageUtil {
  /**
   * 存储数据
   * @param {string} key - 存储键名
   * @param {*} value - 存储值
   * @param {number} expire - 过期时间（毫秒）
   * @returns {boolean} - 是否存储成功
   */
  static set(key, value, expire = null) {
    try {
      // 构建存储数据
      const storageData = {
        value,
        expire: expire ? Date.now() + expire : null,
        timestamp: Date.now()
      };
      
      // 序列化数据
      const jsonData = JSON.stringify(storageData);
      
      // 存储到本地
      wx.setStorageSync(key, jsonData);
      return true;
    } catch (error) {
      console.error('存储数据失败:', error);
      return false;
    }
  }
  
  /**
   * 获取数据
   * @param {string} key - 存储键名
   * @param {*} defaultValue - 默认值
   * @returns {*} - 存储值或默认值
   */
  static get(key, defaultValue = null) {
    try {
      // 从本地获取数据
      const jsonData = wx.getStorageSync(key);
      
      if (!jsonData) {
        return defaultValue;
      }
      
      // 解析数据
      const storageData = JSON.parse(jsonData);
      
      // 检查是否过期
      if (storageData.expire && Date.now() > storageData.expire) {
        // 数据已过期，删除并返回默认值
        this.remove(key);
        return defaultValue;
      }
      
      return storageData.value;
    } catch (error) {
      console.error('获取数据失败:', error);
      return defaultValue;
    }
  }
  
  /**
   * 删除数据
   * @param {string} key - 存储键名
   * @returns {boolean} - 是否删除成功
   */
  static remove(key) {
    try {
      wx.removeStorageSync(key);
      return true;
    } catch (error) {
      console.error('删除数据失败:', error);
      return false;
    }
  }
  
  /**
   * 清空所有数据
   * @returns {boolean} - 是否清空成功
   */
  static clear() {
    try {
      wx.clearStorageSync();
      return true;
    } catch (error) {
      console.error('清空数据失败:', error);
      return false;
    }
  }
  
  /**
   * 获取存储信息
   * @returns {Object} - 存储信息
   */
  static getInfo() {
    try {
      return wx.getStorageInfoSync();
    } catch (error) {
      console.error('获取存储信息失败:', error);
      return null;
    }
  }
  
  /**
   * 存储用户信息
   * @param {Object} userInfo - 用户信息
   * @returns {boolean} - 是否存储成功
   */
  static setUserInfo(userInfo) {
    return this.set(
      STORAGE_CONFIG.KEYS.USER_INFO,
      userInfo,
      STORAGE_CONFIG.EXPIRY.USER_INFO
    );
  }
  
  /**
   * 获取用户信息
   * @returns {Object} - 用户信息
   */
  static getUserInfo() {
    return this.get(STORAGE_CONFIG.KEYS.USER_INFO, {});
  }
  
  /**
   * 存储Token
   * @param {string} token - Token
   * @returns {boolean} - 是否存储成功
   */
  static setToken(token) {
    return this.set(
      STORAGE_CONFIG.KEYS.TOKEN,
      token,
      STORAGE_CONFIG.EXPIRY.TOKEN
    );
  }
  
  /**
   * 获取Token
   * @returns {string} - Token
   */
  static getToken() {
    return this.get(STORAGE_CONFIG.KEYS.TOKEN, '');
  }
  
  /**
   * 存储购物车数据
   * @param {Array} cartItems - 购物车商品列表
   * @returns {boolean} - 是否存储成功
   */
  static setCartData(cartItems) {
    return this.set(
      STORAGE_CONFIG.KEYS.CART_DATA,
      cartItems,
      STORAGE_CONFIG.EXPIRY.CART_DATA
    );
  }
  
  /**
   * 获取购物车数据
   * @returns {Array} - 购物车商品列表
   */
  static getCartData() {
    return this.get(STORAGE_CONFIG.KEYS.CART_DATA, []);
  }
  
  /**
   * 存储订单历史
   * @param {Array} orders - 订单列表
   * @returns {boolean} - 是否存储成功
   */
  static setOrderHistory(orders) {
    return this.set(
      STORAGE_CONFIG.KEYS.ORDER_HISTORY,
      orders
    );
  }
  
  /**
   * 获取订单历史
   * @returns {Array} - 订单列表
   */
  static getOrderHistory() {
    return this.get(STORAGE_CONFIG.KEYS.ORDER_HISTORY, []);
  }
  
  /**
   * 存储AI对话历史
   * @param {Array} chatHistory - 对话历史
   * @param {string} userId - 用户ID
   * @returns {boolean} - 是否存储成功
   */
  static setChatHistory(chatHistory, userId = '') {
    const key = `${STORAGE_CONFIG.KEYS.AI_CHAT_HISTORY}_${userId || this.getDeviceId()}`;
    return this.set(
      key,
      chatHistory,
      STORAGE_CONFIG.EXPIRY.AI_CHAT_HISTORY
    );
  }
  
  /**
   * 获取AI对话历史
   * @param {string} userId - 用户ID
   * @returns {Array} - 对话历史
   */
  static getChatHistory(userId = '') {
    const key = `${STORAGE_CONFIG.KEYS.AI_CHAT_HISTORY}_${userId || this.getDeviceId()}`;
    return this.get(key, []);
  }
  
  /**
   * 存储搜索历史
   * @param {Array} searchHistory - 搜索历史
   * @returns {boolean} - 是否存储成功
   */
  static setSearchHistory(searchHistory) {
    // 限制搜索历史数量
    const limitedHistory = searchHistory.slice(-10); // 只保留最近10条
    return this.set(
      STORAGE_CONFIG.KEYS.SEARCH_HISTORY,
      limitedHistory,
      STORAGE_CONFIG.EXPIRY.SEARCH_HISTORY
    );
  }
  
  /**
   * 获取搜索历史
   * @returns {Array} - 搜索历史
   */
  static getSearchHistory() {
    return this.get(STORAGE_CONFIG.KEYS.SEARCH_HISTORY, []);
  }
  
  /**
   * 添加搜索历史
   * @param {string} keyword - 搜索关键词
   * @returns {boolean} - 是否添加成功
   */
  static addSearchHistory(keyword) {
    if (!keyword || keyword.trim() === '') {
      return false;
    }
    
    try {
      // 获取现有搜索历史
      let searchHistory = this.getSearchHistory();
      
      // 移除重复项
      searchHistory = searchHistory.filter(item => item !== keyword.trim());
      
      // 添加到开头
      searchHistory.unshift(keyword.trim());
      
      // 限制数量
      searchHistory = searchHistory.slice(0, 10);
      
      // 保存
      return this.setSearchHistory(searchHistory);
    } catch (error) {
      console.error('添加搜索历史失败:', error);
      return false;
    }
  }
  
  /**
   * 清空搜索历史
   * @returns {boolean} - 是否清空成功
   */
  static clearSearchHistory() {
    return this.remove(STORAGE_CONFIG.KEYS.SEARCH_HISTORY);
  }
  
  /**
   * 存储设备ID
   * @param {string} deviceId - 设备ID
   * @returns {boolean} - 是否存储成功
   */
  static setDeviceId(deviceId) {
    return this.set(STORAGE_CONFIG.KEYS.DEVICE_ID, deviceId);
  }
  
  /**
   * 获取设备ID
   * @returns {string} - 设备ID
   */
  static getDeviceId() {
    return this.get(STORAGE_CONFIG.KEYS.DEVICE_ID, '');
  }
  
  /**
   * 生成设备ID
   * @returns {string} - 设备ID
   */
  static generateDeviceId() {
    const deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.setDeviceId(deviceId);
    return deviceId;
  }
  
  /**
   * 清理过期数据
   * @returns {number} - 清理的过期数据数量
   */
  static cleanExpired() {
    try {
      const info = this.getInfo();
      if (!info || !info.keys) {
        return 0;
      }
      
      let cleanedCount = 0;
      
      // 遍历所有键
      info.keys.forEach(key => {
        try {
          // 尝试获取数据
          const jsonData = wx.getStorageSync(key);
          if (jsonData) {
            const storageData = JSON.parse(jsonData);
            
            // 检查是否过期
            if (storageData.expire && Date.now() > storageData.expire) {
              // 删除过期数据
              this.remove(key);
              cleanedCount++;
            }
          }
        } catch (error) {
          console.error(`清理过期数据失败 [${key}]:`, error);
        }
      });
      
      return cleanedCount;
    } catch (error) {
      console.error('清理过期数据失败:', error);
      return 0;
    }
  }
  
  /**
   * 获取存储大小
   * @returns {Object} - 存储大小信息
   */
  static getStorageSize() {
    try {
      const info = this.getInfo();
      if (!info) {
        return null;
      }
      
      return {
        currentSize: info.currentSize,
        limitSize: info.limitSize,
        usedPercent: (info.currentSize / info.limitSize * 100).toFixed(2) + '%'
      };
    } catch (error) {
      console.error('获取存储大小失败:', error);
      return null;
    }
  }
}

// 导出
module.exports = StorageUtil;
