import { config } from '../../config/index';
import { get, toAbsoluteUrl } from '../_utils/request';

/** 获取商品详情（Mock数据） */
function mockFetchGood(ID = 0) {
  const { delay } = require('../_utils/delay');
  const { genGood } = require('../../model/good');
  return delay().then(() => genGood(ID));
}

/**
 * 数据格式转换：将后端返回的商品详情转换为前端需要的格式
 * @param {Object} goods 后端返回的商品详情
 * @returns {Object} 转换后的商品详情
 */
function transformGoodsDetail(goods) {
  if (!goods) {
    return null;
  }

  const priceYuan = goods.goodsPrice || 0;
  const priceCent = Math.round(priceYuan * 100);
  const primaryImage = toAbsoluteUrl(goods.coverImage || '');
  const images = (goods.images
    ? (typeof goods.images === 'string' ? goods.images.split(',') : goods.images)
    : []
  ).map((s) => toAbsoluteUrl((s || '').trim())).filter(Boolean);

  return {
    // 兼容模板的商品结构（参考 model/good.js），只保留必要字段
    saasId: 'spring',
    storeId: '1',
    spuId: String(goods.goodsId),
    goodsId: goods.goodsId,
    title: goods.goodsName || '',
    primaryImage,
    images,
    available: 1,
    // 价格按“分”存储，兼容模板
    minSalePrice: priceCent,
    minLinePrice: priceCent,
    maxSalePrice: priceCent,
    maxLinePrice: priceCent,
    spuStockQuantity: goods.stock || 0,
    soldNum: 0,
    isPutOnSale: goods.status === '0' ? 1 : 0,
    specList: [],
    skuList: [
      {
        skuId: String(goods.goodsId),
        skuImage: primaryImage,
        specInfo: [],
        priceInfo: [
          { priceType: 1, price: String(priceCent), priceTypeName: '销售价格' },
        ],
        stockInfo: {
          stockQuantity: goods.stock || 0,
          safeStockQuantity: 0,
          soldQuantity: 0,
        },
        weight: null,
        volume: null,
        profitPrice: null,
      },
    ],
    spuTagList: goods.goodsType
      ? [{ id: null, title: goods.goodsType, image: null }]
      : [],
    desc: images.length ? images : [],
    etitle: '',
    status: goods.status || '0',
    stock: goods.stock || 0,
    goodsType: goods.goodsType || '',
    // 保留原始数据，方便后续使用
    _raw: goods
  };
}

/**
 * 获取商品详情
 * @param {Number|String} goodsId 商品ID
 * @returns {Promise} 商品详情数据
 */
export function fetchGood(goodsId) {
  // 如果使用Mock数据
  if (config.useMock) {
    return mockFetchGood(goodsId);
  }

  // 调用真实API
  return get(`/api/app/goods/${goodsId}`)
    .then(data => {
      // 数据格式转换
      return transformGoodsDetail(data);
    })
    .catch(err => {
      console.error('获取商品详情失败:', err);
      wx.showToast({
        title: '商品不存在或已下架',
        icon: 'none'
      });
      return null;
  });
}
