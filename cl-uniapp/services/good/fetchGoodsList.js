/* eslint-disable no-param-reassign */
import { config } from '../../config/index';
import { get, toAbsoluteUrl } from '../_utils/request';

/** 获取商品列表（Mock数据） */
function mockFetchGoodsList(params) {
  const { delay } = require('../_utils/delay');
  const { getSearchResult } = require('../../model/search');

  const data = getSearchResult(params);

  if (data.spuList.length) {
    data.spuList.forEach((item) => {
      item.spuId = item.spuId;
      item.thumb = item.primaryImage;
      item.title = item.title;
      item.price = item.minSalePrice;
      item.originPrice = item.maxLinePrice;
      item.desc = '';
      if (item.spuTagList) {
        item.tags = item.spuTagList.map((tag) => tag.title);
      } else {
        item.tags = [];
      }
    });
  }
  return delay().then(() => {
    return data;
  });
}

/**
 * 数据格式转换：将后端返回的商品数据转换为前端需要的格式
 * @param {Array} goodsList 后端返回的商品列表
 * @returns {Array} 转换后的商品列表
 */
function transformGoodsList(goodsList) {
  if (!Array.isArray(goodsList)) {
    return [];
  }
  
  return goodsList.map(item => ({
    spuId: item.goodsId,
    goodsId: item.goodsId, // 保留原始ID，方便后续使用
    title: item.goodsName || '',
    thumb: toAbsoluteUrl(item.coverImage || ''),
    // 若依字段为 goodsPrice，这里统一映射为 price / originPrice 供前端展示
    price: item.goodsPrice || 0,
    originPrice: item.goodsPrice || 0,
    desc: item.description || '',
    tags: item.goodsType ? [item.goodsType] : [],
    status: item.status || '0',
    stock: item.stock || 0
  }));
}

/**
 * 获取商品列表
 * @param {Object} params 查询参数
 * @param {String} params.keyword 搜索关键词（商品名称）
 * @param {String} params.type 商品类型
 * @param {Number} params.pageNum 页码（从1开始）
 * @param {Number} params.pageSize 每页数量
 * @returns {Promise} 商品列表数据
 */
export function fetchGoodsList(params = {}) {
  // 如果使用Mock数据
  if (config.useMock) {
    return mockFetchGoodsList(params);
  }

  // 调用真实API
  return get('/api/app/goods/list', {
    goodsName: params.keyword,
    goodsType: params.type
  }).then(data => {
    // 数据格式转换
    const transformedList = transformGoodsList(data);
    
    // 返回符合前端组件期望的格式
    return {
      spuList: transformedList,
      // 兼容模板页：有的页面读 totalCount，有的读 total
      total: transformedList.length,
      totalCount: transformedList.length
    };
  }).catch(err => {
    console.error('获取商品列表失败:', err);
    return {
      spuList: [],
      total: 0,
      totalCount: 0
    };
  });
}
