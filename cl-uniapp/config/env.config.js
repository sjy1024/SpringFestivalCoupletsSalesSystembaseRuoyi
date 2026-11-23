/**
 * 环境配置管理
 * 支持开发、测试、生产环境
 */

// 环境类型
const ENV_TYPES = {
  DEVELOPMENT: 'development',
  TEST: 'test',
  PRODUCTION: 'production'
};

// 获取当前环境
function getCurrentEnv() {
  // 微信小程序：用官方 envVersion，避免无 window/process 时误判为 production
  if (typeof wx !== 'undefined' && typeof wx.getAccountInfoSync === 'function') {
    try {
      const envVersion = wx.getAccountInfoSync().miniProgram.envVersion;
      if (envVersion === 'develop' || envVersion === 'trial') {
        return ENV_TYPES.DEVELOPMENT;
      }
      if (envVersion === 'release') {
        return ENV_TYPES.PRODUCTION;
      }
    } catch (e) {
      // ignore
    }
  }

  // 优先使用编译环境变量（如经 webpack 等注入）
  if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV) {
    return process.env.NODE_ENV;
  }

  // H5 / Node 等：根据域名判断
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    return ENV_TYPES.DEVELOPMENT;
  }
  if (hostname.includes('test.')) {
    return ENV_TYPES.TEST;
  }
  return ENV_TYPES.PRODUCTION;
}

// 环境配置
const envConfigs = {
  [ENV_TYPES.DEVELOPMENT]: {
    name: '开发环境',
    baseURL: 'http://127.0.0.1:8080',
    useMock: false,
    // 后端不可达时自动降级 mock，避免首屏长时间白屏
    fallbackToMock: true,
    debug: true,
    logLevel: 'debug',
    enablePerformance: true,
    enableErrorTracking: true
  },
  
  [ENV_TYPES.TEST]: {
    name: '测试环境',
    baseURL: 'https://test.your-domain.com',
    useMock: false,
    debug: true,
    logLevel: 'info',
    enablePerformance: true,
    enableErrorTracking: true
  },
  
  [ENV_TYPES.PRODUCTION]: {
    name: '生产环境',
    baseURL: 'https://your-domain.com',
    useMock: false,
    debug: false,
    logLevel: 'warn',
    enablePerformance: false,
    enableErrorTracking: true
  }
};

// 当前环境配置
const currentEnv = getCurrentEnv();
const config = envConfigs[currentEnv] || envConfigs[ENV_TYPES.DEVELOPMENT];

// 导出配置
export const envConfig = {
  // 环境信息
  env: currentEnv,
  isDev: currentEnv === ENV_TYPES.DEVELOPMENT,
  isTest: currentEnv === ENV_TYPES.TEST,
  isProd: currentEnv === ENV_TYPES.PRODUCTION,
  
  // API配置
  baseURL: config.baseURL,
  useMock: config.useMock,
  fallbackToMock: config.fallbackToMock === true,
  
  // 调试配置
  debug: config.debug,
  logLevel: config.logLevel,
  
  // 功能开关
  enablePerformance: config.enablePerformance,
  enableErrorTracking: config.enableErrorTracking,
  
  // 小程序配置
  appId: 'your-app-id', // 小程序AppID
  appName: '春联小程序',
  version: '1.0.0',
  
  // 业务配置
  pageSize: 20, // 默认分页大小
  timeout: 10000, // 默认超时时间
  retryCount: 3, // 默认重试次数
  
  // 缓存配置
  cacheEnabled: true,
  cacheDuration: 5 * 60 * 1000, // 5分钟
  
  // 图片配置
  imageBaseURL: config.baseURL,
  defaultImage: '/static/images/default-goods.png',
  
  // 地图配置
  mapKey: 'your-map-key',
  
  // 支付配置
  paymentEnabled: true,
  
  // 分享配置
  shareTitle: '春联小程序 - 传统文化，现代体验',
  shareImage: '/static/images/share-logo.png'
};

// 工具函数
export function isDevelopment() {
  return currentEnv === ENV_TYPES.DEVELOPMENT;
}

export function isProduction() {
  return currentEnv === ENV_TYPES.PRODUCTION;
}

export function getBaseURL() {
  return config.baseURL;
}

export function shouldUseMock() {
  return config.useMock;
}

export function shouldDebug() {
  return config.debug;
}

// 默认导出
export default envConfig;