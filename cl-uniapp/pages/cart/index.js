import Dialog from 'tdesign-miniprogram/dialog/index';
import Toast from 'tdesign-miniprogram/toast/index';
import { getCartList, updateCartQuantity, removeFromCart } from '../../services/app/cart';
import { getMyCustomList } from '../../services/custom/custom';
import { get } from '../../services/_utils/request';
import { getDeviceId } from '../../utils/deviceId';
import {
  getLocalCustomList,
  setLocalCustomList,
  mergeCustomLists,
} from '../../utils/customCartCache';

const CUSTOM_STATUS_MAP = {
  '0': { text: '待接单', class: 'status-pending' },
  '1': { text: '制作中', class: 'status-making' },
  '2': { text: '已完成', class: 'status-done' },
};

function buildOrderStatusMap(orderList) {
  const map = {};
  (orderList || []).forEach((o) => {
    if (o.orderId == null) {
      return;
    }
    map[String(o.orderId)] = {
      status: o.status != null ? String(o.status) : '',
      cancelStatus: o.cancelStatus != null ? String(o.cancelStatus) : '0',
    };
  });
  return map;
}

function getOrderInfoForCustom(item, orderMap) {
  const orderId = item.orderId != null ? String(item.orderId) : '';
  const fromApi = orderId && orderMap[orderId] ? orderMap[orderId] : null;
  if (item.orderStatus != null || item.cancelStatus != null) {
    return {
      status: item.orderStatus != null ? String(item.orderStatus) : (fromApi && fromApi.status) || '',
      cancelStatus:
        item.cancelStatus != null ? String(item.cancelStatus) : (fromApi && fromApi.cancelStatus) || '0',
    };
  }
  return fromApi;
}

function resolveCustomDisplayStatus(customItem, orderInfo) {
  if (orderInfo && orderInfo.status === '4') {
    return { text: '已取消', class: 'status-canceled' };
  }
  if (orderInfo && orderInfo.cancelStatus === '1') {
    return { text: '取消审核中', class: 'status-cancel-pending' };
  }
  return CUSTOM_STATUS_MAP[customItem.status] || { text: '处理中', class: 'status-pending' };
}

function parseCustomContent(content) {
  if (!content) {
    return { shanglian: '', xialian: '', hengpi: '', summary: '定制春联' };
  }
  const text = String(content).trim();
  if (text.startsWith('{')) {
    try {
      const json = JSON.parse(text);
      const shanglian = json.shanglian || '';
      const xialian = json.xialian || '';
      const hengpi = json.hengpi || '';
      return {
        shanglian,
        xialian,
        hengpi,
        summary: hengpi || shanglian || '定制春联',
      };
    } catch (e) {
      // fall through
    }
  }
  const shanglian = (text.match(/上联[：:]\s*(.+)/) || [])[1] || '';
  const xialian = (text.match(/下联[：:]\s*(.+)/) || [])[1] || '';
  const hengpi = (text.match(/横批[：:]\s*(.+)/) || [])[1] || '';
  return {
    shanglian: shanglian.trim(),
    xialian: xialian.trim(),
    hengpi: hengpi.trim(),
    summary: hengpi.trim() || shanglian.trim() || '定制春联',
  };
}

function parseCustomPrice(spec) {
  if (!spec) return '';
  try {
    const json = JSON.parse(spec);
    if (json.price != null && json.price !== '') {
      return Number(json.price).toFixed(2);
    }
  } catch (e) {
    // ignore
  }
  return '';
}

function formatCustomItem(item, orderMap = {}) {
  const content = parseCustomContent(item.customContent);
  const orderInfo = getOrderInfoForCustom(item, orderMap);
  const statusInfo = resolveCustomDisplayStatus(item, orderInfo);
  const hideQueue =
    orderInfo && (orderInfo.status === '4' || orderInfo.cancelStatus === '1');
  return {
    ...item,
    ...content,
    priceText: parseCustomPrice(item.customSpec),
    statusText: statusInfo.text,
    statusClass: statusInfo.class,
    queueText: hideQueue || item.queueNo == null ? '' : `排队号 ${item.queueNo}`,
    etaText: hideQueue || item.estimatedTime == null ? '' : `约 ${item.estimatedTime} 分钟`,
  };
}

function enrichCustomListWithOrderStatus(customList, orderMap) {
  return (customList || []).map((item) => {
    const info = getOrderInfoForCustom(item, orderMap);
    if (!info) {
      return item;
    }
    return {
      ...item,
      orderStatus: info.status,
      cancelStatus: info.cancelStatus,
    };
  });
}

Page({
  data: {
    cartList: [],
    customList: [],
    loading: true,
    isEmpty: true,
    selectAll: false,
    totalAmount: 0,
    totalQuantity: 0,
  },

  onShow() {
    this.getTabBar?.()?.init?.();
    this.loadPageData();
  },

  onPullDownRefresh() {
    console.log('下拉刷新购物车');
    this.loadPageData().finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  onLoad() {
    console.log('购物车页面加载');
    this.needRefreshOnShow = false;
  },

  onUnload() {
    // 页面卸载时清理事件监听
    if (wx.$off) {
      wx.$off('orderCompleted');
    }
  },

  // 加载购物车与定制数据
  async loadPageData() {
    const loadSeq = (this._loadSeq = (this._loadSeq || 0) + 1);
    const localCustomRaw = getLocalCustomList();

    if (localCustomRaw.length > 0) {
      this.setData({
        customList: localCustomRaw.map((item) => formatCustomItem(item)),
        isEmpty: false,
      });
    }

    this.setData({ loading: true });

    try {
      const [cartResult, customResult, orderResult] = await Promise.allSettled([
        getCartList(),
        getMyCustomList(),
        get(
          '/api/app/order/list',
          { deviceId: getDeviceId(), _t: Date.now() },
          { showLoading: false, useCache: false, showError: false },
        ),
      ]);

      if (loadSeq !== this._loadSeq) {
        return;
      }

      let cartList = [];
      if (cartResult.status === 'fulfilled') {
        cartList = (cartResult.value || []).map((item) => ({
          ...item,
          isSelected: false,
        }));
      } else {
        console.error('加载普通购物车失败:', cartResult.reason);
      }

      const orderList =
        orderResult.status === 'fulfilled' && Array.isArray(orderResult.value)
          ? orderResult.value
          : [];
      const orderMap = buildOrderStatusMap(orderList);
      if (orderResult.status === 'rejected') {
        console.warn('加载订单列表失败，定制卡片可能无法反映主订单取消状态:', orderResult.reason);
      }

      const mergedCustom = mergeCustomLists(
        customResult.status === 'fulfilled' ? customResult.value : [],
        localCustomRaw,
      );
      if (customResult.status === 'rejected') {
        console.error('加载定制列表失败:', customResult.reason);
      }
      if (mergedCustom.length > 0) {
        setLocalCustomList(enrichCustomListWithOrderStatus(mergedCustom, orderMap));
      }

      const processedCustomList = mergedCustom.map((item) => formatCustomItem(item, orderMap));
      const isEmpty = cartList.length === 0 && processedCustomList.length === 0;

      this.setData({
        cartList,
        customList: processedCustomList,
        isEmpty,
      });
      this.calculateTotal();

      if (cartResult.status === 'rejected' && customResult.status === 'rejected') {
        Toast({
          context: this,
          selector: '#t-toast',
          message: '加载失败，请下拉刷新',
        });
      }
    } catch (error) {
      console.error('购物车页面加载异常:', error);
      this.setData({
        cartList: [],
        customList: [],
        isEmpty: true,
      });
    } finally {
      if (loadSeq === this._loadSeq) {
        this.setData({ loading: false });
      }
    }
  },

  // 兼容旧调用
  loadCartData() {
    return this.loadPageData();
  },

  // 计算总价和总数量
  calculateTotal() {
    const { cartList } = this.data;
    let totalAmount = 0;
    let totalQuantity = 0;
    let selectedCount = 0;
    
    cartList.forEach(item => {
      if (item.isSelected) {
        totalAmount += parseFloat(item.goodsPrice || 0) * (item.quantity || 0);
        totalQuantity += item.quantity || 0;
        selectedCount++;
      }
    });
    
    const selectAll = selectedCount === cartList.length && cartList.length > 0;
    
    this.setData({
      totalAmount: totalAmount.toFixed(2),
      totalQuantity,
      selectAll
    });
  },

  // 选择单个商品
  onSelectItem(e) {
    const cartId = e.currentTarget.dataset.cartId;
    const { cartList } = this.data;
    
    // 找到对应的商品并切换选中状态
    const updatedCartList = cartList.map(item => {
      if (item.cartId === cartId) {
        item.isSelected = !item.isSelected;
      }
      return item;
    });
    
    this.setData({ cartList: updatedCartList });
    this.calculateTotal();
  },

  // 全选/取消全选
  onSelectAll() {
    const { cartList, selectAll } = this.data;
    
    // 切换所有商品的选中状态
    const updatedCartList = cartList.map(item => {
      item.isSelected = !selectAll;
      return item;
    });
    
    this.setData({ cartList: updatedCartList });
    this.calculateTotal();
  },

  // 增加数量
  async increaseQuantity(e) {
    const cartId = e.currentTarget.dataset.cartId;
    const { cartList } = this.data;
    const item = cartList.find(item => item.cartId === cartId);
    
    if (!item) return;
    
    if (item.quantity >= item.stock) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '库存不足',
      });
      return;
    }
    
    try {
      wx.showLoading({ title: '更新中...' });
      await updateCartQuantity(cartId, item.quantity + 1);
      item.quantity += 1;
      this.setData({ cartList });
      this.calculateTotal();
      wx.hideLoading();
    } catch (error) {
      wx.hideLoading();
      console.error('更新数量失败:', error);
      Toast({
        context: this,
        selector: '#t-toast',
        message: '更新失败，请重试',
      });
    }
  },

  // 减少数量
  async decreaseQuantity(e) {
    const cartId = e.currentTarget.dataset.cartId;
    const { cartList } = this.data;
    const item = cartList.find(item => item.cartId === cartId);
    
    if (!item) return;
    
    if (item.quantity <= 1) {
      return;
    }
    
    try {
      wx.showLoading({ title: '更新中...' });
      await updateCartQuantity(cartId, item.quantity - 1);
      item.quantity -= 1;
      this.setData({ cartList });
      this.calculateTotal();
      wx.hideLoading();
    } catch (error) {
      wx.hideLoading();
      console.error('更新数量失败:', error);
      Toast({
        context: this,
        selector: '#t-toast',
        message: '更新失败，请重试',
      });
    }
  },

  // 删除单个商品
  removeItem(e) {
    const cartId = e.currentTarget.dataset.cartId;
    
    Dialog.confirm({
      content: '确认删除该商品吗?',
      confirmBtn: '确定',
      cancelBtn: '取消',
    }).then(async () => {
      try {
        await removeFromCart(cartId);
        const { cartList } = this.data;
        const newCartList = cartList.filter(item => item.cartId !== cartId);
        
        this.setData({
          cartList: newCartList,
          isEmpty: newCartList.length === 0 && this.data.customList.length === 0,
        });
        this.calculateTotal();
        
        Toast({
          context: this,
          selector: '#t-toast',
          message: '商品删除成功',
        });
      } catch (error) {
        console.error('删除商品失败:', error);
        Toast({
          context: this,
          selector: '#t-toast',
          message: '删除失败，请重试',
        });
      }
    });
  },

  // 去购物
  goShopping() {
    wx.switchTab({ url: '/pages/home/home' });
  },

  // 去定制页
  goCustom() {
    wx.switchTab({ url: '/pages/APP-custom/index' });
  },

  // 查看定制关联订单
  goToCustomOrder(e) {
    const orderId = e.currentTarget.dataset.orderId;
    if (!orderId) {
      wx.navigateTo({ url: '/pages/order/order-list/index' });
      return;
    }
    wx.navigateTo({
      url: `/pages/order/detail/index?orderId=${orderId}`,
    });
  },

  // 去商品详情
  goToDetail(e) {
    const goodsId = e.currentTarget.dataset.goodsId;
    wx.navigateTo({
      url: `/pages/goods/detail/index?goodsId=${goodsId}`,
    });
  },

  // 结算
  checkout() {
    const { cartList } = this.data;
    const selectedGoods = cartList.filter(item => item.isSelected);
    
    if (selectedGoods.length === 0) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '请选择要结算的商品',
      });
      return;
    }
    
    // 检查页面栈
    const pages = getCurrentPages();
    if (pages.length >= 10) {
      wx.showModal({
        title: '提示',
        content: '页面层级过深，请返回首页后重试',
        showCancel: false
      });
      return;
    }
    
    // 标记即将跳转，用于返回时判断是否需要刷新
    this.needRefreshOnShow = true;
    
    // 将选中商品写入全局，供 order/confirm 多商品结算页读取
    const app = getApp();
    if (!app.globalData) {
      app.globalData = {};
    }
    app.globalData.selectedCartItems = selectedGoods;

    wx.navigateTo({
      url: '/pages/order/confirm/index?type=multi',
      fail: (error) => {
        console.error('跳转失败:', error);
        this.needRefreshOnShow = false;
        Toast({
          context: this,
          selector: '#t-toast',
          message: `跳转失败: ${error.errMsg || '未知错误'}`,
        });
      }
    });
  },
});