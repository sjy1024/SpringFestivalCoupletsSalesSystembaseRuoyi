/**
 * 后端图片使用示例
 * 展示如何在定制页面中使用后端上传的图片
 */

import { getBackendImageURL, getUploadedImage, checkImage } from '../utils/imageConfig';

// 示例1: 基本使用
function example1() {
  console.log('=== 示例1: 基本使用 ===');
  
  // 假设后端返回的图片路径
  const backendImagePath = '/upload/2024/01/01/spring-couplet-123.jpg';
  
  // 获取完整URL
  const imageUrl = getBackendImageURL(backendImagePath);
  console.log('后端图片URL:', imageUrl);
  
  // 获取不同质量的图片
  const thumbnailUrl = getBackendImageURL(backendImagePath, { quality: 'thumbnail' });
  const mediumUrl = getBackendImageURL(backendImagePath, { quality: 'medium' });
  const largeUrl = getBackendImageURL(backendImagePath, { quality: 'large' });
  
  console.log('缩略图:', thumbnailUrl);
  console.log('中等尺寸:', mediumUrl);
  console.log('大尺寸:', largeUrl);
}

// 示例2: 在页面中使用
Page({
  data: {
    // 图片数据
    customImages: [],
    loading: false,
    error: null
  },
  
  onLoad() {
    // 加载后端图片
    this.loadBackendImages();
  },
  
  /**
   * 加载后端图片
   */
  async loadBackendImages() {
    this.setData({ loading: true, error: null });
    
    try {
      // 模拟从API获取图片数据
      const imageData = await this.fetchImageData();
      
      // 处理图片URL
      const processedImages = imageData.map(item => ({
        ...item,
        // 获取完整图片URL
        imageUrl: getBackendImageURL(item.imagePath, { quality: 'medium' }),
        // 获取缩略图URL
        thumbnailUrl: getBackendImageURL(item.imagePath, { quality: 'thumbnail' })
      }));
      
      this.setData({
        customImages: processedImages,
        loading: false
      });
      
      // 预加载图片
      this.preloadImages(processedImages);
      
    } catch (error) {
      console.error('加载图片失败:', error);
      this.setData({
        error: '图片加载失败',
        loading: false
      });
    }
  },
  
  /**
   * 模拟从API获取图片数据
   */
  async fetchImageData() {
    // 模拟API调用
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 1,
            name: '春联示例1',
            imagePath: '/upload/custom/spring-couplet-1.jpg',
            type: 'springCouplet'
          },
          {
            id: 2,
            name: '福字示例',
            imagePath: '/upload/custom/fu-1.jpg',
            type: 'fu'
          },
          {
            id: 3,
            name: '横批示例',
            imagePath: '/upload/custom/horizontal-1.jpg',
            type: 'horizontal'
          }
        ]);
      }, 500);
    });
  },
  
  /**
   * 预加载图片
   */
  async preloadImages(images) {
    const imageUrls = images.map(img => img.imageUrl);
    
    try {
      const results = await Promise.all(
        imageUrls.map(url => checkImage(url))
      );
      
      console.log('图片预加载结果:', results);
      
      // 更新图片加载状态
      const updatedImages = images.map((img, index) => ({
        ...img,
        loaded: results[index]
      }));
      
      this.setData({
        customImages: updatedImages
      });
      
    } catch (error) {
      console.warn('图片预加载失败:', error);
    }
  },
  
  /**
   * 检查单张图片
   */
  async checkSingleImage(imagePath) {
    try {
      const url = getBackendImageURL(imagePath);
      const exists = await checkImage(url);
      
      if (exists) {
        console.log('图片存在:', url);
        return url;
      } else {
        console.warn('图片不存在:', url);
        return null;
      }
    } catch (error) {
      console.error('检查图片失败:', error);
      return null;
    }
  },
  
  /**
   * 上传图片示例
   */
  async uploadImage() {
    // 选择图片
    const res = await wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera']
    });
    
    if (res.tempFilePaths.length > 0) {
      const tempFilePath = res.tempFilePaths[0];
      
      // 上传到后端
      const uploadResult = await this.uploadToBackend(tempFilePath);
      
      if (uploadResult.success) {
        // 获取上传后的图片URL
        const imageUrl = getUploadedImage(uploadResult.fileName, { quality: 'medium' });
        
        console.log('上传成功，图片URL:', imageUrl);
        
        // 添加到图片列表
        this.setData({
          customImages: [
            ...this.data.customImages,
            {
              id: Date.now(),
              name: '新上传的图片',
              imagePath: uploadResult.filePath,
              imageUrl: imageUrl,
              thumbnailUrl: getUploadedImage(uploadResult.fileName, { quality: 'thumbnail' }),
              loaded: true
            }
          ]
        });
      }
    }
  },
  
  /**
   * 模拟上传到后端
   */
  async uploadToBackend(filePath) {
    // 模拟上传过程
    return new Promise((resolve) => {
      setTimeout(() => {
        // 生成文件名
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        const fileName = `custom-${timestamp}-${random}.jpg`;
        const filePath = `/upload/custom/${fileName}`;
        
        resolve({
          success: true,
          fileName: fileName,
          filePath: filePath,
          message: '上传成功'
        });
      }, 1000);
    });
  },
  
  /**
   * 错误处理示例
   */
  async loadImageWithErrorHandling(imagePath) {
    try {
      // 尝试加载图片
      const url = getBackendImageURL(imagePath);
      const exists = await checkImage(url);
      
      if (!exists) {
        // 图片不存在，使用默认图片
        return this.getDefaultImage();
      }
      
      return url;
    } catch (error) {
      console.error('图片加载错误:', error);
      
      // 根据错误类型处理
      if (error.message.includes('network')) {
        console.warn('网络错误，稍后重试');
        // 可以在这里添加重试逻辑
      }
      
      return this.getDefaultImage();
    }
  },
  
  /**
   * 获取默认图片
   */
  getDefaultImage() {
    // 这里可以返回本地默认图片
    return '/static/images/common/default.jpg';
  },
  
  /**
   * 性能监控示例
   */
  async loadImageWithPerformance(imagePath) {
    const startTime = Date.now();
    
    try {
      const url = getBackendImageURL(imagePath);
      const exists = await checkImage(url);
      
      const loadTime = Date.now() - startTime;
      console.log(`图片加载时间: ${loadTime}ms`);
      
      // 记录性能数据
      this.recordPerformance('image_load', {
        imagePath: imagePath,
        loadTime: loadTime,
        success: exists
      });
      
      return exists ? url : this.getDefaultImage();
    } catch (error) {
      const loadTime = Date.now() - startTime;
      console.error(`图片加载失败，耗时: ${loadTime}ms`, error);
      
      this.recordPerformance('image_load_error', {
        imagePath: imagePath,
        loadTime: loadTime,
        error: error.message
      });
      
      return this.getDefaultImage();
    }
  },
  
  /**
   * 记录性能数据
   */
  recordPerformance(event, data) {
    // 这里可以发送性能数据到监控系统
    console.log('性能事件:', event, data);
  }
});

// 运行示例
example1();

console.log('\n=== 使用说明 ===');
console.log('1. 确保后端API地址正确配置在 config/env.config.js');
console.log('2. 后端图片路径需要以 /upload/ 开头');
console.log('3. 使用 getBackendImageURL() 获取完整图片URL');
console.log('4. 使用 checkImage() 检查图片是否存在');
console.log('5. 支持多种图片质量: thumbnail, medium, large, original');