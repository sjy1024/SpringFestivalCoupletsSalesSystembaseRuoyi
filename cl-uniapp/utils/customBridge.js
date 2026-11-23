/**
 * 定制 Tab 与 AI 页、订单页之间的桥接（Tab 页无法用 URL 传参，使用本地缓存一次性消费）。
 */

const STORAGE_AI_FILL = 'cl_custom_ai_couplet_fill_v1';
const STORAGE_ORDER_CTX = 'cl_custom_order_context_v1';

/**
 * 从 AI 回复文本中解析 上联/下联/横批（支持中文冒号、英文冒号或空格后接内容）。
 * @param {string} text
 * @returns {{ shanglian: string, xialian: string, hengpi: string } | null}
 */
export function parseCoupletFromText(text) {
  if (!text || typeof text !== 'string') {
    return null;
  }
  const normalized = text.replace(/\r\n/g, '\n');
  const pick = (re) => {
    const m = normalized.match(re);
    return m && m[1] ? String(m[1]).trim() : '';
  };
  const shanglian = pick(/上联\s*[：:]\s*([^\n\r]+)/);
  const xialian = pick(/下联\s*[：:]\s*([^\n\r]+)/);
  const hengpi = pick(/横批\s*[：:]\s*([^\n\r]+)/);
  if (shanglian && xialian && hengpi) {
    return { shanglian, xialian, hengpi };
  }
  return null;
}

export function setAiCoupletPayload(payload) {
  const shanglian = String(payload.shanglian || '').trim();
  const xialian = String(payload.xialian || '').trim();
  const hengpi = String(payload.hengpi || '').trim();
  wx.setStorageSync(STORAGE_AI_FILL, {
    shanglian,
    xialian,
    hengpi,
    ts: Date.now()
  });
}

export function consumeAiCoupletPayload() {
  try {
    const v = wx.getStorageSync(STORAGE_AI_FILL);
    if (v && v.ts) {
      wx.removeStorageSync(STORAGE_AI_FILL);
      return {
        shanglian: v.shanglian || '',
        xialian: v.xialian || '',
        hengpi: v.hengpi || ''
      };
    }
  } catch (e) {
    // ignore
  }
  return null;
}

/**
 * @param {string|number} orderId
 * @param {string} [orderNo] 展示用
 */
export function setOrderContextForCustom(orderId, orderNo) {
  if (orderId == null || orderId === '') {
    return;
  }
  wx.setStorageSync(STORAGE_ORDER_CTX, {
    orderId: String(orderId),
    orderNo: orderNo != null ? String(orderNo) : '',
    ts: Date.now()
  });
}

/**
 * @returns {{ orderId: string, orderNo: string } | null}
 */
export function consumeOrderContextForCustom() {
  try {
    const v = wx.getStorageSync(STORAGE_ORDER_CTX);
    if (v && v.orderId) {
      wx.removeStorageSync(STORAGE_ORDER_CTX);
      return { orderId: v.orderId, orderNo: v.orderNo || '' };
    }
  } catch (e) {
    // ignore
  }
  return null;
}

/**
 * 在定制页 onShow 中调用：消费 AI 填入与订单关联（各最多生效一次）。
 * @param {any} pageInstance 定制页 Page 实例（需含 setData、calculatePrice、selectedOptions）
 */
export function applyPendingCustomBridge(pageInstance) {
  let filledAi = false;
  const fill = consumeAiCoupletPayload();
  if (fill && (fill.shanglian || fill.xialian || fill.hengpi)) {
    pageInstance.setData({
      'selectedOptions.shanglian': fill.shanglian || '',
      'selectedOptions.xialian': fill.xialian || '',
      'selectedOptions.hengpi': fill.hengpi || '',
      error: ''
    });
    filledAi = true;
    if (typeof pageInstance.calculatePrice === 'function') {
      pageInstance.calculatePrice();
    }
  }

  let boundOrder = false;
  const ctx = consumeOrderContextForCustom();
  if (ctx) {
    pageInstance.setData({
      boundOrderId: ctx.orderId,
      boundOrderNo: ctx.orderNo || ''
    });
    boundOrder = true;
  }

  if (filledAi && boundOrder) {
    wx.showToast({ title: '已填入春联并关联订单', icon: 'none', duration: 2200 });
  } else if (filledAi) {
    wx.showToast({ title: '已从 AI 填入', icon: 'success' });
  } else if (boundOrder) {
    wx.showToast({ title: '已关联订单，提交将写入该订单', icon: 'none' });
  }
}
