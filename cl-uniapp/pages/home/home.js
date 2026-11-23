import { fetchHome, getDefaultHomeTabs } from '../../services/home/home';
import { fetchGoodsList } from '../../services/good/fetchGoods';
import { addToCart } from '../../services/app/cart';
import { STARTUP_REQUEST_OPTIONS } from '../../services/_utils/request';
import Toast from 'tdesign-miniprogram/toast/index';

Page({
  data: {
    imgSrcs: [],
    tabList: getDefaultHomeTabs(),
    goodsList: [],
    goodsListLoadStatus: 0,
    pageLoading: false,
    current: 1,
    autoplay: true,
    duration: '500',
    interval: 5000,
    navigation: { type: 'dots' },
    swiperImageProps: { mode: 'scaleToFill' },
  },

  goodListPagination: {
    index: 0,
    num: 20,
  },

  privateData: {
    tabIndex: 0,
  },

  onShow() {
    this.getTabBar?.()?.init?.();
  },

  onLoad() {
    this.init();
  },

  onReachBottom() {
    if (this.data.goodsListLoadStatus === 0) {
      this.loadGoodsList();
    }
  },

  onPullDownRefresh() {
    this.init();
  },

  init() {
    this.loadHomePage();
  },

  loadHomePage() {
    wx.stopPullDownRefresh();

    // 先展示骨架结构，避免等待 API 时整页空白
    this.setData({
      pageLoading: false,
      tabList: this.data.tabList.length ? this.data.tabList : getDefaultHomeTabs(),
      goodsListLoadStatus: 1,
    });

    console.log('开始加载首页数据（轮播与商品列表独立请求）...');

    fetchHome()
      .then((homeData) => {
        this.setData({
          tabList: homeData.tabList || getDefaultHomeTabs(),
          imgSrcs: homeData.swiper || [],
        });
      })
      .catch((err) => {
        console.error('首页轮播/分类加载失败:', err);
        this.setData({
          tabList: getDefaultHomeTabs(),
        });
      });

    fetchGoodsList(0, 20, STARTUP_REQUEST_OPTIONS)
      .then((goodsList) => {
        console.log('商品列表加载成功');
        this.setData({
          goodsList: goodsList || [],
          goodsListLoadStatus: 0,
        });
        this.goodListPagination.index = 0;
      })
      .catch((err) => {
        console.error('商品列表加载失败:', err);
        this.setData({
          goodsListLoadStatus: 3,
        });
        wx.showToast({
          title: '商品加载失败，请重试',
          icon: 'none',
        });
      });
  },

  tabChangeHandle(e) {
    this.privateData.tabIndex = e.detail;
    this.loadGoodsList(true);
  },

  onReTry() {
    this.loadGoodsList();
  },

  async loadGoodsList(fresh = false) {
    // 兼容：如果某些运行环境下自定义字段未挂载，做一次兜底初始化，避免直接崩溃
    if (!this.privateData) {
      this.privateData = { tabIndex: 0 };
    }

    if (fresh) {
      wx.pageScrollTo({
        scrollTop: 0,
      });
    }

    this.setData({ goodsListLoadStatus: 1 });

    // 兼容：如果某些运行环境下自定义字段未挂载，做一次兜底初始化，避免直接崩溃
    if (!this.goodListPagination) {
      this.goodListPagination = { index: 0, num: 20 };
    }

    const pageSize = this.goodListPagination.num || 20;
    let pageIndex = (this.privateData.tabIndex || 0) * pageSize + this.goodListPagination.index + 1;
    if (fresh) {
      pageIndex = 0;
    }

    console.log('开始加载商品列表，参数:', { pageIndex, pageSize });

    try {
      const nextList = await fetchGoodsList(pageIndex, pageSize);
      console.log('商品列表加载成功:', nextList);
      this.setData({
        goodsList: fresh ? nextList : this.data.goodsList.concat(nextList),
        goodsListLoadStatus: 0,
      });

      this.goodListPagination.index = pageIndex;
      this.goodListPagination.num = pageSize;
    } catch (err) {
      console.error('商品列表加载失败:', err);
      this.setData({ goodsListLoadStatus: 3 });
    }
  },

  goodListClickHandle(e) {
    const { index } = e.detail;
    const { spuId } = this.data.goodsList[index];
    wx.navigateTo({
      url: `/pages/goods/detail/index?goodsId=${spuId}`,
    });
  },

  async goodListAddCartHandle(e) {
    const { index } = e.detail;
    const goods = this.data.goodsList[index];

    if (!goods || !(goods.goodsId || goods.spuId)) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '商品信息无效',
      });
      return;
    }

    // 规格商品需进详情页选规格，避免后端报错
    if (String(goods.goodsType) === '1') {
      wx.navigateTo({
        url: `/pages/goods/detail/index?goodsId=${goods.goodsId || goods.spuId}`,
      });
      return;
    }

    try {
      await addToCart({
        goodsId: goods.goodsId || goods.spuId,
        quantity: 1,
      });
      Toast({
        context: this,
        selector: '#t-toast',
        message: '已加入购物车',
      });
    } catch (error) {
      console.error('首页加购失败:', error);
      Toast({
        context: this,
        selector: '#t-toast',
        message: '加入购物车失败',
      });
    }
  },

  navToSearchPage() {
    wx.navigateTo({ url: '/pages/goods/search/index' });
  },

  /** 首页强入口：AI 春联对话 */
  navToAIChat() {
    wx.navigateTo({ url: '/pages/APP-ai-chat/index' });
  },

  /** 跳转定制 Tab，与 AI 形成闭环 */
  navToCustom() {
    wx.switchTab({ url: '/pages/APP-custom/index' });
  },

  navToActivityDetail({ detail }) {
    const { index = 0 } = detail || {};
    const bannerItem = this.data.imgSrcs[index];
    
    if (bannerItem && bannerItem.goodsId) {
      // 跳转到商品详情页
      wx.navigateTo({
        url: `/pages/goods/detail/index?goodsId=${bannerItem.goodsId}`,
      });
    } else {
      // 兜底：跳转到商品列表页
      wx.navigateTo({
        url: '/pages/goods/list/index'
      });
    }
  },
});
