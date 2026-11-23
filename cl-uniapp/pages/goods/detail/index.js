/**
 * 商品详情页面
 */
import { getGoodsDetail } from '../../../services/app/goods';
import {
  isSpecGoods,
  parseSpecOptions,
  calcUnitPrice,
  buildItemSpec,
} from '../../../utils/goodsSpec';

Page({
  data: {
    goodsId: null,
    goods: {},
    quantity: 1,
    isSpec: false,
    sizeOptions: [],
    materialOptions: [],
    selectedSizeId: null,
    selectedMaterialId: null,
    unitPrice: 0,
    unitPriceDisplay: '0.00',
  },

  onLoad(options) {
    this.goodsId = parseInt(options.goodsId, 10);
    this.loadGoodsDetail();
  },

  async loadGoodsDetail() {
    try {
      const res = await getGoodsDetail(this.goodsId);
      const spec = parseSpecOptions(res.specOptions);
      const isSpec = isSpecGoods(res.goodsType) && spec.sizes.length > 0 && spec.materials.length > 0;
      const selectedSizeId = isSpec ? spec.sizes[0].id : null;
      const selectedMaterialId = isSpec ? spec.materials[0].id : null;
      const unitPrice = isSpec
        ? calcUnitPrice(spec.sizes, spec.materials, selectedSizeId, selectedMaterialId)
        : Number(res.goodsPrice) || 0;

      this.setData({
        goods: res,
        isSpec,
        sizeOptions: spec.sizes,
        materialOptions: spec.materials,
        selectedSizeId,
        selectedMaterialId,
        unitPrice,
        unitPriceDisplay: unitPrice.toFixed(2),
      });
    } catch (error) {
      wx.showToast({
        title: '加载商品失败',
        icon: 'none',
      });
    }
  },

  updateUnitPrice() {
    const { isSpec, sizeOptions, materialOptions, selectedSizeId, selectedMaterialId, goods } = this.data;
    let unitPrice = Number(goods.goodsPrice) || 0;
    if (isSpec) {
      unitPrice = calcUnitPrice(sizeOptions, materialOptions, selectedSizeId, selectedMaterialId) || 0;
    }
    this.setData({
      unitPrice,
      unitPriceDisplay: unitPrice.toFixed(2),
    });
  },

  selectSize(e) {
    const sizeId = parseInt(e.currentTarget.dataset.id, 10);
    this.setData({ selectedSizeId: sizeId });
    this.updateUnitPrice();
  },

  selectMaterial(e) {
    const materialId = parseInt(e.currentTarget.dataset.id, 10);
    this.setData({ selectedMaterialId: materialId });
    this.updateUnitPrice();
  },

  validateSpec() {
    if (!this.data.isSpec) {
      return true;
    }
    if (!this.data.selectedSizeId || !this.data.selectedMaterialId) {
      wx.showToast({ title: '请选择尺寸和联纸', icon: 'none' });
      return false;
    }
    return true;
  },

  getSpecPayload() {
    if (!this.data.isSpec) {
      return {};
    }
    return {
      sizeId: this.data.selectedSizeId,
      materialId: this.data.selectedMaterialId,
    };
  },

  decreaseQuantity() {
    if (this.data.quantity > 1) {
      this.setData({ quantity: this.data.quantity - 1 });
    }
  },

  increaseQuantity() {
    if (this.data.quantity < this.data.goods.stock) {
      this.setData({ quantity: this.data.quantity + 1 });
    }
  },

  async addToCart() {
    if (!this.validateSpec()) return;

    try {
      const { addToCart } = require('../../../services/app/cart');
      await addToCart({
        goodsId: this.goodsId,
        quantity: this.data.quantity,
        ...this.getSpecPayload(),
      });

      wx.showToast({
        title: '已加入购物车',
        icon: 'success',
      });

      setTimeout(() => {
        wx.showModal({
          title: '提示',
          content: '商品已加入购物车，是否前往购物车查看？',
          success: (res) => {
            if (res.confirm) {
              wx.switchTab({ url: '/pages/cart/index' });
            }
          },
        });
      }, 1500);
    } catch (error) {
      wx.showToast({
        title: error.message || '加入购物车失败',
        icon: 'none',
      });
    }
  },

  buyNow() {
    if (!this.validateSpec()) return;

    const { selectedSizeId, selectedMaterialId } = this.data;
    let url = `/pages/order/confirm/index?goodsId=${this.goodsId}&quantity=${this.data.quantity}`;
    if (this.data.isSpec) {
      url += `&sizeId=${selectedSizeId}&materialId=${selectedMaterialId}`;
    }
    wx.navigateTo({ url });
  },
});
