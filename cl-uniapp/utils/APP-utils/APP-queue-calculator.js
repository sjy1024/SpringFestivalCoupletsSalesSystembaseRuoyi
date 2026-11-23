// 排队计算工具

import { QUEUE_CONFIG } from '../../config/APP-config';

/**
 * 排队计算工具类
 */
class QueueCalculator {
  /**
   * 计算订单排队信息
   * @param {number} queuePosition - 当前排队位置
   * @param {number} totalQueue - 总排队数量
   * @param {number} avgProcessTime - 平均处理时间（分钟）
   * @returns {Object} - 排队计算结果
   */
  static calculateQueueInfo(queuePosition, totalQueue, avgProcessTime = QUEUE_CONFIG.AVG_PROCESS_TIME) {
    // 验证参数
    queuePosition = Math.max(0, queuePosition || 0);
    totalQueue = Math.max(queuePosition, totalQueue || queuePosition);
    
    // 计算排队进度
    const progress = totalQueue > 0 ? Math.min(100, Math.round(((totalQueue - queuePosition) / totalQueue) * 100)) : 100;
    
    // 计算预估等待时间（分钟）
    const estimatedWaitTime = queuePosition * avgProcessTime;
    
    // 计算预估完成时间
    const estimatedCompleteTime = this.calculateEstimatedCompleteTime(estimatedWaitTime);
    
    // 排队状态
    const status = this.getQueueStatus(queuePosition, progress);
    
    return {
      queuePosition,
      totalQueue,
      progress,
      avgProcessTime,
      estimatedWaitTime,
      estimatedCompleteTime,
      status,
      updateTime: new Date().toISOString()
    };
  }
  
  /**
   * 计算预估完成时间
   * @param {number} waitTime - 预估等待时间（分钟）
   * @returns {string} - 预估完成时间字符串
   */
  static calculateEstimatedCompleteTime(waitTime) {
    const now = new Date();
    const completeTime = new Date(now.getTime() + waitTime * 60 * 1000);
    
    // 格式化时间
    const year = completeTime.getFullYear();
    const month = String(completeTime.getMonth() + 1).padStart(2, '0');
    const day = String(completeTime.getDate()).padStart(2, '0');
    const hours = String(completeTime.getHours()).padStart(2, '0');
    const minutes = String(completeTime.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }
  
  /**
   * 获取排队状态
   * @param {number} queuePosition - 当前排队位置
   * @param {number} progress - 排队进度
   * @returns {string} - 排队状态
   */
  static getQueueStatus(queuePosition, progress) {
    if (queuePosition === 0) {
      return '正在处理';
    } else if (progress < 30) {
      return '排队中';
    } else if (progress < 70) {
      return '即将处理';
    } else {
      return '处理中';
    }
  }
  
  /**
   * 计算排队位置变化
   * @param {number} currentPosition - 当前位置
   * @param {number} processedCount - 已处理数量
   * @returns {number} - 新的排队位置
   */
  static calculateNewPosition(currentPosition, processedCount) {
    return Math.max(0, currentPosition - processedCount);
  }
  
  /**
   * 生成排队编号
   * @param {string} orderNo - 订单号
   * @returns {string} - 排队编号
   */
  static generateQueueNumber(orderNo) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `Q${orderNo || timestamp}${random}`;
  }
  
  /**
   * 计算排队更新间隔
   * @param {number} queuePosition - 当前排队位置
   * @returns {number} - 更新间隔（秒）
   */
  static calculateUpdateInterval(queuePosition) {
    // 排队位置越靠前，更新间隔越短
    if (queuePosition <= 5) {
      return 10; // 10秒
    } else if (queuePosition <= 15) {
      return 20; // 20秒
    } else {
      return QUEUE_CONFIG.UPDATE_INTERVAL; // 默认30秒
    }
  }
  
  /**
   * 验证排队数据有效性
   * @param {Object} queueData - 排队数据
   * @returns {boolean} - 是否有效
   */
  static isValidQueueData(queueData) {
    if (!queueData) {
      return false;
    }
    
    const { queuePosition, totalQueue, updateTime } = queueData;
    
    // 验证数据类型
    if (typeof queuePosition !== 'number' || typeof totalQueue !== 'number') {
      return false;
    }
    
    // 验证数据范围
    if (queuePosition < 0 || totalQueue < queuePosition) {
      return false;
    }
    
    // 验证更新时间
    if (updateTime) {
      const updateDate = new Date(updateTime);
      const now = new Date();
      const timeDiff = now - updateDate;
      
      // 数据超过1小时视为无效
      if (timeDiff > 60 * 60 * 1000) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * 模拟排队数据（用于测试）
   * @param {number} basePosition - 基础位置
   * @returns {Object} - 模拟排队数据
   */
  static generateMockQueueData(basePosition = 10) {
    const queuePosition = Math.max(0, basePosition - Math.floor(Math.random() * 3));
    const totalQueue = queuePosition + Math.floor(Math.random() * 20) + 5;
    
    return this.calculateQueueInfo(queuePosition, totalQueue);
  }
  
  /**
   * 获取排队提示信息
   * @param {Object} queueInfo - 排队信息
   * @returns {string} - 提示信息
   */
  static getQueueMessage(queueInfo) {
    if (!queueInfo) {
      return '正在获取排队信息...';
    }
    
    const { queuePosition, estimatedWaitTime, status } = queueInfo;
    
    if (queuePosition === 0) {
      return '您的订单正在处理中，请耐心等待';
    } else if (estimatedWaitTime < 60) {
      return `您当前排在第${queuePosition}位，预计${estimatedWaitTime}分钟后开始处理，${status}`;
    } else {
      const hours = Math.floor(estimatedWaitTime / 60);
      const minutes = estimatedWaitTime % 60;
      return `您当前排在第${queuePosition}位，预计${hours}小时${minutes}分钟后开始处理，${status}`;
    }
  }
  
  /**
   * 计算最大排队数量
   * @param {number} currentQueue - 当前排队数量
   * @returns {number} - 最大排队数量
   */
  static calculateMaxQueue(currentQueue) {
    return Math.max(currentQueue, QUEUE_CONFIG.MAX_QUEUE_SIZE);
  }
  
  /**
   * 检查是否可以加入排队
   * @param {number} currentQueue - 当前排队数量
   * @returns {boolean} - 是否可以加入
   */
  static canJoinQueue(currentQueue) {
    return currentQueue < QUEUE_CONFIG.MAX_QUEUE_SIZE;
  }
}

// 导出
module.exports = QueueCalculator;
