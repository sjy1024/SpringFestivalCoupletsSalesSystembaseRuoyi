/**
 * 统一请求封装 - 增强版
 * 支持：拦截器、重试机制、缓存、错误处理、性能监控
 */

import { envConfig } from '../../config/env.config';
import { getDeviceId } from '../../utils/deviceId';

// 配置管理
const config = {
  // 环境配置
  baseURL: envConfig.baseURL,
  
  // 请求配置
  timeout: envConfig.timeout,
  retryCount: envConfig.retryCount,
  retryDelay: 1000,
  
  // 缓存配置
  cacheEnabled: envConfig.cacheEnabled,
  cacheDuration: envConfig.cacheDuration,
  
  // 性能监控
  enablePerformance: envConfig.enablePerformance,
  
  // 错误处理
  enableErrorHandler: envConfig.enableErrorTracking,
  
  // 默认配置
  defaultHeaders: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'X-App-Version': envConfig.version,
    'X-Env': envConfig.env
  }
};

// 请求队列管理
const requestQueue = new Map();
let requestIdCounter = 0;

// 缓存管理
const cacheStore = new Map();

// 拦截器
const interceptors = {
  request: [],
  response: [],
  error: []
};

/**
 * 生成唯一请求ID
 */
function generateRequestId() {
  return `req_${Date.now()}_${++requestIdCounter}`;
}

/**
 * 添加拦截器
 */
export function addInterceptor(type, interceptor) {
  if (interceptors[type]) {
    interceptors[type].push(interceptor);
  }
}

/**
 * 执行请求拦截器
 */
async function runRequestInterceptors(config) {
  let currentConfig = { ...config };
  
  for (const interceptor of interceptors.request) {
    currentConfig = await interceptor(currentConfig);
  }
  
  return currentConfig;
}

/**
 * 执行响应拦截器
 */
async function runResponseInterceptors(response) {
  let currentResponse = { ...response };
  
  for (const interceptor of interceptors.response) {
    currentResponse = await interceptor(currentResponse);
  }
  
  return currentResponse;
}

/**
 * 执行错误拦截器
 */
async function runErrorInterceptors(error, config) {
  let currentError = error;
  
  for (const interceptor of interceptors.error) {
    currentError = await interceptor(currentError, config);
  }
  
  return currentError;
}

/**
 * 获取缓存键
 */
function getCacheKey(url, data, method) {
  const dataStr = JSON.stringify(data || {});
  return `${method}_${url}_${dataStr}`;
}

/**
 * 检查缓存
 */
function checkCache(cacheKey) {
  if (!config.cacheEnabled) return null;
  
  const cached = cacheStore.get(cacheKey);
  if (!cached) return null;
  
  // 检查是否过期
  if (Date.now() - cached.timestamp > config.cacheDuration) {
    cacheStore.delete(cacheKey);
    return null;
  }
  
  return cached.data;
}

/**
 * 设置缓存
 */
function setCache(cacheKey, data) {
  if (!config.cacheEnabled) return;
  
  cacheStore.set(cacheKey, {
    data,
    timestamp: Date.now()
  });
}

/**
 * 清除缓存
 */
export function clearCache(pattern = null) {
  if (pattern) {
    for (const [key] of cacheStore) {
      if (key.includes(pattern)) {
        cacheStore.delete(key);
      }
    }
  } else {
    cacheStore.clear();
  }
}

/**
 * 性能监控
 */
class PerformanceMonitor {
  static timers = new Map();
  
  static start(name) {
    this.timers.set(name, {
      startTime: Date.now(),
      startMemory: wx.getStorageInfoSync().currentSize
    });
  }
  
  static end(name) {
    const timer = this.timers.get(name);
    if (!timer) return null;
    
    const duration = Date.now() - timer.startTime;
    const endMemory = wx.getStorageInfoSync().currentSize;
    const memoryDiff = endMemory - timer.startMemory;
    
    this.timers.delete(name);
    
    if (config.enablePerformance) {
      console.log(`[Performance] ${name}: ${duration}ms, memory: ${memoryDiff}KB`);
    }
    
    return { duration, memoryDiff };
  }
}

/**
 * 错误处理器
 */
class ErrorHandler {
  static handle(error, context = {}) {
    const errorInfo = {
      code: error.code || 'UNKNOWN_ERROR',
      message: error.message || '未知错误',
      url: context.url,
      method: context.method,
      timestamp: new Date().toISOString(),
      userInfo: wx.getStorageSync('userInfo') || {}
    };
    
    // 根据错误类型处理
    switch (errorInfo.code) {
      case 'NETWORK_ERROR':
        this.handleNetworkError(errorInfo);
        break;
      case 'TIMEOUT':
        this.handleTimeoutError(errorInfo);
        break;
      case 'BUSINESS_ERROR':
        this.handleBusinessError(errorInfo);
        break;
      default:
        this.handleUnknownError(errorInfo);
    }
    
    // 记录错误日志
    this.logError(errorInfo);
    
    return errorInfo;
  }
  
  static handleNetworkError(error) {
    wx.showToast({
      title: '网络连接失败，请检查网络设置',
      icon: 'none',
      duration: 3000
    });
  }
  
  static handleTimeoutError(error) {
    wx.showToast({
      title: '请求超时，请稍后重试',
      icon: 'none',
      duration: 3000
    });
  }
  
  static handleBusinessError(error) {
    wx.showToast({
      title: error.message || '操作失败',
      icon: 'none',
      duration: 3000
    });
  }
  
  static handleUnknownError(error) {
    wx.showToast({
      title: '系统繁忙，请稍后重试',
      icon: 'none',
      duration: 3000
    });
  }
  
  static logError(error) {
    // 这里可以发送错误日志到服务器
    console.error('[Error]', error);
  }
}

/**
 * 统一请求方法
 * @param {Object} options - 请求配置
 * @param {string} options.url - 请求地址
 * @param {string} options.method - 请求方法，默认GET
 * @param {Object} options.data - 请求数据
 * @param {Object} options.header - 请求头
 * @param {boolean} options.showLoading - 是否显示loading，默认true
 * @param {boolean} options.showError - 是否显示错误提示，默认true
 * @param {boolean} options.useCache - 是否使用缓存，默认false
 * @param {boolean} options.retry - 是否重试，默认true
 * @returns {Promise} - 返回Promise对象
 */
export async function request(options = {}) {
  const requestId = generateRequestId();
  const startTime = Date.now();
  
  const defaultOptions = {
    method: 'GET',
    data: {},
    header: {},
    showLoading: true,
    showError: true,
    useCache: false,
    retry: true,
    retryCount: config.retryCount,
    timeout: config.timeout
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  
  // 检查缓存
  if (mergedOptions.useCache && mergedOptions.method === 'GET') {
    const cacheKey = getCacheKey(mergedOptions.url, mergedOptions.data, mergedOptions.method);
    const cachedData = checkCache(cacheKey);
    if (cachedData) {
      console.log(`[Cache] 命中缓存: ${mergedOptions.url}`);
      return Promise.resolve(cachedData);
    }
  }
  
  // 显示loading
  if (mergedOptions.showLoading) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
  }
  
  // 执行请求拦截器
  let requestConfig = await runRequestInterceptors({
    url: config.baseURL + mergedOptions.url,
    method: mergedOptions.method,
    data: mergedOptions.data,
    header: {
      ...config.defaultHeaders,
      'X-Request-ID': requestId,
      'X-Device-ID': getDeviceId(),
      'Authorization': wx.getStorageSync('token') ? `Bearer ${wx.getStorageSync('token')}` : '',
      ...mergedOptions.header
    },
    timeout: mergedOptions.timeout
  });
  
  // 性能监控开始
  PerformanceMonitor.start(`request_${requestId}`);
  
  // 重试逻辑
  const executeRequest = async (retryAttempt = 0) => {
    return new Promise((resolve, reject) => {
      const requestTask = wx.request({
        ...requestConfig,
        success: async (res) => {
          // 性能监控结束
          PerformanceMonitor.end(`request_${requestId}`);
          
          // 隐藏loading
          if (mergedOptions.showLoading) {
            wx.hideLoading();
          }
          
          // 从请求队列中移除
          requestQueue.delete(requestId);
          
          try {
            // 执行响应拦截器
            const processedResponse = await runResponseInterceptors({
              statusCode: res.statusCode,
              data: res.data,
              header: res.header,
              config: requestConfig
            });
            
            // 处理响应数据
            if (processedResponse.statusCode === 200) {
              const { code, data: responseData, msg } = processedResponse.data;
              
              if (code === 200) {
                // 成功，设置缓存
                if (mergedOptions.useCache && mergedOptions.method === 'GET') {
                  const cacheKey = getCacheKey(mergedOptions.url, mergedOptions.data, mergedOptions.method);
                  setCache(cacheKey, responseData);
                }
                
                resolve(responseData);
              } else {
                // 业务错误
                const error = new Error(msg || '请求失败');
                error.code = 'BUSINESS_ERROR';
                error.response = processedResponse;
                
                if (mergedOptions.showError) {
                  ErrorHandler.handle(error, {
                    url: mergedOptions.url,
                    method: mergedOptions.method
                  });
                }
                
                reject(error);
              }
            } else {
              // HTTP错误
              const error = new Error(`HTTP错误: ${processedResponse.statusCode}`);
              error.code = 'HTTP_ERROR';
              error.response = processedResponse;
              
              if (mergedOptions.showError) {
                ErrorHandler.handle(error, {
                  url: mergedOptions.url,
                  method: mergedOptions.method
                });
              }
              
              reject(error);
            }
          } catch (error) {
            // 拦截器错误
            const interceptorError = new Error(`拦截器处理失败: ${error.message}`);
            interceptorError.code = 'INTERCEPTOR_ERROR';
            interceptorError.originalError = error;
            
            if (mergedOptions.showError) {
              ErrorHandler.handle(interceptorError, {
                url: mergedOptions.url,
                method: mergedOptions.method
              });
            }
            
            reject(interceptorError);
          }
        },
        fail: async (err) => {
          // 性能监控结束
          PerformanceMonitor.end(`request_${requestId}`);
          
          // 隐藏loading
          if (mergedOptions.showLoading) {
            wx.hideLoading();
          }
          
          // 从请求队列中移除
          requestQueue.delete(requestId);
          
          // 重试逻辑
          if (mergedOptions.retry && retryAttempt < mergedOptions.retryCount) {
            console.log(`[Retry] 请求失败，第${retryAttempt + 1}次重试: ${mergedOptions.url}`);
            
            setTimeout(() => {
              executeRequest(retryAttempt + 1)
                .then(resolve)
                .catch(reject);
            }, config.retryDelay);
            return;
          }
          
          // 执行错误拦截器
          try {
            const processedError = await runErrorInterceptors(err, requestConfig);
            
            const error = new Error(processedError.errMsg || '网络请求失败');
            error.code = 'NETWORK_ERROR';
            error.originalError = processedError;
            
            if (mergedOptions.showError) {
              ErrorHandler.handle(error, {
                url: mergedOptions.url,
                method: mergedOptions.method
              });
            }
            
            reject(error);
          } catch (interceptorError) {
            const error = new Error(`错误拦截器处理失败: ${interceptorError.message}`);
            error.code = 'INTERCEPTOR_ERROR';
            
            if (mergedOptions.showError) {
              ErrorHandler.handle(error, {
                url: mergedOptions.url,
                method: mergedOptions.method
              });
            }
            
            reject(error);
          }
        }
      });
      
      // 保存请求任务到队列
      requestQueue.set(requestId, requestTask);
      
      // 超时处理
      if (mergedOptions.timeout > 0) {
        setTimeout(() => {
          if (requestQueue.has(requestId)) {
            const requestTask = requestQueue.get(requestId);
            requestTask.abort();
            requestQueue.delete(requestId);
            
            const error = new Error(`请求超时: ${mergedOptions.timeout}ms`);
            error.code = 'TIMEOUT';
            
            if (mergedOptions.showError) {
              ErrorHandler.handle(error, {
                url: mergedOptions.url,
                method: mergedOptions.method
              });
            }
            
            reject(error);
          }
        }, mergedOptions.timeout);
      }
    });
  };
  
  return executeRequest();
}

/**
 * GET请求快捷方法
 */
export function get(url, data = {}, options = {}) {
  return request({
    url,
    method: 'GET',
    data,
    ...options
  });
}

/**
 * POST请求快捷方法
 */
export function post(url, data = {}, options = {}) {
  return request({
    url,
    method: 'POST',
    data,
    ...options
  });
}

/**
 * PUT请求快捷方法
 */
export function put(url, data = {}, options = {}) {
  return request({
    url,
    method: 'PUT',
    data,
    ...options
  });
}

/**
 * DELETE请求快捷方法
 */
export function del(url, data = {}, options = {}) {
  return request({
    url,
    method: 'DELETE',
    data,
    ...options
  });
}

/**
 * 取消请求
 */
export function cancelRequest(requestId) {
  if (requestQueue.has(requestId)) {
    const requestTask = requestQueue.get(requestId);
    requestTask.abort();
    requestQueue.delete(requestId);
    console.log(`[Request] 已取消请求: ${requestId}`);
  }
}

/**
 * 取消所有请求
 */
export function cancelAllRequests() {
  requestQueue.forEach((requestTask, requestId) => {
    requestTask.abort();
    console.log(`[Request] 已取消请求: ${requestId}`);
  });
  requestQueue.clear();
}

/**
 * 获取请求队列大小
 */
export function getRequestQueueSize() {
  return requestQueue.size;
}

/**
 * 获取缓存大小
 */
export function getCacheSize() {
  return cacheStore.size;
}

/**
 * 获取配置
 */
export function getConfig() {
  return { ...config };
}

/**
 * 更新配置
 */
export function updateConfig(newConfig) {
  Object.assign(config, newConfig);
}

/**
 * 将后端返回的相对路径转换为可访问的绝对URL
 */
export function toAbsoluteUrl(src) {
  if (!src || typeof src !== 'string') return '';
  if (src.indexOf('http://') === 0 || src.indexOf('https://') === 0) return src;
  if (src.indexOf('//') === 0) return `https:${src}`;
  if (src.indexOf('/') === 0) return `${config.baseURL}${src}`;
  return src;
}

/**
 * 获取后端基础地址
 */
export function getBaseUrl() {
  return config.baseURL;
}

/** 首屏请求：短超时、不重试，避免后端未启动时长时间白屏 */
export const STARTUP_REQUEST_OPTIONS = {
  showLoading: false,
  showError: false,
  timeout: 3000,
  retry: false,
  retryCount: 0,
};

// 默认导出
export default {
  request,
  get,
  post,
  put,
  delete: del,
  cancelRequest,
  cancelAllRequests,
  getRequestQueueSize,
  getCacheSize,
  clearCache,
  getConfig,
  updateConfig,
  toAbsoluteUrl,
  getBaseUrl,
  addInterceptor,
  PerformanceMonitor,
  ErrorHandler
};