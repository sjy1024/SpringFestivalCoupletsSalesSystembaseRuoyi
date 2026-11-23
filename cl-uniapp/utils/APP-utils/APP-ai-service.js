// AI服务工具

import { AI_CONFIG, STORAGE_CONFIG } from '../../config/APP-config';
import { request } from '../../services/_utils/request';

/**
 * AI服务工具类
 */
class AIService {
  /**
   * 发送AI对话请求
   * @param {string} message - 用户消息
   * @param {string} userId - 用户ID
   * @returns {Promise<Object>} - AI回复结果
   */
  static async sendChatRequest(message, userId = '') {
    try {
      // 构建请求参数
      const params = {
        message,
        userId: userId || this.getDeviceId()
      };
      
      // 调用后端AI接口
      // 大模型生成较慢，超时需大于 env.config 默认 10s（与后端 Ollama readTimeout 对齐）
      const response = await request({
        url: AI_CONFIG.API_PATH?.CHAT || '/api/ai/chat',
        method: 'POST',
        data: params,
        showLoading: true,
        showError: true,
        timeout: 120000
      });
      
      // 保存对话历史
      await this.saveChatHistory({
        userId: params.userId,
        message,
        response: response
      });
      
      return response;
    } catch (error) {
      console.error('AI对话请求失败:', error);
      
      // 返回默认回复
      const defaultResponse = this.getDefaultResponse(message);
      
      // 保存对话历史（包含错误信息）
      await this.saveChatHistory({
        userId: userId || this.getDeviceId(),
        message,
        response: defaultResponse,
        error: error.message
      });
      
      return defaultResponse;
    }
  }
  
  /**
   * 获取对话历史记录
   * @param {string} userId - 用户ID
   * @param {number} limit - 限制数量
   * @returns {Array} - 对话历史记录
   */
  static getChatHistory(userId = '', limit = AI_CONFIG.CHAT.MAX_MESSAGES) {
    try {
      const storageKey = `${STORAGE_CONFIG.KEYS.AI_CHAT_HISTORY}_${userId || this.getDeviceId()}`;
      const history = wx.getStorageSync(storageKey) || [];
      return history.slice(-limit);
    } catch (error) {
      console.error('获取对话历史失败:', error);
      return [];
    }
  }
  
  /**
   * 保存对话历史记录
   * @param {Object} chatData - 对话数据
   * @param {string} chatData.userId - 用户ID
   * @param {string} chatData.message - 用户消息
   * @param {Object} chatData.response - AI回复
   * @param {string} chatData.error - 错误信息
   */
  static async saveChatHistory(chatData) {
    try {
      const storageKey = `${STORAGE_CONFIG.KEYS.AI_CHAT_HISTORY}_${chatData.userId || this.getDeviceId()}`;
      
      // 获取现有历史
      const history = wx.getStorageSync(storageKey) || [];
      
      // 添加新对话
      history.push({
        id: Date.now(),
        timestamp: new Date().toISOString(),
        message: chatData.message,
        response: chatData.response,
        error: chatData.error
      });
      
      // 限制历史记录数量
      const limitedHistory = history.slice(-AI_CONFIG.CHAT.MAX_MESSAGES);
      
      // 保存到本地存储
      wx.setStorageSync(storageKey, limitedHistory);
    } catch (error) {
      console.error('保存对话历史失败:', error);
    }
  }
  
  /**
   * 清空对话历史记录
   * @param {string} userId - 用户ID
   */
  static clearChatHistory(userId = '') {
    try {
      const storageKey = `${STORAGE_CONFIG.KEYS.AI_CHAT_HISTORY}_${userId || this.getDeviceId()}`;
      wx.removeStorageSync(storageKey);
    } catch (error) {
      console.error('清空对话历史失败:', error);
    }
  }
  
  /**
   * 获取AI推荐商品
   * @param {string} keyword - 关键词
   * @returns {Promise<Array>} - 推荐商品列表
   */
  static async getRecommendedGoods(keyword) {
    try {
      const response = await request({
        url: AI_CONFIG.API_PATH?.RECOMMEND || '/api/ai/recommend',
        method: 'GET',
        data: { keyword },
        showLoading: false,
        showError: false
      });
      
      return response.goods || [];
    } catch (error) {
      console.error('获取推荐商品失败:', error);
      return [];
    }
  }
  
  /**
   * 获取默认回复
   * @param {string} message - 用户消息
   * @returns {Object} - 默认回复
   */
  static getDefaultResponse(message) {
    // 关键词匹配
    const keywords = {
      '春联': '我为您推荐几款春联：\n1. 传统春联 - 红色宣纸，金粉印刷\n2. 创意春联 - 个性化定制\n3. 商用春联 - 企业专用',
      '对联': '对联有多种规格：\n1. 普通纸 - 经济实惠\n2. 宣纸 - 高端大气\n3. 洒金纸 - 喜庆吉祥',
      '纸': '我们提供多种纸张：\n普通纸、宣纸、洒金纸，您可以根据需求选择。',
      '尺寸': '尺寸规格：\n小号(30cm)、中号(50cm)、大号(80cm)，支持定制。',
      '定制': '我们支持个性化定制，可以根据您的需求定制春联内容、材质和尺寸。',
      '价格': '春联价格根据材质、尺寸和定制要求有所不同，一般在20-100元之间。',
      '配送': '我们支持快递配送，一般3-5天可以送达。',
      '订单': '您可以在个人中心查看订单状态，如有问题请联系客服。',
      '客服': '客服电话：400-123-4567，工作时间：9:00-18:00。'
    };
    
    // 匹配关键词
    for (const [key, reply] of Object.entries(keywords)) {
      if (message.includes(key)) {
        return {
          answer: reply,
          recommendedGoods: [],
          isDefault: true
        };
      }
    }
    
    // 默认回复
    return {
      answer: AI_CONFIG.CHAT.DEFAULT_RESPONSE,
      recommendedGoods: [],
      isDefault: true
    };
  }
  
  /**
   * 获取设备ID
   * @returns {string} - 设备ID
   */
  static getDeviceId() {
    try {
      return wx.getStorageSync(STORAGE_CONFIG.KEYS.DEVICE_ID) || this.generateDeviceId();
    } catch (error) {
      return this.generateDeviceId();
    }
  }
  
  /**
   * 生成设备ID
   * @returns {string} - 设备ID
   */
  static generateDeviceId() {
    const deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    try {
      wx.setStorageSync(STORAGE_CONFIG.KEYS.DEVICE_ID, deviceId);
    } catch (error) {
      console.error('保存设备ID失败:', error);
    }
    return deviceId;
  }
  
  /**
   * 提取回复中的商品推荐
   * @param {string} reply - AI回复
   * @returns {Array} - 推荐商品列表
   */
  static extractRecommendations(reply) {
    // 简单的推荐提取逻辑
    // 实际项目中可以根据AI回复的格式进行更复杂的提取
    const recommendations = [];
    
    // 示例：从回复中提取商品推荐
    if (reply.includes('推荐')) {
      // 这里可以根据实际情况实现更复杂的提取逻辑
      // 例如解析JSON格式的推荐数据
    }
    
    return recommendations;
  }
  
  /**
   * 格式化AI回复
   * @param {Object} response - AI回复
   * @returns {string} - 格式化后的回复
   */
  static formatAIResponse(response) {
    if (!response) {
      return AI_CONFIG.CHAT.DEFAULT_RESPONSE;
    }
    
    if (typeof response === 'string') {
      return response;
    }
    
    return response.answer || response.message || AI_CONFIG.CHAT.DEFAULT_RESPONSE;
  }
  
  /**
   * 检查AI服务状态
   * @returns {Promise<boolean>} - 服务是否可用
   */
  static async checkAIServiceStatus() {
    try {
      // 发送测试请求
      const response = await request({
        url: AI_CONFIG.API_PATH?.CHAT || '/api/ai/chat',
        method: 'POST',
        data: {
          message: '测试',
          userId: this.getDeviceId()
        },
        showLoading: false,
        showError: false,
        timeout: 5000
      });
      
      return !!response;
    } catch (error) {
      console.error('AI服务不可用:', error);
      return false;
    }
  }
  
  /**
   * 获取AI服务配置
   * @returns {Object} - AI服务配置
   */
  static getAIConfig() {
    return AI_CONFIG;
  }
}

// 导出
module.exports = AIService;
