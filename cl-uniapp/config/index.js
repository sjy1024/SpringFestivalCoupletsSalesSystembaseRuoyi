import { envConfig } from './env.config';

export const config = {
  /** 是否使用mock代替api返回 */
  // 对接若依后端时建议改为 false；需要看模板效果/离线调试时再切回 true
  useMock: envConfig.useMock,
  fallbackToMock: envConfig.fallbackToMock,

  /** 环境配置 */
  env: envConfig.env,
  isDev: envConfig.isDev,
  isProd: envConfig.isProd,
  
  /** API配置 */
  baseURL: envConfig.baseURL,
  
  /** 调试配置 */
  debug: envConfig.debug,
  logLevel: envConfig.logLevel,
  
  /** 业务配置 */
  pageSize: envConfig.pageSize,
  timeout: envConfig.timeout,
  retryCount: envConfig.retryCount,
  
  /** 图片配置 */
  imageBaseURL: envConfig.imageBaseURL,
  defaultImage: envConfig.defaultImage,
};

export const cdnBase =
  'https://we-retail-static-1300977798.cos.ap-guangzhou.myqcloud.com/retail-mp';
