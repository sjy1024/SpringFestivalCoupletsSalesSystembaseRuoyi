// 价格计算工具

import { CUSTOM_OPTIONS, PRICE_CONFIG } from '../../config/APP-config';

/**
 * 价格计算工具类
 */
class PriceCalculator {
  /**
   * 计算定制商品价格
   * @param {number} basePrice - 基础价格
   * @param {Object} options - 定制选项
   * @param {string} options.material - 材质ID
   * @param {string} options.size - 尺寸ID
   * @param {string} options.paper - 纸张ID
   * @param {string} options.printing - 印刷ID
   * @returns {Object} - 价格计算结果
   */
  static calculateCustomPrice(basePrice, options = {}) {
    // 默认价格
    let totalPrice = basePrice || PRICE_CONFIG.BASE_PRICE;
    let customizationPrice = 0;
    let priceDetails = [];
    
    // 材质价格计算
    if (options.material) {
      const material = CUSTOM_OPTIONS.MATERIALS.find(m => m.id === options.material);
      if (material) {
        const materialPrice = material.price * PRICE_CONFIG.CUSTOM_FACTORS.MATERIAL;
        customizationPrice += materialPrice;
        priceDetails.push({
          name: material.name,
          price: materialPrice
        });
      }
    }
    
    // 尺寸价格计算
    if (options.size) {
      const size = CUSTOM_OPTIONS.SIZES.find(s => s.id === options.size);
      if (size) {
        const sizePrice = size.price * PRICE_CONFIG.CUSTOM_FACTORS.SIZE;
        customizationPrice += sizePrice;
        priceDetails.push({
          name: size.name,
          price: sizePrice
        });
      }
    }
    
    // 纸张价格计算
    if (options.paper) {
      const paper = CUSTOM_OPTIONS.PAPERS.find(p => p.id === options.paper);
      if (paper) {
        const paperPrice = paper.price * PRICE_CONFIG.CUSTOM_FACTORS.PAPER;
        customizationPrice += paperPrice;
        priceDetails.push({
          name: paper.name,
          price: paperPrice
        });
      }
    }
    
    // 印刷价格计算
    if (options.printing) {
      const printing = CUSTOM_OPTIONS.PRINTING.find(p => p.id === options.printing);
      if (printing) {
        const printingPrice = printing.price * PRICE_CONFIG.CUSTOM_FACTORS.PRINTING;
        customizationPrice += printingPrice;
        priceDetails.push({
          name: printing.name,
          price: printingPrice
        });
      }
    }
    
    // 计算总价
    totalPrice += customizationPrice;
    
    // 应用优惠
    let discountedPrice = totalPrice;
    let discountAmount = 0;
    
    if (totalPrice >= PRICE_CONFIG.DISCOUNT.MIN_AMOUNT) {
      discountedPrice = totalPrice * PRICE_CONFIG.DISCOUNT.DISCOUNT_RATE;
      discountAmount = totalPrice - discountedPrice;
    }
    
    // 格式化价格（保留2位小数）
    totalPrice = parseFloat(totalPrice.toFixed(2));
    customizationPrice = parseFloat(customizationPrice.toFixed(2));
    discountedPrice = parseFloat(discountedPrice.toFixed(2));
    discountAmount = parseFloat(discountAmount.toFixed(2));
    
    return {
      basePrice: parseFloat(basePrice.toFixed(2)) || PRICE_CONFIG.BASE_PRICE,
      customizationPrice,
      totalPrice,
      discountAmount,
      discountedPrice,
      priceDetails,
      hasDiscount: discountAmount > 0
    };
  }
  
  /**
   * 计算购物车总价
   * @param {Array} cartItems - 购物车商品列表
   * @returns {Object} - 购物车价格计算结果
   */
  static calculateCartPrice(cartItems = []) {
    let totalPrice = 0;
    let totalQuantity = 0;
    let itemPrices = [];
    
    cartItems.forEach(item => {
      const itemPrice = item.price * item.quantity;
      totalPrice += itemPrice;
      totalQuantity += item.quantity;
      
      itemPrices.push({
        goodsId: item.goodsId,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: itemPrice
      });
    });
    
    // 应用优惠
    let discountedPrice = totalPrice;
    let discountAmount = 0;
    
    if (totalPrice >= PRICE_CONFIG.DISCOUNT.MIN_AMOUNT) {
      discountedPrice = totalPrice * PRICE_CONFIG.DISCOUNT.DISCOUNT_RATE;
      discountAmount = totalPrice - discountedPrice;
    }
    
    // 格式化价格
    totalPrice = parseFloat(totalPrice.toFixed(2));
    discountedPrice = parseFloat(discountedPrice.toFixed(2));
    discountAmount = parseFloat(discountAmount.toFixed(2));
    
    return {
      totalPrice,
      totalQuantity,
      discountedPrice,
      discountAmount,
      itemPrices,
      hasDiscount: discountAmount > 0
    };
  }
  
  /**
   * 格式化价格显示
   * @param {number} price - 价格
   * @param {string} currency - 货币符号，默认¥
   * @returns {string} - 格式化后的价格字符串
   */
  static formatPrice(price, currency = '¥') {
    return `${currency}${parseFloat(price).toFixed(2)}`;
  }
  
  /**
   * 计算订单总价
   * @param {Array} orderItems - 订单商品列表
   * @param {number} shippingFee - 运费
   * @returns {Object} - 订单价格计算结果
   */
  static calculateOrderPrice(orderItems = [], shippingFee = 0) {
    let goodsPrice = 0;
    
    orderItems.forEach(item => {
      goodsPrice += item.totalPrice || (item.price * item.quantity);
    });
    
    // 计算总价
    let totalPrice = goodsPrice + shippingFee;
    
    // 应用优惠
    let discountedPrice = totalPrice;
    let discountAmount = 0;
    
    if (totalPrice >= PRICE_CONFIG.DISCOUNT.MIN_AMOUNT) {
      discountedPrice = totalPrice * PRICE_CONFIG.DISCOUNT.DISCOUNT_RATE;
      discountAmount = totalPrice - discountedPrice;
    }
    
    // 格式化价格
    goodsPrice = parseFloat(goodsPrice.toFixed(2));
    shippingFee = parseFloat(shippingFee.toFixed(2));
    totalPrice = parseFloat(totalPrice.toFixed(2));
    discountedPrice = parseFloat(discountedPrice.toFixed(2));
    discountAmount = parseFloat(discountAmount.toFixed(2));
    
    return {
      goodsPrice,
      shippingFee,
      totalPrice,
      discountedPrice,
      discountAmount,
      hasDiscount: discountAmount > 0
    };
  }
  
  /**
   * 获取定制选项的详细信息
   * @param {string} type - 选项类型：material, size, paper, printing
   * @param {string} id - 选项ID
   * @returns {Object|null} - 选项详细信息
   */
  static getOptionDetail(type, id) {
    switch (type) {
      case 'material':
        return CUSTOM_OPTIONS.MATERIALS.find(m => m.id === id) || null;
      case 'size':
        return CUSTOM_OPTIONS.SIZES.find(s => s.id === id) || null;
      case 'paper':
        return CUSTOM_OPTIONS.PAPERS.find(p => p.id === id) || null;
      case 'printing':
        return CUSTOM_OPTIONS.PRINTING.find(p => p.id === id) || null;
      default:
        return null;
    }
  }
}

// 导出
module.exports = PriceCalculator;
