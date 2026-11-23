import { get, toAbsoluteUrl, STARTUP_REQUEST_OPTIONS } from '../_utils/request';
import { config } from '../../config/index';

/**
 * 获取轮播图商品数据（真实接口版本）
 * ✅ 优化：使用独立的轮播图接口，避免重复请求商品列表
 */
async function fetchBannerGoods() {
  try {
    // 优先使用缓存
    const cacheKey = 'home_banner_cache';
    const cacheTime = 5 * 60 * 1000; // 5分钟缓存
    const cache = wx.getStorageSync(cacheKey);
    
    if (cache && cache.timestamp && (Date.now() - cache.timestamp < cacheTime)) {
      console.log('使用轮播图缓存数据');
      return cache.data;
    }
    
    // 直接从商品列表API获取前3个商品作为轮播图
    const goodsList = await get('/api/app/goods/list', {}, { ...STARTUP_REQUEST_OPTIONS });
    const safeList = Array.isArray(goodsList) ? goodsList : [];
    
    if (safeList.length === 0) {
      console.warn('商品列表为空，使用mock数据');
      return await mockFetchBannerGoods();
    }
    
    const bannerGoods = safeList.slice(0, 3).map((goods, index) => ({
      value: toAbsoluteUrl(goods.coverImage || ''), // TDesign轮播图组件需要value字段作为图片地址
      ariaLabel: goods.goodsName || '精品商品',
      // 保留原有字段用于点击事件
      id: index + 1,
      image: toAbsoluteUrl(goods.coverImage || ''),
      title: goods.goodsName || '精品商品',
      subtitle: goods.description || goods.goodsType || '优质商品，值得信赖',
      goodsId: goods.goodsId
    }));
    
    // 缓存数据
    wx.setStorageSync(cacheKey, {
      data: bannerGoods,
      timestamp: Date.now()
    });
    
    console.log('轮播图数据获取成功:', bannerGoods);
    return bannerGoods;
  } catch (error) {
    console.error('获取轮播图商品数据失败:', error);
    // 如果接口失败，返回mock数据
    return await mockFetchBannerGoods();
  }
}

/**
 * 获取轮播图商品数据（Mock版本）
 */
async function mockFetchBannerGoods() {
  const { delay } = require('../_utils/delay');
  
  await delay();
  return [
    {
      value: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop&q=80',
      ariaLabel: '精品春联套装',
      id: 1,
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop&q=80',
      title: '精品春联套装',
      subtitle: '传统手写春联，福到万家',
      goodsId: 1
    },
    {
      value: 'https://images.unsplash.com/photo-1609025098046-cd4628902d4a?w=800&h=400&fit=crop&q=80',
      ariaLabel: '福字门贴',
      id: 2,
      image: 'https://images.unsplash.com/photo-1609025098046-cd4628902d4a?w=800&h=400&fit=crop&q=80',
      title: '福字门贴',
      subtitle: '优质红纸，金字工艺',
      goodsId: 2
    },
    {
      value: 'https://images.unsplash.com/photo-1577720643272-265f434b4b0f?w=800&h=400&fit=crop&q=80',
      ariaLabel: '定制对联',
      id: 3,
      image: 'https://images.unsplash.com/photo-1577720643272-265f434b4b0f?w=800&h=400&fit=crop&q=80',
      title: '定制对联',
      subtitle: '个性化定制，专属祝福',
      goodsId: 3
    }
  ];
}

/**
 * 获取轮播图数据
 */
export function getBannerData() {
  if (config.useMock) {
    return mockFetchBannerGoods();
  }
  
  return fetchBannerGoods();
}