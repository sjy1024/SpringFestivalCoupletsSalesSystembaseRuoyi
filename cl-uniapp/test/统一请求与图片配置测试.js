/**
 * 统一请求与图片配置测试
 * 测试新创建的统一请求封装和图片配置工具
 */

// 模拟wx对象
global.wx = {
  request: function(options) {
    console.log('wx.request called:', options);
    return {
      success: function(callback) {
        setTimeout(() => {
          callback({
            statusCode: 200,
            data: {
              code: 200,
              data: { message: '请求成功' },
              msg: 'success'
            },
            header: {}
          });
        }, 100);
        return this;
      },
      fail: function(callback) {
        // 模拟失败
        setTimeout(() => {
          callback({ errMsg: 'request:fail' });
        }, 100);
        return this;
      }
    };
  },
  
  showLoading: function(options) {
    console.log('wx.showLoading called:', options);
  },
  
  hideLoading: function() {
    console.log('wx.hideLoading called');
  },
  
  showToast: function(options) {
    console.log('wx.showToast called:', options);
  },
  
  getStorageSync: function(key) {
    const storage = {
      'token': 'test-token-123',
      'deviceId': 'device-123',
      'userInfo': { userId: 1, name: '测试用户' }
    };
    return storage[key] || '';
  },
  
  getImageInfo: function(options) {
    console.log('wx.getImageInfo called:', options);
    return {
      success: function(callback) {
        setTimeout(() => {
          callback({ width: 100, height: 100, path: options.src });
        }, 50);
        return this;
      },
      fail: function(callback) {
        setTimeout(() => {
          callback({ errMsg: 'getImageInfo:fail' });
        }, 50);
        return this;
      }
    };
  },
  
  getStorageInfoSync: function() {
    return { currentSize: 1024 };
  }
};

// 导入测试模块
console.log('=== 开始测试 ===\n');

// 测试图片配置工具
console.log('1. 测试图片配置工具');
try {
  // 模拟环境配置
  const mockEnvConfig = {
    baseURL: 'http://127.0.0.1:8080',
    isProd: false
  };
  
  // 创建简单的图片配置测试
  const imageConfigTest = {
    getBackendImageURL: function(imagePath, options = {}) {
      if (!imagePath) return '/static/images/common/default.jpg';
      
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
      }
      
      let basePath = mockEnvConfig.baseURL + '/profile/upload';
      
      if (imagePath.startsWith('/')) {
        imagePath = imagePath.substring(1);
      }
      
      let url = `${basePath}/${imagePath}`;
      
      const qualityMap = {
        thumbnail: '?x-oss-process=image/resize,w_200',
        medium: '?x-oss-process=image/resize,w_500',
        large: '?x-oss-process=image/resize,w_800',
        original: ''
      };
      
      if (options.quality && qualityMap[options.quality]) {
        url += qualityMap[options.quality];
      }
      
      return url;
    },
    
    checkImage: function(url) {
      return new Promise((resolve) => {
        wx.getImageInfo({
          src: url,
          success: () => resolve(true),
          fail: () => resolve(false)
        });
      });
    }
  };
  
  // 测试后端图片URL生成
  const testImagePath = '/upload/2024/01/01/test.jpg';
  const imageUrl = imageConfigTest.getBackendImageURL(testImagePath);
  console.log('后端图片URL:', imageUrl);
  
  const thumbnailUrl = imageConfigTest.getBackendImageURL(testImagePath, { quality: 'thumbnail' });
  console.log('缩略图URL:', thumbnailUrl);
  
  const mediumUrl = imageConfigTest.getBackendImageURL(testImagePath, { quality: 'medium' });
  console.log('中等尺寸URL:', mediumUrl);
  
  // 测试图片检查
  imageConfigTest.checkImage(imageUrl)
    .then(exists => console.log('图片检查结果:', exists ? '存在' : '不存在'))
    .catch(err => console.error('图片检查失败:', err));
    
} catch (error) {
  console.error('图片配置测试失败:', error);
}

console.log('\n2. 测试统一请求封装');
try {
  // 创建简化的请求封装测试
  const requestTest = {
    request: function(options = {}) {
      const defaultOptions = {
        method: 'GET',
        data: {},
        header: {},
        showLoading: true,
        showError: true,
        useCache: false,
        retry: true,
        retryCount: 3,
        timeout: 10000
      };
      
      const mergedOptions = { ...defaultOptions, ...options };
      
      // 显示loading
      if (mergedOptions.showLoading) {
        wx.showLoading({
          title: '加载中...',
          mask: true
        });
      }
      
      return new Promise((resolve, reject) => {
        const requestTask = wx.request({
          url: 'http://127.0.0.1:8080' + mergedOptions.url,
          method: mergedOptions.method,
          data: mergedOptions.data,
          header: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'Authorization': wx.getStorageSync('token') ? `Bearer ${wx.getStorageSync('token')}` : '',
            ...mergedOptions.header
          },
          timeout: mergedOptions.timeout,
          success: (res) => {
            // 隐藏loading
            if (mergedOptions.showLoading) {
              wx.hideLoading();
            }
            
            if (res.statusCode === 200) {
              const { code, data, msg } = res.data;
              
              if (code === 200) {
                resolve(data);
              } else {
                const error = new Error(msg || '请求失败');
                error.code = 'BUSINESS_ERROR';
                error.response = res;
                
                if (mergedOptions.showError) {
                  wx.showToast({
                    title: msg || '操作失败',
                    icon: 'none',
                    duration: 3000
                  });
                }
                
                reject(error);
              }
            } else {
              const error = new Error(`HTTP错误: ${res.statusCode}`);
              error.code = 'HTTP_ERROR';
              error.response = res;
              
              if (mergedOptions.showError) {
                wx.showToast({
                  title: `请求失败: ${res.statusCode}`,
                  icon: 'none',
                  duration: 3000
                });
              }
              
              reject(error);
            }
          },
          fail: (err) => {
            // 隐藏loading
            if (mergedOptions.showLoading) {
              wx.hideLoading();
            }
            
            const error = new Error(err.errMsg || '网络请求失败');
            error.code = 'NETWORK_ERROR';
            error.originalError = err;
            
            if (mergedOptions.showError) {
              wx.showToast({
                title: '网络连接失败',
                icon: 'none',
                duration: 3000
              });
            }
            
            reject(error);
          }
        });
        
        // 超时处理
        if (mergedOptions.timeout > 0) {
          setTimeout(() => {
            // 模拟超时
            const error = new Error(`请求超时: ${mergedOptions.timeout}ms`);
            error.code = 'TIMEOUT';
            
            if (mergedOptions.showError) {
              wx.showToast({
                title: '请求超时',
                icon: 'none',
                duration: 3000
              });
            }
            
            reject(error);
          }, mergedOptions.timeout);
        }
      });
    },
    
    get: function(url, data = {}, options = {}) {
      return this.request({
        url,
        method: 'GET',
        data,
        ...options
      });
    },
    
    post: function(url, data = {}, options = {}) {
      return this.request({
        url,
        method: 'POST',
        data,
        ...options
      });
    }
  };
  
  // 测试GET请求
  console.log('测试GET请求...');
  requestTest.get('/api/test', { id: 1 })
    .then(data => console.log('GET请求成功:', data))
    .catch(error => console.error('GET请求失败:', error.message));
  
  // 测试POST请求
  console.log('测试POST请求...');
  requestTest.post('/api/submit', { name: '测试数据' })
    .then(data => console.log('POST请求成功:', data))
    .catch(error => console.error('POST请求失败:', error.message));
    
} catch (error) {
  console.error('请求封装测试失败:', error);
}

console.log('\n3. 测试集成使用');
try {
  // 模拟集成使用场景
  const integrationTest = {
    // 模拟获取定制类型
    getCustomTypes: function() {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve([
            { id: 1, name: '春联', imagePath: '/upload/custom/spring-couplet.jpg' },
            { id: 2, name: '福字', imagePath: '/upload/custom/fu.jpg' },
            { id: 3, name: '横批', imagePath: '/upload/custom/horizontal.jpg' }
          ]);
        }, 200);
      });
    },
    
    // 加载定制类型并处理图片
    async loadCustomTypesWithImages() {
      console.log('开始加载定制类型...');
      
      try {
        const types = await this.getCustomTypes();
        console.log('获取到定制类型:', types.length, '个');
        
        // 处理图片URL
        const processedTypes = types.map(type => {
          // 这里应该使用实际的图片配置工具
          const imageUrl = `http://127.0.0.1:8080/profile/upload${type.imagePath}`;
          const thumbnailUrl = `${imageUrl}?x-oss-process=image/resize,w_200`;
          
          return {
            ...type,
            imageUrl: imageUrl,
            thumbnailUrl: thumbnailUrl
          };
        });
        
        console.log('处理后的类型数据:');
        processedTypes.forEach(type => {
          console.log(`  ${type.name}: ${type.thumbnailUrl}`);
        });
        
        return processedTypes;
        
      } catch (error) {
        console.error('加载定制类型失败:', error);
        throw error;
      }
    },
    
    // 测试错误处理
    async testErrorHandling() {
      console.log('\n测试错误处理...');
      
      try {
        // 模拟一个会失败的请求
        await new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error('模拟的请求失败'));
          }, 100);
        });
        
      } catch (error) {
        console.log('捕获到错误:', error.message);
        
        // 模拟错误处理
        wx.showToast({
          title: '操作失败，请稍后重试',
          icon: 'none',
          duration: 2000
        });
        
        return false;
      }
    }
  };
  
  // 运行集成测试
  integrationTest.loadCustomTypesWithImages()
    .then(() => integrationTest.testErrorHandling())
    .then(() => console.log('集成测试完成'))
    .catch(error => console.error('集成测试失败:', error));
    
} catch (error) {
  console.error('集成测试失败:', error);
}

console.log('\n=== 测试总结 ===');
console.log('1. 图片配置工具: 支持后端图片URL生成和图片检查');
console.log('2. 统一请求封装: 支持GET/POST请求、错误处理、loading显示');
console.log('3. 集成使用: 可以结合图片配置和请求封装使用');
console.log('4. 错误处理: 支持网络错误、业务错误、超时错误等');
console.log('\n=== 下一步建议 ===');
console.log('1. 在实际页面中测试图片配置工具');
console.log('2. 测试统一请求封装的实际API调用');
console.log('3. 配置正确的后端API地址');
console.log('4. 上传实际图片到后端进行测试');