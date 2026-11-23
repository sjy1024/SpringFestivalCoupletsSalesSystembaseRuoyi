/**
 * 商品列表页面
 */
import { getGoodsList } from '../../../services/app/goods';

Page({
  data: {
    goods: [],
    loading: false,
    searchKeyword: ''
  },

  onLoad() {
    this.loadGoodsList();
  },

  onPullDownRefresh() {
    this.loadGoodsList().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 加载商品列表
   */
  async loadGoodsList() {
    this.setData({ loading: true });
    try {
      const res = await getGoodsList({
        goodsName: this.data.searchKeyword
      });
      this.setData({ goods: res || [] });
    } catch (error) {
      wx.showToast({
        title: '加载商品失败',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 搜索商品
   */
  searchGoods() {
    this.loadGoodsList();
  },

  /**
   * 输入搜索关键词
   */
  onSearchInput(e) {
    this.setData({
      searchKeyword: e.detail.value
    });
  },

  /**
   * 进入商品详情
   */
  goDetail(e) {
    const goodsId = e.currentTarget.dataset.goodsId;
    wx.navigateTo({
      url: `/pages/goods/detail/index?goodsId=${goodsId}`
    });
  }
});
