import { config } from '../../config/index';
import { get, toAbsoluteUrl } from '../_utils/request';

/** 获取商品列表 */
function mockFetchGoodsList(pageIndex = 1, pageSize = 20) {
  const { delay } = require('../_utils/delay');
  const { getGoodsList } = require('../../model/goods');
  return delay().then(() =>
    getGoodsList(pageIndex, pageSize).map((item) => {
      return {
        spuId: item.spuId,
        thumb: item.primaryImage,
        title: item.title,
        price: item.minSalePrice,
        originPrice: item.maxLinePrice,
        tags: item.spuTagList.map((tag) => tag.title),
      };
    }),
  );
}

/** 获取商品列表 */
export function fetchGoodsList(pageIndex = 1, pageSize = 20, requestOptions = {}) {
  if (config.useMock) {
    return mockFetchGoodsList(pageIndex, pageSize);
  }

  const mergedOptions = { showLoading: false, ...requestOptions };

  // 真实接口：若依后端 /api/app/goods/list（当前不分页，这里前端做 slice 模拟分页）
  return get('/api/app/goods/list', {}, mergedOptions)
    .then((list) => {
    const safeList = Array.isArray(list) ? list : [];
    const mapped = safeList.map((g) => ({
      spuId: g.goodsId,
      goodsId: g.goodsId,
      goodsType: g.goodsType,
      thumb: toAbsoluteUrl(g.coverImage || ''),
      title: g.goodsName || '',
      // 若依字段为 goodsPrice，这里统一映射为 price / originPrice 供前端展示
      price: g.goodsPrice || 0,
      originPrice: g.goodsPrice || 0,
      tags: g.goodsType ? [g.goodsType] : [],
    }));

    // 模拟分页：首页 fresh 时 pageIndex=0；后续 pageIndex 递增
    const start = pageIndex * pageSize;
    const end = start + pageSize;
    return mapped.slice(start, end);
  })
    .catch((err) => {
      if (config.fallbackToMock) {
        console.warn('商品列表 API 失败，降级为 mock 数据', err);
        return mockFetchGoodsList(pageIndex, pageSize);
      }
      throw err;
    });
}
