// 定制服务API - 增强版
import { post, get, clearCache } from '../_utils/request';
import { ErrorHandler } from '../_utils/errorHandler';
import { PerformanceMonitor } from '../_utils/performance';
import { getDeviceId } from '../../utils/device';

/**
 * 提交定制方案
 * @param {Object} data - 定制方案数据
 * @returns {Promise} - 返回Promise对象
 */
export async function submitCustomPlan(data) {
  const monitor = PerformanceMonitor.start('submit_custom_plan');
  
  try {
    const result = await post('/api/custom/submit', { ...data, deviceId: data.deviceId || getDeviceId() }, {
      showLoading: true,
      showError: true,
      retry: true,
      retryCount: 3
    });
    
    if (monitor) {
      PerformanceMonitor.end(monitor, {
        tags: { action: 'submit_custom_plan', success: true }
      });
    }
    
    return result;
  } catch (error) {
    if (monitor) {
      PerformanceMonitor.end(monitor, {
        tags: { action: 'submit_custom_plan', success: false, error: error.message }
      });
    }
    
    ErrorHandler.handle(error, {
      component: 'CustomService',
      method: 'submitCustomPlan',
      data
    });
    
    throw error;
  }
}

/**
 * 获取定制类型列表
 * @returns {Promise} - 返回Promise对象
 */
export async function getCustomTypes() {
  const monitor = PerformanceMonitor.start('get_custom_types');
  
  try {
    const result = await get('/api/custom/types', {}, {
      useCache: true,
      cacheDuration: 5 * 60 * 1000, // 缓存5分钟
      showLoading: false
    });
    
    PerformanceMonitor.end(monitor, {
      tags: { action: 'get_custom_types', success: true }
    });
    
    return result;
  } catch (error) {
    PerformanceMonitor.end(monitor, {
      tags: { action: 'get_custom_types', success: false, error: error.message }
    });
    
    ErrorHandler.handle(error, {
      component: 'CustomService',
      method: 'getCustomTypes'
    });
    
    // 返回默认数据，保证页面正常显示
    // 这里使用相对路径，你可以上传实际图片到 /static/images/custom/ 目录
    return [
      { id: 1, name: '春联', image: '/static/images/custom/spring-couplet.jpg' },
      { id: 2, name: '福字', image: '/static/images/custom/fu.jpg' },
      { id: 3, name: '横批', image: '/static/images/custom/horizontal.jpg' }
    ];
  }
}

/**
 * 获取尺寸列表
 * @returns {Promise} - 返回Promise对象
 */
export async function getSizeOptions() {
  const monitor = PerformanceMonitor.start('get_size_options');
  
  try {
    const result = await get('/api/custom/sizes', {}, {
      useCache: true,
      cacheDuration: 10 * 60 * 1000, // 10分钟缓存
      showLoading: false
    });
    
    PerformanceMonitor.end(monitor, {
      tags: { action: 'get_size_options', success: true }
    });
    
    return result;
  } catch (error) {
    PerformanceMonitor.end(monitor, {
      tags: { action: 'get_size_options', success: false, error: error.message }
    });
    
    ErrorHandler.handle(error, {
      component: 'CustomService',
      method: 'getSizeOptions'
    });
    
    // 返回默认尺寸选项
    return [
      { id: 1, name: '1.2米', price: 38 },
      { id: 2, name: '1.5米', price: 48 },
      { id: 3, name: '1.8米', price: 58 },
      { id: 4, name: '2.1米', price: 68 }
    ];
  }
}

/**
 * 计算定制价格
 * @param {Object} data - 定制选项数据
 * @returns {Promise} - 返回Promise对象
 */
export async function calculatePrice(data) {
  const monitor = PerformanceMonitor.start('calculate_price');
  
  try {
    const result = await post('/api/custom/calculate-price', data, {
      showLoading: false,
      showError: false
    });
    
    PerformanceMonitor.end(monitor, {
      tags: { action: 'calculate_price', success: true }
    });
    
    return result;
  } catch (error) {
    PerformanceMonitor.end(monitor, {
      tags: { action: 'calculate_price', success: false, error: error.message }
    });
    
    ErrorHandler.handle(error, {
      component: 'CustomService',
      method: 'calculatePrice',
      data
    });
    
    // 计算本地价格作为fallback
    const { size, paper } = data;
    const sizeOptions = await getSizeOptions();
    const paperOptions = [
      { id: 1, name: '丹色', price: 0 },
      { id: 2, name: '纯红色', price: 0 },
      { id: 3, name: '点金红色', price: 5 }
    ];
    
    const selectedSize = sizeOptions.find(s => s.id === size);
    const selectedPaper = paperOptions.find(p => p.id === paper);
    
    let totalPrice = 0;
    if (selectedSize) totalPrice += selectedSize.price;
    if (selectedPaper) totalPrice += selectedPaper.price;
    
    return { price: totalPrice };
  }
}

/**
 * 保存定制方案
 * @param {Object} data - 定制方案数据
 * @returns {Promise} - 返回Promise对象
 */
export async function saveCustomPlan(data) {
  const monitor = PerformanceMonitor.start('save_custom_plan');
  
  try {
    const result = await post('/api/custom/save', { ...data, deviceId: data.deviceId || getDeviceId() }, {
      showLoading: true,
      showError: true
    });
    
    PerformanceMonitor.end(monitor, {
      tags: { action: 'save_custom_plan', success: true }
    });
    
    return result;
  } catch (error) {
    PerformanceMonitor.end(monitor, {
      tags: { action: 'save_custom_plan', success: false, error: error.message }
    });
    
    ErrorHandler.handle(error, {
      component: 'CustomService',
      method: 'saveCustomPlan',
      data
    });
    
    throw error;
  }
}

/**
 * 获取定制订单详情
 * @param {Number} customId - 定制ID
 * @returns {Promise} - 返回Promise对象
 */
export async function getCustomDetail(customId) {
  const monitor = PerformanceMonitor.start('get_custom_detail');
  
  try {
    const result = await get(`/api/custom/detail/${customId}`, { deviceId: getDeviceId() }, {
      useCache: true,
      cacheDuration: 60 * 1000 // 1分钟缓存
    });
    
    PerformanceMonitor.end(monitor, {
      tags: { action: 'get_custom_detail', success: true, customId }
    });
    
    return result;
  } catch (error) {
    PerformanceMonitor.end(monitor, {
      tags: { 
        action: 'get_custom_detail', 
        success: false, 
        error: error.message,
        customId 
      }
    });
    
    ErrorHandler.handle(error, {
      component: 'CustomService',
      method: 'getCustomDetail',
      data: { customId }
    });
    
    throw error;
  }
}

/**
 * 获取当前设备的定制订单列表（购物车「我的定制」）
 * @returns {Promise}
 */
export async function getMyCustomList() {
  const deviceId = getDeviceId();
  try {
    const result = await get('/api/custom/my', {
      deviceId,
      _t: Date.now(),
    }, {
      useCache: false,
      showLoading: false,
      showError: false,
    });
    if (Array.isArray(result)) {
      return result;
    }
    if (result && Array.isArray(result.rows)) {
      return result.rows;
    }
    return [];
  } catch (error) {
    console.warn('[getMyCustomList] 请求失败，将使用本地缓存', error);
    ErrorHandler.handle(error, {
      component: 'CustomService',
      method: 'getMyCustomList',
    });
    return [];
  }
}

/** 定制提交成功后清除列表缓存，确保下次拉取最新数据 */
export function invalidateMyCustomListCache() {
  clearCache('/api/custom/my');
}

/**
 * 获取定制订单列表
 * @param {Number} orderId - 订单ID
 * @returns {Promise} - 返回Promise对象
 */
export async function getCustomList(orderId) {
  const monitor = PerformanceMonitor.start('get_custom_list');
  
  try {
    const result = await get(`/api/custom/list/${orderId}`, { deviceId: getDeviceId() }, {
      useCache: true,
      cacheDuration: 30 * 1000 // 30秒缓存
    });
    
    PerformanceMonitor.end(monitor, {
      tags: { action: 'get_custom_list', success: true, orderId }
    });
    
    return result;
  } catch (error) {
    PerformanceMonitor.end(monitor, {
      tags: { 
        action: 'get_custom_list', 
        success: false, 
        error: error.message,
        orderId 
      }
    });
    
    ErrorHandler.handle(error, {
      component: 'CustomService',
      method: 'getCustomList',
      data: { orderId }
    });
    
    return [];
  }
}
