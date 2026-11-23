/**
 * 订单确认页面
 */
import { getGoodsDetail } from '../../../services/app/goods';
import { createOrder } from '../../../services/app/order';
import { getDeviceId } from '../../../utils/device';
import { getDefaultAddress } from '../../../services/address/fetchAddress';
import { getAddressPromise } from '../../../services/address/list';
import {
  isSpecGoods,
  parseSpecOptions,
  calcUnitPrice,
  formatSpecText,
  parseItemSpecIds,
} from '../../../utils/goodsSpec';

Page({
  data: {
    type: 'single', // single: 单商品, multi: 多商品
    goodsId: null,
    quantity: 1,
    sizeId: null,
    materialId: null,
    goods: {},
    specText: '',
    goodsList: [], // 多商品列表
    form: {
      receiverName: '',
      receiverPhone: '',
      receiverAddress: ''
    },
    selectedAddress: null, // 选中的地址对象
    hasAddress: false, // 是否有地址
    submitting: false,
    totalAmount: '0.00'
  },

  onLoad(options) {
    const type = options.type || 'single';
    this.setData({ type });
    
    if (type === 'multi') {
      // 多商品结算
      this.loadMultiGoodsData();
    } else {
      // 单商品结算
      this.goodsId = parseInt(options.goodsId, 10);
      this.setData({
        quantity: parseInt(options.quantity, 10) || 1,
        sizeId: options.sizeId ? parseInt(options.sizeId, 10) : null,
        materialId: options.materialId ? parseInt(options.materialId, 10) : null,
      });
      this.loadGoodsDetail();
    }
    
    // 加载默认地址
    this.loadDefaultAddress();
  },

  /**
   * 加载默认地址
   */
  async loadDefaultAddress() {
    try {
      const address = await getDefaultAddress();
      if (address) {
        this.setSelectedAddress(address);
      }
    } catch (error) {
      console.log('没有默认地址');
    }
  },

  /**
   * 设置选中的地址
   */
  setSelectedAddress(address) {
    this.setData({
      selectedAddress: address,
      hasAddress: true,
      'form.receiverName': address.receiverName || address.name,
      'form.receiverPhone': address.receiverPhone || address.phone,
      'form.receiverAddress': address.address || `${address.provinceName}${address.cityName}${address.districtName}${address.detailAddress}`
    });
  },

  /**
   * 选择地址
   */
  selectAddress() {
    // 获取地址选择Promise
    getAddressPromise()
      .then((address) => {
        console.log('用户选择了地址:', address);
        this.setSelectedAddress(address);
      })
      .catch(() => {
        console.log('用户取消选择地址');
      });

    // 跳转到地址列表页（选择模式）
    const addressId = this.data.selectedAddress?.addressId || this.data.selectedAddress?.id || '';
    wx.navigateTo({
      url: `/pages/user/address/list/index?selectMode=1&isOrderSure=1${addressId ? '&id=' + addressId : ''}`
    });
  },

  /**
   * 加载多商品数据
   */
  loadMultiGoodsData() {
    try {
      // 延迟获取全局数据，确保app已经初始化
      setTimeout(() => {
        const app = getApp();
        const selectedCartItems = app.globalData?.selectedCartItems || [];
        
        console.log('获取到的多商品数据:', selectedCartItems);
        
        if (selectedCartItems.length === 0) {
          wx.showToast({
            title: '没有选中的商品',
            icon: 'none'
          });
          setTimeout(() => {
            wx.navigateBack();
          }, 1500);
          return;
        }
        
        // 为每个商品计算小计
        const processedGoodsList = selectedCartItems.map(item => {
          const unitPrice = parseFloat(item.goodsPrice) || 0;
          const specText = item.specText || formatSpecText(item.itemSpec);
          const { sizeId, materialId } = parseItemSpecIds(item.itemSpec);
          return {
            ...item,
            specText,
            sizeId,
            materialId,
            subtotal: (unitPrice * item.quantity).toFixed(2),
          };
        });
        
        this.setData({ goodsList: processedGoodsList });
        this.calculateMultiTotalAmount();
      }, 100);
    } catch (error) {
      console.error('加载多商品数据失败:', error);
      wx.showToast({
        title: '加载商品失败',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  /**
   * 加载商品详情（单商品）
   */
  async loadGoodsDetail() {
    try {
      const res = await getGoodsDetail(this.goodsId);
      const { sizeId, materialId } = this.data;
      let unitPrice = parseFloat(res.goodsPrice) || 0;
      let specText = '';

      if (isSpecGoods(res.goodsType) && sizeId && materialId) {
        const spec = parseSpecOptions(res.specOptions);
        unitPrice = calcUnitPrice(spec.sizes, spec.materials, sizeId, materialId) || unitPrice;
        const size = spec.sizes.find((s) => s.id === sizeId);
        const material = spec.materials.find((m) => m.id === materialId);
        if (size && material) {
          specText = `${size.name} / ${material.name}`;
        }
      }

      this.setData({
        goods: { ...res, goodsPrice: unitPrice },
        specText,
      });
      this.calculateTotalAmount();
    } catch (error) {
      console.error('加载商品详情失败:', error);
      wx.showToast({
        title: '加载商品失败',
        icon: 'none',
      });
    }
  },

  /**
   * 输入收货人
   */
  onReceiverNameInput(e) {
    this.setData({
      'form.receiverName': e.detail.value
    });
  },

  /**
   * 输入收货电话
   */
  onReceiverPhoneInput(e) {
    this.setData({
      'form.receiverPhone': e.detail.value
    });
  },

  /**
   * 输入收货地址
   */
  onReceiverAddressInput(e) {
    this.setData({
      'form.receiverAddress': e.detail.value
    });
  },

  /**
   * 计算总金额（单商品）
   */
  calculateTotalAmount() {
    console.log('计算总金额 - 商品价格:', this.data.goods.goodsPrice, '数量:', this.data.quantity);
    if (this.data.goods.goodsPrice && this.data.quantity) {
      const total = (parseFloat(this.data.goods.goodsPrice) * this.data.quantity).toFixed(2);
      console.log('计算得出总金额:', total);
      this.setData({ totalAmount: total });
    } else {
      console.log('价格或数量为空，设置为0.00');
      this.setData({ totalAmount: '0.00' });
    }
  },

  /**
   * 计算总金额（多商品）
   */
  calculateMultiTotalAmount() {
    const { goodsList } = this.data;
    let total = 0;
    
    goodsList.forEach(item => {
      total += parseFloat(item.goodsPrice) * item.quantity;
    });
    
    console.log('多商品总金额:', total.toFixed(2));
    this.setData({ totalAmount: total.toFixed(2) });
  },

  /**
   * 获取总金额（保留原方法用于其他地方调用）
   */
  getTotalAmount() {
    if (this.data.type === 'multi') {
      return this.data.totalAmount;
    } else {
      if (this.data.goods.goodsPrice && this.data.quantity) {
        return (parseFloat(this.data.goods.goodsPrice) * this.data.quantity).toFixed(2);
      }
      return '0.00';
    }
  },

  /**
   * 图片加载错误处理
   */
  onImageError(e) {
    console.error('图片加载失败:', e.detail);
    // 可以设置默认图片
    if (this.data.type === 'single') {
      this.setData({
        'goods.coverImage': '/images/default-goods.png'
      });
    }
  },

  /**
   * 提交订单
   */
  async submitOrder() {
    // 验证表单
    if (!this.data.form.receiverName.trim()) {
      wx.showToast({
        title: '请输入收货人',
        icon: 'none'
      });
      return;
    }
    if (!this.data.form.receiverPhone.trim()) {
      wx.showToast({
        title: '请输入联系电话',
        icon: 'none'
      });
      return;
    }
    if (!this.data.form.receiverAddress.trim()) {
      wx.showToast({
        title: '请输入收货地址',
        icon: 'none'
      });
      return;
    }

    this.setData({ submitting: true });

    try {
      let orderId;
      
      if (this.data.type === 'multi') {
        // 多商品订单
        const createRes = await createOrder({
          type: 'multi',
          goodsList: this.data.goodsList.map(item => ({
            goodsId: item.goodsId,
            quantity: item.quantity,
            price: item.goodsPrice,
            sizeId: item.sizeId,
            materialId: item.materialId,
          })),
          receiverName: this.data.form.receiverName,
          receiverPhone: this.data.form.receiverPhone,
          receiverAddress: this.data.form.receiverAddress,
          deviceId: getDeviceId()
        });
        orderId = createRes.orderId;
      } else {
        // 单商品订单
        const createRes = await createOrder({
          goodsId: this.goodsId,
          quantity: this.data.quantity,
          sizeId: this.data.sizeId,
          materialId: this.data.materialId,
          receiverName: this.data.form.receiverName,
          receiverPhone: this.data.form.receiverPhone,
          receiverAddress: this.data.form.receiverAddress,
          deviceId: getDeviceId(),
        });
        orderId = createRes.orderId;
      }

      // 订单创建成功
      console.log('订单创建成功, orderId:', orderId);

      // 清空购物车中已结算的商品
      try {
        const { removeFromCart } = require('../../../services/app/cart');
        const app = getApp();
        
        if (this.data.type === 'multi') {
          // 多商品订单：删除选中的商品
          const selectedCartItems = app.globalData?.selectedCartItems || [];
          
          console.log('========== 开始清空购物车（多商品）==========');
          console.log('选中的商品数量:', selectedCartItems.length);
          console.log('选中的商品详情:', JSON.stringify(selectedCartItems));
          
          const deletePromises = selectedCartItems.map((item, index) => {
            console.log(`准备删除商品 ${index + 1}:`, {
              cartId: item.cartId,
              goodsName: item.goodsName
            });
            
            if (item.cartId) {
              return removeFromCart(item.cartId)
                .then(() => {
                  console.log(`成功删除购物车商品 ${index + 1}:`, item.cartId);
                })
                .catch(err => {
                  console.error(`删除购物车商品 ${index + 1} 失败:`, item.cartId, err);
                });
            } else {
              console.warn(`商品 ${index + 1} 没有 cartId:`, item);
              return Promise.resolve();
            }
          });
          
          await Promise.all(deletePromises);
          console.log('购物车商品已清空');
          console.log('====================================');
          
          // 清除全局数据
          if (app.globalData) {
            delete app.globalData.selectedCartItems;
          }
        } else {
          // 单商品订单：需要找到对应的购物车项并删除
          console.log('========== 开始清空购物车（单商品）==========');
          console.log('商品ID:', this.goodsId);
          
          // 获取购物车列表，找到对应的商品
          const { getCartList } = require('../../../services/app/cart');
          const cartList = await getCartList();
          
          console.log('当前购物车列表:', cartList);
          
          // 找到对应商品的购物车项（同规格）
          const cartItem = cartList.find((item) => {
            if (item.goodsId !== this.goodsId) return false;
            if (this.data.sizeId && this.data.materialId) {
              const ids = parseItemSpecIds(item.itemSpec);
              return ids.sizeId === this.data.sizeId && ids.materialId === this.data.materialId;
            }
            return !item.itemSpec;
          });
          
          if (cartItem && cartItem.cartId) {
            console.log('找到对应的购物车项:', cartItem);
            await removeFromCart(cartItem.cartId);
            console.log('成功删除购物车商品:', cartItem.cartId);
          } else {
            console.log('未找到对应的购物车项，可能已被删除或不在购物车中');
          }
          
          console.log('====================================');
        }
      } catch (error) {
        console.error('清空购物车失败:', error);
        // 即使清空失败也继续流程
      }

      wx.showToast({
        title: '订单创建成功',
        icon: 'success',
        duration: 1500
      });

      // 跳转到订单详情，使用 redirectTo 替换当前页面
      setTimeout(() => {
        wx.redirectTo({
          url: `/pages/order/detail/index?orderId=${orderId}`,
          fail: () => {
            // 如果 redirectTo 失败，使用 navigateTo
            wx.navigateTo({
              url: `/pages/order/detail/index?orderId=${orderId}`
            });
          }
        });
      }, 1500);
    } catch (error) {
      console.error('提交订单失败:', error);
      wx.showToast({
        title: '下单失败，请重试',
        icon: 'none'
      });
    } finally {
      this.setData({ submitting: false });
    }
  }
});
