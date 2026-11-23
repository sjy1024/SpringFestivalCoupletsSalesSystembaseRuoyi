/**
 * 图片配置管理工具
 * 统一管理项目中的图片路径，支持本地图片、CDN图片、后端图片
 */

import { envConfig } from '../config/env.config';

// 图片配置
const IMAGE_CONFIG = {
  // 基础路径配置
  basePaths: {
    // 本地静态资源路径
    local: '/static/images',
    
    // CDN路径（生产环境使用）
    cdn: 'https://your-cdn-domain.com/images',
    
    // 后端图片路径
    backend: envConfig.baseURL + '/profile/upload'
  },
  
  // 图片分类配置
  categories: {
    // 定制相关图片
    custom: {
      springCouplet: 'custom/spring-couplet.jpg',
      fu: 'custom/fu.jpg',
      horizontal: 'custom/horizontal.jpg',
      aiChatBanner: 'custom/ai-chat-banner.jpg'
    },
    
    // 图标
    icons: {
      arrowRight: 'icons/arrow-right.png',
      search: 'icons/search.png',
      cart: 'icons/cart.png',
      user: 'icons/user.png'
    },
    
    // 商品相关
    goods: {
      default: 'goods/default.jpg',
      placeholder: 'goods/placeholder.jpg'
    },
    
    // 通用图片
    common: {
      logo: 'common/logo.png',
      banner: 'common/banner.jpg',
      error: 'common/error.png',
      empty: 'common/empty.png'
    }
  },
  
  // 图片质量配置
  quality: {
    // 缩略图尺寸
    thumbnail: '?x-oss-process=image/resize,w_200',
    
    // 中等尺寸
    medium: '?x-oss-process=image/resize,w_500',
    
    // 大尺寸
    large: '?x-oss-process=image/resize,w_800',
    
    // 原图
    original: ''
  },
  
  // 默认图片
  defaults: {
    customType: '/static/images/custom/default-type.jpg',
    goods: '/static/images/goods/default.jpg',
    avatar: '/static/images/common/default-avatar.png',
    banner: '/static/images/common/default-banner.jpg'
  }
};

/**
 * 图片URL生成器
 */
export class ImageURLGenerator {
  /**
   * 获取图片完整URL
   * @param {string} category - 图片分类
   * @param {string} key - 图片键名
   * @param {Object} options - 选项
   * @returns {string} 图片URL
   */
  static getURL(category, key, options = {}) {
    const config = { ...IMAGE_CONFIG };
    
    // 获取图片相对路径
    const relativePath = config.categories[category]?.[key];
    if (!relativePath) {
      console.warn(`图片未找到: ${category}.${key}`);
      return this.getDefaultImage(category);
    }
    
    // 选择路径类型
    let basePath = config.basePaths.local;
    
    if (envConfig.isProd) {
      // 生产环境使用CDN
      basePath = config.basePaths.cdn;
    } else if (options.useBackend) {
      // 使用后端图片
      basePath = config.basePaths.backend;
    }
    
    // 构建完整URL
    let url = `${basePath}/${relativePath}`;
    
    // 添加质量参数
    if (options.quality && config.quality[options.quality]) {
      url += config.quality[options.quality];
    }
    
    return url;
  }

  /**
   * 从后端获取图片URL
   * @param {string} imagePath - 后端返回的图片路径
   * @param {Object} options - 选项
   * @returns {string} 完整的图片URL
   */
  static getBackendImageURL(imagePath, options = {}) {
    if (!imagePath) {
      return this.getDefaultImage('common');
    }
    
    // 如果已经是完整URL，直接返回
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // 如果是相对路径，添加基础URL
    let basePath = IMAGE_CONFIG.basePaths.backend;
    
    // 移除开头的斜杠（如果存在）
    if (imagePath.startsWith('/')) {
      imagePath = imagePath.substring(1);
    }
    
    // 构建完整URL
    let url = `${basePath}/${imagePath}`;
    
    // 添加质量参数
    if (options.quality && IMAGE_CONFIG.quality[options.quality]) {
      url += IMAGE_CONFIG.quality[options.quality];
    }
    
    return url;
  }

  /**
   * 获取后端上传的图片
   * @param {string} fileName - 文件名
   * @param {Object} options - 选项
   * @returns {string} 图片URL
   */
  static getUploadedImage(fileName, options = {}) {
    if (!fileName) {
      return this.getDefaultImage('common');
    }
    
    // 构建后端图片路径
    const basePath = IMAGE_CONFIG.basePaths.backend;
    let url = `${basePath}/${fileName}`;
    
    // 添加质量参数
    if (options.quality && IMAGE_CONFIG.quality[options.quality]) {
      url += IMAGE_CONFIG.quality[options.quality];
    }
    
    return url;
  }
  
  /**
   * 获取默认图片
   */
  static getDefaultImage(category) {
    const defaults = {
      custom: IMAGE_CONFIG.defaults.customType,
      goods: IMAGE_CONFIG.defaults.goods,
      icons: IMAGE_CONFIG.defaults.goods,
      common: IMAGE_CONFIG.defaults.banner
    };
    
    return defaults[category] || IMAGE_CONFIG.defaults.goods;
  }
  
  /**
   * 获取定制类型图片
   */
  static getCustomTypeImage(typeId, options = {}) {
    const typeMap = {
      1: 'springCouplet',
      2: 'fu',
      3: 'horizontal'
    };
    
    const key = typeMap[typeId] || 'springCouplet';
    return this.getURL('custom', key, options);
  }
  
  /**
   * 获取图标
   */
  static getIcon(iconName, options = {}) {
    return this.getURL('icons', iconName, options);
  }
  
  /**
   * 获取商品图片
   */
  static getGoodsImage(imageName, options = {}) {
    return this.getURL('goods', imageName, options);
  }
  
  /**
   * 检查图片是否存在
   */
  static async checkImageExists(url) {
    return new Promise((resolve) => {
      if (typeof wx !== 'undefined' && wx.getImageInfo) {
        wx.getImageInfo({
          src: url,
          success: () => resolve(true),
          fail: () => resolve(false)
        });
      } else {
        // 浏览器环境
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
      }
    });
  }
  
  /**
   * 预加载图片
   */
  static async preloadImages(urls) {
    const promises = urls.map(url => this.checkImageExists(url));
    return Promise.all(promises);
  }
  
  /**
   * 获取图片信息
   */
  static async getImageInfo(url) {
    return new Promise((resolve, reject) => {
      if (typeof wx !== 'undefined' && wx.getImageInfo) {
        wx.getImageInfo({
          src: url,
          success: resolve,
          fail: reject
        });
      } else {
        const img = new Image();
        img.onload = () => resolve({
          width: img.width,
          height: img.height,
          path: url
        });
        img.onerror = reject;
        img.src = url;
      }
    });
  }
  
  /**
   * 生成图片懒加载配置
   */
  static generateLazyLoadConfig(images, containerSelector = '.image-container') {
    return {
      images,
      containerSelector,
      threshold: 0.1,
      rootMargin: '50px'
    };
  }
  
  /**
   * 更新图片配置
   */
  static updateConfig(newConfig) {
    Object.assign(IMAGE_CONFIG, newConfig);
  }
  
  /**
   * 获取当前配置
   */
  static getConfig() {
    return { ...IMAGE_CONFIG };
  }
}

// 快捷方法
export function getImageURL(category, key, options = {}) {
  return ImageURLGenerator.getURL(category, key, options);
}

export function getCustomImage(typeId, options = {}) {
  return ImageURLGenerator.getCustomTypeImage(typeId, options);
}

export function getIcon(iconName, options = {}) {
  return ImageURLGenerator.getIcon(iconName, options);
}

export function checkImage(url) {
  return ImageURLGenerator.checkImageExists(url);
}

export function getBackendImageURL(imagePath, options = {}) {
  return ImageURLGenerator.getBackendImageURL(imagePath, options);
}

export function getUploadedImage(fileName, options = {}) {
  return ImageURLGenerator.getUploadedImage(fileName, options);
}

// 默认导出
export default ImageURLGenerator;