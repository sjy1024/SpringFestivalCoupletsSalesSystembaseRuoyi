/**
 * 小程序商品服务
 */
import { request, toAbsoluteUrl } from '../_utils/request';

/**
 * 获取商品列表
 * @param {Object} params 查询参数
 * @returns {Promise}
 */
export function getGoodsList(params = {}) {
  return request({
    url: '/api/app/goods/list',
    method: 'GET',
    data: params,
    showLoading: true
  }).then(list => {
    // 处理图片地址
    if (Array.isArray(list)) {
      return list.map(item => ({
        ...item,
        coverImage: toAbsoluteUrl(item.coverImage)
      }));
    }
    return list;
  });
}

/**
 * 获取商品详情
 * @param {Number} goodsId 商品ID
 * @returns {Promise}
 */
export function getGoodsDetail(goodsId) {
  return request({
    url: `/api/app/goods/${goodsId}`,
    method: 'GET',
    showLoading: true
  }).then(goods => {
    // 处理图片地址
    if (goods && goods.coverImage) {
      goods.coverImage = toAbsoluteUrl(goods.coverImage);
    }
    return goods;
  });
}
