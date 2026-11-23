/**
 * 订单详情页面
 */
import { getOrderDetail, mockPay, confirmReceive } from '../../../services/app/order';
import { cancelOrder } from '../../../services/order/orderStatus';
import { setOrderContextForCustom } from '../../../utils/customBridge';

Page({
  data: {
    orderId: null,
    order: {
      orderId: null,
      orderNo: '',
      status: '',
      statusName: '',
      totalAmount: 0,
      receiverName: '',
      receiverPhone: '',
      receiverAddress: '',
      createTime: null,
      updateTime: null,
      remark: '',
      cancelStatus: '0',
      cancelReason: '',
      cancelStatusName: '',
    },
    items: [],
    loading: false
  },

  onLoad(options) {
    console.log('订单详情页面 onLoad, options:', options);
    this.orderId = parseInt(options.orderId);
    if (!this.orderId || isNaN(this.orderId)) {
      wx.showToast({
        title: '订单参数错误',
        icon: 'none'
      });
      return;
    }
    this.loadOrderDetail();
  },

  /**
   * 加载订单详情
   */
  async loadOrderDetail() {
    if (this.data.loading) return;
    
    this.setData({ loading: true });
    wx.showLoading({ title: '加载中...' });
    
    try {
      console.log('开始加载订单详情, orderId:', this.orderId);
      const orderData = await getOrderDetail(this.orderId);
      console.log('订单详情原始数据:', orderData);
      
      // 后端返回的数据结构：
      // {
      //   orderId, orderNo, status, orderStatusName, totalAmount,
      //   receiverName, receiverPhone, receiverAddress,
      //   orderItemVOs: [...], logisticsVO: {...}, paymentVO: {...}
      // }
      
      if (!orderData) {
        throw new Error('订单数据为空');
      }
      
      // 映射订单基本信息
      const order = {
        orderId: orderData.orderId,
        orderNo: orderData.orderNo,
        status: orderData.status,
        statusName: orderData.orderStatusName || this.getStatusText(orderData.status),
        totalAmount: orderData.totalAmount || orderData.paymentAmount || 0,
        receiverName: orderData.receiverName || orderData.logisticsVO?.receiverName || '',
        receiverPhone: orderData.receiverPhone || orderData.logisticsVO?.receiverPhone || '',
        receiverAddress: orderData.receiverAddress || orderData.logisticsVO?.receiverAddress || '',
        createTime: orderData.createTime,
        updateTime: orderData.updateTime,
        createTimeDisplay: this.formatTime(orderData.createTime),
        payTimeDisplay: orderData.status !== '0' ? this.formatTime(orderData.updateTime) : '',
        remark: orderData.remark || '',
        cancelStatus: orderData.cancelStatus || '0',
        cancelReason: orderData.cancelReason || '',
        cancelStatusName: orderData.cancelStatusName || this.getCancelStatusText(orderData.cancelStatus),
      };
      
      // 映射订单项列表
      const items = (orderData.orderItemVOs || []).map(item => ({
        itemId: item.itemId,
        goodsId: item.goodsId,
        goodsName: item.goodsName,
        goodsPrice: item.goodsPrice,
        quantity: item.quantity || item.buyQuantity,
        totalPrice: item.totalPrice,
        goodsPictureUrl: item.goodsPictureUrl || item.thumb,
        specText: item.specText || '',
      }));
      
      console.log('处理后的订单数据:', { order, items });
      
      this.setData({
        order: order,
        items: items
      });
      
      wx.hideLoading();
    } catch (error) {
      console.error('加载订单详情失败:', error);
      wx.hideLoading();
      wx.showToast({
        title: error.message || '加载订单失败',
        icon: 'none',
        duration: 2000
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 获取订单状态文本
   */
  getStatusText(status) {
    const statusMap = {
      '0': '待支付',
      '1': '已支付',
      '2': '制作中',
      '3': '已收货',
      '4': '已取消'
    };
    return statusMap[status] || '未知';
  },

  getCancelStatusText(cancelStatus) {
    const map = {
      '1': '取消审核中',
      '2': '取消已通过',
      '3': '取消已拒绝',
    };
    return map[cancelStatus] || '';
  },

  handleCancelOrder() {
    if (this.data.loading) return;
    const { status, cancelStatus } = this.data.order;
    if (cancelStatus === '1') {
      wx.showToast({ title: '取消申请审核中', icon: 'none' });
      return;
    }

    const isPaidFlow = status === '1' || status === '2';
    wx.showModal({
      title: isPaidFlow ? '申请取消订单？' : '确认取消订单？',
      content: isPaidFlow
        ? '提交后需商家审核，通过后方会取消订单。'
        : '取消后无法恢复，是否继续？',
      confirmText: isPaidFlow ? '提交申请' : '确认取消',
      success: async (res) => {
        if (!res.confirm) return;
        try {
          this.setData({ loading: true });
          wx.showLoading({ title: '处理中...' });
          await cancelOrder(this.orderId, '用户在详情页申请取消', status);
          wx.hideLoading();
          wx.showToast({
            title: isPaidFlow ? '申请已提交' : '订单已取消',
            icon: 'success',
          });
          setTimeout(() => this.loadOrderDetail(), 1200);
        } catch (error) {
          wx.hideLoading();
          wx.showToast({
            title: error.message || '操作失败',
            icon: 'none',
          });
          this.setData({ loading: false });
        }
      },
    });
  },

  /**
   * 格式化时间
   */
  formatTime(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  },

  /**
   * 支付订单（模拟支付）
   */
  async payOrder() {
    if (this.data.loading) return;
    
    wx.showModal({
      title: '模拟支付',
      content: '确认支付订单？',
      success: async (res) => {
        if (res.confirm) {
          try {
            this.setData({ loading: true });
            wx.showLoading({ title: '支付中...' });
            
            console.log('开始模拟支付, orderId:', this.orderId);
            await mockPay(this.orderId);
            
            wx.hideLoading();
            wx.showToast({
              title: '支付成功',
              icon: 'success',
              duration: 1500
            });
            
            // 立即刷新订单详情
            setTimeout(() => {
              this.loadOrderDetail();
            }, 1500);
          } catch (error) {
            console.error('支付失败:', error);
            wx.hideLoading();
            wx.showToast({
              title: error.message || '支付失败',
              icon: 'none',
              duration: 2000
            });
            this.setData({ loading: false });
          }
        }
      }
    });
  },

  /**
   * 确认收货
   */
  async confirmReceive() {
    if (this.data.loading) return;
    
    wx.showModal({
      title: '确认收货',
      content: '确认已收到商品？',
      success: async (res) => {
        if (res.confirm) {
          try {
            this.setData({ loading: true });
            wx.showLoading({ title: '处理中...' });
            
            console.log('开始确认收货, orderId:', this.orderId);
            await confirmReceive(this.orderId);
            
            wx.hideLoading();
            wx.showToast({
              title: '确认收货成功',
              icon: 'success',
              duration: 1500
            });
            
            // 立即刷新订单详情
            setTimeout(() => {
              this.loadOrderDetail();
            }, 1500);
          } catch (error) {
            console.error('确认收货失败:', error);
            wx.hideLoading();
            wx.showToast({
              title: error.message || '确认收货失败',
              icon: 'none',
              duration: 2000
            });
            this.setData({ loading: false });
          }
        }
      }
    });
  },

  /** 智能定制：关联本单并打开定制 Tab */
  goSmartCustom() {
    const o = this.data.order;
    if (!o || !o.orderId) {
      wx.showToast({ title: '订单信息未就绪', icon: 'none' });
      return;
    }
    setOrderContextForCustom(o.orderId, o.orderNo || '');
    wx.switchTab({ url: '/pages/APP-custom/index' });
  },

  /**
   * 返回订单列表
   */
  goOrderList() {
    // 使用 redirectTo 替换当前页面，避免页面栈问题
    wx.redirectTo({
      url: '/pages/order/order-list/index',
      fail: (err) => {
        console.error('跳转订单列表失败:', err);
        // 如果 redirectTo 失败，尝试使用 navigateBack
        wx.navigateBack({
          fail: () => {
            // 如果 navigateBack 也失败，使用 switchTab 跳转到个人中心
            wx.switchTab({
              url: '/pages/usercenter/index'
            });
          }
        });
      }
    });
  }
});
