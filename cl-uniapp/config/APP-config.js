// 春联售卖系统配置文件

/**
 * 后端API配置
 */
export const API_CONFIG = {
  // 后端API基础地址
  BASE_URL: 'http://127.0.0.1:8080',
  
  // API接口路径
  API_PATH: {
    // 商品相关
    GOODS: {
      LIST: '/system/goods/list',
      DETAIL: '/system/goods/',
      SEARCH: '/system/goods/search'
    },
    
    // 订单相关
    ORDER: {
      CREATE: '/system/order',
      LIST: '/system/order/list',
      DETAIL: '/system/order/',
      UPDATE: '/system/order',
      QUEUE: '/system/order/queue/'
    },
    
    // 购物车相关
    CART: {
      ADD: '/system/cart/add',
      LIST: '/system/cart/list',
      UPDATE: '/system/cart/update',
      DELETE: '/system/cart/delete',
      CLEAR: '/system/cart/clear'
    },
    
    // 定制相关
    CUSTOM: {
      OPTIONS: '/system/customization/options',
      CALCULATE: '/system/customization/calculate',
      CREATE: '/system/customization/create'
    },
    
    // AI对话相关
    AI: {
      CHAT: '/api/ai/chat',
      HISTORY: '/api/ai/history',
      RECOMMEND: '/api/ai/recommend'
    }
  }
};

/**
 * APP版本信息
 */
export const APP_VERSION = {
  VERSION: '1.0.0',
  BUILD: '20260202',
  DESCRIPTION: '春联售卖系统小程序'
};

/**
 * 定制选项配置
 */
export const CUSTOM_OPTIONS = {
  // 材质选项
  MATERIALS: [
    { id: '1', name: '普通纸', price: 0, description: '经济实惠，适合日常使用' },
    { id: '2', name: '宣纸', price: 10, description: '高端大气，适合收藏' },
    { id: '3', name: '洒金纸', price: 15, description: '喜庆吉祥，适合春节使用' }
  ],
  
  // 尺寸选项
  SIZES: [
    { id: '1', name: '小号', price: 0, description: '适合小门口', size: '30cm' },
    { id: '2', name: '中号', price: 5, description: '适合一般门口', size: '50cm' },
    { id: '3', name: '大号', price: 10, description: '适合大门口', size: '80cm' },
    { id: '4', name: '定制尺寸', price: 20, description: '根据需求定制', size: '自定义' }
  ],
  
  // 纸张选项
  PAPERS: [
    { id: '1', name: '普通纸', price: 0, description: '标准纸张' },
    { id: '2', name: '加厚纸', price: 5, description: '更加耐用' },
    { id: '3', name: '特种纸', price: 15, description: '质感更佳' }
  ],
  
  // 印刷选项
  PRINTING: [
    { id: '1', name: '普通印刷', price: 0, description: '标准印刷工艺' },
    { id: '2', name: '烫金印刷', price: 10, description: '高端烫金效果' },
    { id: '3', name: '手写定制', price: 30, description: '人工手写，独一无二' }
  ]
};

/**
 * 价格计算参数
 */
export const PRICE_CONFIG = {
  // 基础价格系数
  BASE_PRICE: 20,
  
  // 定制选项价格系数
  CUSTOM_FACTORS: {
    MATERIAL: 1.0,
    SIZE: 1.0,
    PAPER: 1.0,
    PRINTING: 1.0
  },
  
  // 优惠配置
  DISCOUNT: {
    MIN_AMOUNT: 100,
    DISCOUNT_RATE: 0.9
  }
};

/**
 * 订单排队配置
 */
export const QUEUE_CONFIG = {
  // 平均处理时间（分钟）
  AVG_PROCESS_TIME: 15,
  
  // 排队状态更新间隔（秒）
  UPDATE_INTERVAL: 30,
  
  // 最大排队数量
  MAX_QUEUE_SIZE: 50
};

/**
 * AI服务配置
 */
export const AI_CONFIG = {
  // AI服务类型：local（本地）、api（远程API）
  SERVICE_TYPE: 'api',
  
  // 本地AI服务配置
  LOCAL: {
    API_URL: 'http://localhost:8000/api/chat'
  },
  
  // 远程API配置
  REMOTE: {
    API_URL: 'https://api.example.com/ai/chat',
    API_KEY: ''
  },
  
  // AI对话配置
  CHAT: {
    MAX_MESSAGES: 50,
    TIMEOUT: 30000,
    DEFAULT_RESPONSE: '您好！我是AI对联销售员，可以为您推荐春联、对联等商品。请问您有什么需求？'
  }
};

/**
 * 图片配置
 */
export const IMAGE_CONFIG = {
  // 图片基础路径
  BASE_URL: 'https://example.com/images',
  
  // 图片尺寸
  SIZE: {
    THUMBNAIL: '200x200',
    COVER: '400x400',
    DETAIL: '800x800'
  },
  
  // 默认图片
  DEFAULT: {
    GOODS: '/default/goods.png',
    AVATAR: '/default/avatar.png',
    PLACEHOLDER: '/default/placeholder.png'
  }
};

/**
 * 存储配置
 */
export const STORAGE_CONFIG = {
  // 存储键名
  KEYS: {
    USER_INFO: 'user_info',
    TOKEN: 'token',
    CART_DATA: 'cart_data',
    ORDER_HISTORY: 'order_history',
    AI_CHAT_HISTORY: 'ai_chat_history',
    SEARCH_HISTORY: 'search_history',
    DEVICE_ID: 'device_id'
  },
  
  // 存储过期时间（毫秒）
  EXPIRY: {
    USER_INFO: 7 * 24 * 60 * 60 * 1000, // 7天
    TOKEN: 30 * 24 * 60 * 60 * 1000, // 30天
    CART_DATA: 30 * 24 * 60 * 60 * 1000, // 30天
    AI_CHAT_HISTORY: 7 * 24 * 60 * 60 * 1000, // 7天
    SEARCH_HISTORY: 30 * 24 * 60 * 60 * 1000 // 30天
  }
};

/**
 * 小程序配置
 */
export const APP_CONFIG = {
  // 小程序名称
  APP_NAME: '春联售卖',
  
  // 客服配置
  CUSTOMER_SERVICE: {
    PHONE: '400-123-4567',
    EMAIL: 'service@example.com'
  },
  
  // 物流配置
  LOGISTICS: {
    SUPPORTED_COMPANIES: ['顺丰', '圆通', '申通', '中通', '韵达'],
    DEFAULT_COMPANY: '顺丰'
  },
  
  // 支付配置
  PAYMENT: {
    SUPPORTED_METHODS: ['微信支付', '支付宝', '现金支付'],
    DEFAULT_METHOD: '微信支付'
  }
};

// 导出默认配置
export default {
  API_CONFIG,
  APP_VERSION,
  CUSTOM_OPTIONS,
  PRICE_CONFIG,
  QUEUE_CONFIG,
  AI_CONFIG,
  IMAGE_CONFIG,
  STORAGE_CONFIG,
  APP_CONFIG
};
