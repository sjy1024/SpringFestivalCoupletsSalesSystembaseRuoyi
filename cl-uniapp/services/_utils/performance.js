/**
 * 性能监控工具
 * 监控应用性能指标，包括加载时间、渲染时间、API响应时间等
 */

import { envConfig } from '../../config/env.config';

// 性能指标类型
export const METRIC_TYPES = {
  PAGE_LOAD: 'PAGE_LOAD',           // 页面加载
  API_REQUEST: 'API_REQUEST',       // API请求
  IMAGE_LOAD: 'IMAGE_LOAD',         // 图片加载
  RENDER: 'RENDER',                 // 渲染
  NETWORK: 'NETWORK',               // 网络
  MEMORY: 'MEMORY',                 // 内存
  STORAGE: 'STORAGE'                // 存储
};

// 性能监控配置
const config = {
  enabled: envConfig.enablePerformance,
  sampleRate: 0.1, // 采样率，10%的请求会被记录
  maxMetrics: 1000, // 最大记录数量
  sendInterval: 60000, // 发送间隔，60秒
  debug: envConfig.debug
};

// 性能数据存储
const metrics = [];
let lastSendTime = 0;

/**
 * 性能监控器类
 */
export class PerformanceMonitor {
  /**
   * 开始监控
   * @param {string} name - 监控名称
   * @param {string} type - 监控类型
   * @returns {Object} 监控对象
   */
  static start(name, type = METRIC_TYPES.API_REQUEST) {
    if (!config.enabled) return null;
    
    // 采样控制
    if (Math.random() > config.sampleRate) return null;
    
    const monitor = {
      id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      type,
      startTime: Date.now(),
      startMemory: this.getMemoryUsage(),
      startStorage: this.getStorageUsage(),
      tags: {}
    };
    
    return monitor;
  }
  
  /**
   * 结束监控
   * @param {Object} monitor - 监控对象
   * @param {Object} data - 附加数据
   * @returns {Object} 性能指标
   */
  static end(monitor, data = {}) {
    if (!monitor || !config.enabled) return null;
    
    const endTime = Date.now();
    const duration = endTime - monitor.startTime;
    const endMemory = this.getMemoryUsage();
    const endStorage = this.getStorageUsage();
    
    const metric = {
      id: monitor.id,
      name: monitor.name,
      type: monitor.type,
      duration,
      startTime: monitor.startTime,
      endTime,
      memoryDiff: endMemory - monitor.startMemory,
      storageDiff: endStorage - monitor.startStorage,
      tags: { ...monitor.tags, ...data.tags },
      data: data.data || {},
      userInfo: this.getUserInfo(),
      deviceInfo: this.getDeviceInfo(),
      timestamp: new Date().toISOString()
    };
    
    // 记录指标
    this.recordMetric(metric);
    
    // 开发环境输出日志
    if (config.debug) {
      this.logMetric(metric);
    }
    
    return metric;
  }
  
  /**
   * 记录性能指标
   */
  static recordMetric(metric) {
    metrics.push(metric);
    
    // 限制记录数量
    if (metrics.length > config.maxMetrics) {
      metrics.shift();
    }
    
    // 检查是否需要发送
    this.checkAndSend();
  }
  
  /**
   * 检查并发送性能数据
   */
  static checkAndSend() {
    const now = Date.now();
    
    // 检查发送间隔
    if (now - lastSendTime < config.sendInterval) return;
    
    // 发送性能数据
    this.sendMetrics();
    lastSendTime = now;
  }
  
  /**
   * 发送性能数据到服务器
   */
  static async sendMetrics() {
    if (metrics.length === 0) return;
    
    try {
      // 复制当前指标
      const metricsToSend = [...metrics];
      
      // 清空本地记录
      metrics.length = 0;
      
      // 生产环境发送到服务器
      if (envConfig.isProd) {
        // 这里可以调用后端性能监控接口
        // 示例：使用wx.request发送性能数据
        if (typeof wx !== 'undefined' && wx.request) {
          wx.request({
            url: `${envConfig.baseURL}/api/performance/metrics`,
            method: 'POST',
            data: {
              metrics: metricsToSend,
              timestamp: new Date().toISOString(),
              appVersion: envConfig.version,
              env: envConfig.env
            },
            header: {
              'Content-Type': 'application/json'
            }
          });
        }
      }
    } catch (error) {
      console.error('发送性能数据失败:', error);
    }
  }
  
  /**
   * 获取内存使用情况
   */
  static getMemoryUsage() {
    try {
      const storageInfo = wx.getStorageInfoSync();
      return storageInfo.currentSize || 0;
    } catch (error) {
      return 0;
    }
  }
  
  /**
   * 获取存储使用情况
   */
  static getStorageUsage() {
    try {
      const fileSystemInfo = wx.getFileSystemManager();
      // 这里可以获取更详细的存储信息
      return 0;
    } catch (error) {
      return 0;
    }
  }
  
  /**
   * 获取用户信息
   */
  static getUserInfo() {
    try {
      const userInfo = wx.getStorageSync('userInfo') || {};
      return {
        userId: userInfo.userId,
        // 其他用户信息...
      };
    } catch (error) {
      return {};
    }
  }
  
  /**
   * 获取设备信息
   */
  static getDeviceInfo() {
    try {
      const systemInfo = wx.getSystemInfoSync();
      return {
        platform: systemInfo.platform,
        system: systemInfo.system,
        version: systemInfo.version,
        model: systemInfo.model
      };
    } catch (error) {
      return {};
    }
  }
  
  /**
   * 记录性能指标日志
   */
  static logMetric(metric) {
    console.group(`📊 性能指标: ${metric.name}`);
    console.log('类型:', metric.type);
    console.log('耗时:', metric.duration, 'ms');
    console.log('内存变化:', metric.memoryDiff, 'KB');
    console.log('存储变化:', metric.storageDiff, 'KB');
    console.log('标签:', metric.tags);
    console.groupEnd();
  }
  
  /**
   * 监控页面加载
   */
  static monitorPageLoad(pageName) {
    const monitor = this.start(pageName, METRIC_TYPES.PAGE_LOAD);
    
    // 页面显示时结束监控
    const endMonitor = () => {
      if (monitor) {
        this.end(monitor, {
          tags: { page: pageName },
          data: { event: 'page_show' }
        });
      }
    };
    
    // 监听页面显示事件
    if (typeof wx !== 'undefined' && wx.onAppShow) {
      wx.onAppShow(endMonitor);
    }
    
    return monitor;
  }
  
  /**
   * 监控API请求
   */
  static monitorAPIRequest(url, method) {
    const monitor = this.start(`${method} ${url}`, METRIC_TYPES.API_REQUEST);
    
    if (monitor) {
      monitor.tags = { url, method };
    }
    
    return monitor;
  }
  
  /**
   * 监控图片加载
   */
  static monitorImageLoad(src) {
    const monitor = this.start(`Image: ${src}`, METRIC_TYPES.IMAGE_LOAD);
    
    if (monitor) {
      monitor.tags = { src };
    }
    
    return monitor;
  }
  
  /**
   * 获取性能报告
   */
  static getPerformanceReport() {
    const report = {
      totalMetrics: metrics.length,
      averageDuration: 0,
      metricsByType: {},
      slowestRequests: [],
      timestamp: new Date().toISOString()
    };
    
    if (metrics.length === 0) return report;
    
    // 计算平均耗时
    const totalDuration = metrics.reduce((sum, metric) => sum + metric.duration, 0);
    report.averageDuration = Math.round(totalDuration / metrics.length);
    
    // 按类型分组
    metrics.forEach(metric => {
      if (!report.metricsByType[metric.type]) {
        report.metricsByType[metric.type] = {
          count: 0,
          totalDuration: 0,
          averageDuration: 0
        };
      }
      
      const typeStats = report.metricsByType[metric.type];
      typeStats.count++;
      typeStats.totalDuration += metric.duration;
    });
    
    // 计算各类型平均耗时
    Object.keys(report.metricsByType).forEach(type => {
      const stats = report.metricsByType[type];
      stats.averageDuration = Math.round(stats.totalDuration / stats.count);
    });
    
    // 找出最慢的请求
    report.slowestRequests = [...metrics]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10)
      .map(metric => ({
        name: metric.name,
        duration: metric.duration,
        type: metric.type,
        timestamp: metric.timestamp
      }));
    
    return report;
  }
  
  /**
   * 清空性能数据
   */
  static clearMetrics() {
    metrics.length = 0;
  }
  
  /**
   * 启用/禁用性能监控
   */
  static setEnabled(enabled) {
    config.enabled = enabled;
  }
  
  /**
   * 获取配置
   */
  static getConfig() {
    return { ...config };
  }
  
  /**
   * 更新配置
   */
  static updateConfig(newConfig) {
    Object.assign(config, newConfig);
  }
}

// 快捷方法
export function startMonitor(name, type) {
  return PerformanceMonitor.start(name, type);
}

export function endMonitor(monitor, data) {
  return PerformanceMonitor.end(monitor, data);
}

export function monitorPageLoad(pageName) {
  return PerformanceMonitor.monitorPageLoad(pageName);
}

export function monitorAPIRequest(url, method) {
  return PerformanceMonitor.monitorAPIRequest(url, method);
}

export function getPerformanceReport() {
  return PerformanceMonitor.getPerformanceReport();
}

// 默认导出
export default PerformanceMonitor;