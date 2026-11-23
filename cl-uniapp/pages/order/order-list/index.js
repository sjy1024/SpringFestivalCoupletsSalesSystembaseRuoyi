import { OrderStatus } from '../config';
import { fetchOrders, fetchOrdersCount } from '../../../services/order/orderList';
import { cosThumb } from '../../../utils/util';
import { getDeviceId } from '../../../utils/device';

Page({
  page: {
    size: 5,
    num: 1,
  },

  data: {
    tabs: [
      { key: -1, text: '全部' },
      { key: OrderStatus.PENDING_PAYMENT, text: '待付款', info: '' },
      { key: OrderStatus.PAID, text: '已支付', info: '' },
      { key: OrderStatus.IN_PRODUCTION, text: '制作中', info: '' },
      { key: OrderStatus.COMPLETED, text: '已完成', info: '' },
    ],
    curTab: -1,
    orderList: [],
    listLoading: 1,
    pullDownRefreshing: false,
    emptyImg: 'https://tdesign.gtimg.com/miniprogram/template/retail/order/empty-order-list.png',
    backRefresh: false,
    status: -1,
    deviceId: '', // 添加设备ID
  },

  onLoad(query) {
    const tabKeys = this.data.tabs.map((tab) => String(tab.key));
    let status = query.status !== undefined && query.status !== '' ? String(query.status) : '-1';
    status = tabKeys.includes(status) ? (status === '-1' ? -1 : status) : -1;

    const deviceId = getDeviceId();
    console.log('订单列表页面 deviceId:', deviceId);
    this.setData({ deviceId });

    this.init(status);
    this.pullDownRefresh = this.selectComponent('#wr-pull-down-refresh');
  },

  onShow() {
    if (!this.data.backRefresh) return;
    this.onRefresh();
    this.setData({ backRefresh: false });
  },

  onReachBottom() {
    if (this.data.listLoading === 0) {
      this.getOrderList(this.data.curTab);
    }
  },

  onPageScroll(e) {
    this.pullDownRefresh && this.pullDownRefresh.onPageScroll(e);
  },

  onPullDownRefresh_() {
    this.setData({ pullDownRefreshing: true });
    this.refreshList(this.data.curTab)
      .then(() => {
        this.setData({ pullDownRefreshing: false });
      })
      .catch((err) => {
        this.setData({ pullDownRefreshing: false });
        Promise.reject(err);
      });
  },

  init(status) {
    status = status !== undefined ? status : this.data.curTab;
    this.setData({
      status,
    });
    this.refreshList(status);
  },

  getOrderList(statusCode = -1, reset = false) {
    const params = {
      parameter: {
        pageSize: this.page.size,
        pageNum: this.page.num,
        deviceId: this.data.deviceId, // 传递设备ID
      },
    };
    // 只有当 statusCode 不是 -1 且不是 '-1' 时，才添加 orderStatus 参数
    if (statusCode !== -1 && statusCode !== '-1') {
      params.parameter.orderStatus = statusCode;
    }
    
    console.log('getOrderList 参数:', params);
    console.log('当前状态码:', statusCode);
    console.log('是否添加状态过滤:', statusCode !== -1 && statusCode !== '-1');
    
    this.setData({ listLoading: 1 });
    return fetchOrders(params)
      .then((res) => {
        console.log('getOrderList 返回结果:', res);
        
        this.page.num++;
        let orderList = [];
        if (res && res.data && res.data.orders) {
          console.log('订单数量:', res.data.orders.length);
          orderList = (res.data.orders || []).map((order) => {
            return {
              id: order.orderId,
              orderNo: order.orderNo,
              parentOrderNo: order.parentOrderNo,
              storeId: order.storeId,
              storeName: order.storeName,
              status: order.orderStatus,
              cancelStatus: order.cancelStatus || '0',
              statusDesc: order.orderStatusName,
              amount: order.paymentAmount,
              totalAmount: order.totalAmount,
              logisticsNo: order.logisticsVO.logisticsNo,
              createTime: order.createTime,
              goodsList: (order.orderItemVOs || []).map((goods) => ({
                id: goods.itemId || goods.id,
                thumb: cosThumb(goods.goodsPictureUrl || goods.thumb, 70),
                title: goods.goodsName,
                skuId: goods.skuId,
                spuId: goods.spuId || goods.goodsId,
                specs: goods.specText
                  ? [goods.specText]
                  : (goods.specifications || []).map((spec) => spec.specValue),
                price: goods.goodsPrice || goods.actualPrice || goods.tagPrice,
                num: goods.buyQuantity || goods.quantity,
                titlePrefixTags: goods.tagText ? [{ text: goods.tagText }] : [],
              })),
              buttons: order.buttonVOs || [],
              groupInfoVo: order.groupInfoVo,
              freightFee: order.freightFee,
            };
          });
        } else {
          console.warn('订单数据格式不正确:', res);
        }
        
        console.log('处理后的订单列表:', orderList);
        
        return new Promise((resolve) => {
          if (reset) {
            this.setData({ orderList: [] }, () => resolve());
          } else resolve();
        }).then(() => {
          this.setData({
            orderList: this.data.orderList.concat(orderList),
            listLoading: 2,
          });
          console.log('最终显示的订单列表:', this.data.orderList);
        });
      })
      .catch((err) => {
        console.error('getOrderList 错误:', err);
        this.setData({ listLoading: 3 });
        return Promise.reject(err);
      });
  },

  onReTryLoad() {
    this.getOrderList(this.data.curTab);
  },

  onTabChange(e) {
    const { value } = e.detail;
    console.log('========== 切换标签页 ==========');
    console.log('选中的标签值 value:', value);
    console.log('value 的类型:', typeof value);
    console.log('================================');
    this.setData({
      status: value,
    });
    this.refreshList(value);
  },

  getOrdersCount() {
    return fetchOrdersCount().then((res) => {
      const tabsCount = res.data || [];
      const { tabs } = this.data;
      tabs.forEach((tab) => {
        const tabCount = tabsCount.find((c) => String(c.tabType) === String(tab.key));
        if (tabCount) {
          tab.info = tabCount.orderNum;
        }
      });
      this.setData({ tabs });
    });
  },

  refreshList(status = -1) {
    console.log('========== refreshList 开始 ==========');
    console.log('刷新列表，状态值:', status);
    console.log('状态值类型:', typeof status);
    console.log('====================================');
    
    this.page = {
      size: this.page.size,
      num: 1,
    };
    this.setData({ curTab: status, orderList: [], listLoading: 1 });

    return Promise.all([this.getOrderList(status, true), this.getOrdersCount()]);
  },

  onRefresh() {
    this.refreshList(this.data.curTab);
  },

  onOrderCardTap(e) {
    const { order } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/order/detail/index?orderId=${order.id}`,
    });
  },

  // 处理订单按钮操作后的刷新
  onOrderRefresh() {
    this.onRefresh();
  },
});
