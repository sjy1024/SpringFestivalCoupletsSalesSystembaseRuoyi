/**
 * 全局错误处理器
 * 统一处理应用中的各种错误
 */

import { envConfig } from '../../config/env.config';

// 错误类型
export const ERROR_TYPES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  BUSINESS_ERROR: 'BUSINESS_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  PERMISSION_ERROR: 'PERMISSION_ERROR',
  SYSTEM_ERROR: 'SYSTEM_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

// 错误级别
export const ERROR_LEVELS = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical'
};

/**
 * 错误处理器类
 */
export class ErrorHandler {
  /**
   * 处理错误
   * @param {Error|Object} error - 错误对象
   * @param {Object} context - 错误上下文
   * @param {string} context.url - 请求URL
   * @param {string} context.method - 请求方法
   * @param {string} context.page - 页面路径
   * @param {string} context.component - 组件名称
   * @returns {Object} 处理后的错误信息
   */
  static handle(error, context = {}) {
    // 解析错误信息
    const errorInfo = this.parseError(error, context);
    
    // 根据环境处理错误
    if (envConfig.isProd) {
      this.handleProductionError(errorInfo);
    } else {
      this.handleDevelopmentError(errorInfo);
    }
    
    // 记录错误日志
    this.logError(errorInfo);
    
    // 返回错误信息
    return errorInfo;
  }
  
  /**
   * 解析错误
   */
  static parseError(error, context) {
    const errorInfo = {
      // 基础信息
      code: error.code || ERROR_TYPES.UNKNOWN_ERROR,
      message: error.message || '未知错误',
      stack: error.stack,
      timestamp: new Date().toISOString(),
      
      // 上下文信息
      url: context.url,
      method: context.method,
      page: context.page,
      component: context.component,
      
      // 用户信息
      userInfo: this.getUserInfo(),
      deviceInfo: this.getDeviceInfo(),
      
      // 错误级别
      level: this.getErrorLevel(error),
      
      // 原始错误
      originalError: error
    };
    
    return errorInfo;
  }
  
  /**
   * 处理生产环境错误
   */
  static handleProductionError(errorInfo) {
    switch (errorInfo.code) {
      case ERROR_TYPES.NETWORK_ERROR:
        this.showUserFriendlyMessage('网络连接失败，请检查网络设置后重试');
        break;
        
      case ERROR_TYPES.TIMEOUT_ERROR:
        this.showUserFriendlyMessage('请求超时，请稍后重试');
        break;
        
      case ERROR_TYPES.BUSINESS_ERROR:
        this.showUserFriendlyMessage(errorInfo.message || '操作失败，请稍后重试');
        break;
        
      case ERROR_TYPES.AUTH_ERROR:
        this.showUserFriendlyMessage('登录已过期，请重新登录');
        this.redirectToLogin();
        break;
        
      case ERROR_TYPES.PERMISSION_ERROR:
        this.showUserFriendlyMessage('权限不足，无法执行此操作');
        break;
        
      case ERROR_TYPES.VALIDATION_ERROR:
        this.showUserFriendlyMessage('输入信息有误，请检查后重试');
        break;
        
      default:
        this.showUserFriendlyMessage('系统繁忙，请稍后重试');
    }
  }
  
  /**
   * 处理开发环境错误
   */
  static handleDevelopmentError(errorInfo) {
    // 开发环境显示详细错误信息
    console.group('🚨 错误详情');
    console.error('错误类型:', errorInfo.code);
    console.error('错误信息:', errorInfo.message);
    console.error('错误堆栈:', errorInfo.stack);
    console.error('上下文:', {
      url: errorInfo.url,
      method: errorInfo.method,
      page: errorInfo.page,
      component: errorInfo.component
    });
    console.groupEnd();
    
    // 同时显示用户友好提示
    this.handleProductionError(errorInfo);
  }
  
  /**
   * 显示用户友好提示
   */
  static showUserFriendlyMessage(message) {
    if (typeof wx !== 'undefined' && wx.showToast) {
      wx.showToast({
        title: message,
        icon: 'none',
        duration: 3000
      });
    }
  }
  
  /**
   * 重定向到登录页
   */
  static redirectToLogin() {
    if (typeof wx !== 'undefined' && wx.navigateTo) {
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/usercenter/index'
        });
      }, 1500);
    }
  }
  
  /**
   * 记录错误日志
   */
  static logError(errorInfo) {
    // 本地存储错误日志
    this.saveErrorToLocal(errorInfo);
    
    // 生产环境发送到服务器
    if (envConfig.isProd && envConfig.enableErrorTracking) {
      this.sendErrorToServer(errorInfo);
    }
  }
  
  /**
   * 保存错误到本地
   */
  static saveErrorToLocal(errorInfo) {
    try {
      const errorLogs = wx.getStorageSync('error_logs') || [];
      
      // 限制日志数量
      if (errorLogs.length >= 100) {
        errorLogs.shift();
      }
      
      errorLogs.push({
        ...errorInfo,
        // 移除原始错误对象，避免循环引用
        originalError: undefined
      });
      
      wx.setStorageSync('error_logs', errorLogs);
    } catch (error) {
      console.error('保存错误日志失败:', error);
    }
  }
  
  /**
   * 发送错误到服务器
   */
  static async sendErrorToServer(errorInfo) {
    try {
      // 这里可以调用后端错误收集接口
      // 示例：使用wx.request发送错误信息
      if (typeof wx !== 'undefined' && wx.request) {
        wx.request({
          url: `${envConfig.baseURL}/api/error/log`,
          method: 'POST',
          data: {
            ...errorInfo,
            // 移除敏感信息
            userInfo: this.maskSensitiveInfo(errorInfo.userInfo),
            originalError: undefined
          },
          header: {
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('发送错误日志到服务器失败:', error);
    }
  }
  
  /**
   * 获取错误级别
   */
  static getErrorLevel(error) {
    const code = error.code || '';
    
    if (code.includes('CRITICAL') || code.includes('AUTH')) {
      return ERROR_LEVELS.CRITICAL;
    } else if (code.includes('NETWORK') || code.includes('TIMEOUT')) {
      return ERROR_LEVELS.ERROR;
    } else if (code.includes('BUSINESS') || code.includes('VALIDATION')) {
      return ERROR_LEVELS.WARNING;
    } else {
      return ERROR_LEVELS.INFO;
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
        username: userInfo.username,
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
        model: systemInfo.model,
        screenWidth: systemInfo.screenWidth,
        screenHeight: systemInfo.screenHeight,
        language: systemInfo.language,
        deviceId: wx.getStorageSync('deviceId') || ''
      };
    } catch (error) {
      return {};
    }
  }
  
  /**
   * 脱敏敏感信息
   */
  static maskSensitiveInfo(info) {
    if (!info) return {};
    
    const masked = { ...info };
    
    // 脱敏手机号
    if (masked.phone) {
      masked.phone = masked.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
    }
    
    // 脱敏邮箱
    if (masked.email) {
      const [local, domain] = masked.email.split('@');
      if (local && domain) {
        const maskedLocal = local.length > 2 
          ? local.substring(0, 2) + '*'.repeat(local.length - 2)
          : local;
        masked.email = `${maskedLocal}@${domain}`;
      }
    }
    
    // 移除密码等敏感字段
    delete masked.password;
    delete masked.token;
    delete masked.accessToken;
    delete masked.refreshToken;
    
    return masked;
  }
  
  /**
   * 获取错误日志
   */
  static getErrorLogs(limit = 50) {
    try {
      const errorLogs = wx.getStorageSync('error_logs') || [];
      return errorLogs.slice(-limit);
    } catch (error) {
      return [];
    }
  }
  
  /**
   * 清空错误日志
   */
  static clearErrorLogs() {
    try {
      wx.removeStorageSync('error_logs');
    } catch (error) {
      console.error('清空错误日志失败:', error);
    }
  }
  
  /**
   * 创建自定义错误
   */
  static createError(code, message, originalError = null) {
    const error = new Error(message);
    error.code = code;
    
    if (originalError) {
      error.originalError = originalError;
    }
    
    return error;
  }
  
  /**
   * 验证错误
   */
  static validateError(error) {
    if (!error) {
      return this.createError(ERROR_TYPES.UNKNOWN_ERROR, '错误对象为空');
    }
    
    if (!error.code) {
      error.code = ERROR_TYPES.UNKNOWN_ERROR;
    }
    
    if (!error.message) {
      error.message = '未知错误';
    }
    
    return error;
  }
}

// 快捷方法
export function handleError(error, context = {}) {
  return ErrorHandler.handle(error, context);
}

export function createError(code, message, originalError = null) {
  return ErrorHandler.createError(code, message, originalError);
}

export function showError(message) {
  ErrorHandler.showUserFriendlyMessage(message);
}

// 默认导出
export default ErrorHandler;