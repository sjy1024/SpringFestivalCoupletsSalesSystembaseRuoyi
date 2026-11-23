const STORAGE_KEY = 'custom_cart_list';

function normalizeItem(item) {
  if (!item || item.customId == null) {
    return null;
  }
  return { ...item };
}

export function getLocalCustomList() {
  try {
    const raw = wx.getStorageSync(STORAGE_KEY);
    return Array.isArray(raw) ? raw : [];
  } catch (error) {
    console.warn('[customCartCache] getLocalCustomList failed', error);
    return [];
  }
}

export function setLocalCustomList(list) {
  try {
    wx.setStorageSync(STORAGE_KEY, Array.isArray(list) ? list : []);
  } catch (error) {
    console.warn('[customCartCache] setLocalCustomList failed', error);
  }
}

export function appendLocalCustomItem(item) {
  const normalized = normalizeItem(item);
  if (!normalized) {
    return;
  }
  const list = getLocalCustomList();
  const index = list.findIndex((row) => row.customId === normalized.customId);
  if (index >= 0) {
    list[index] = { ...list[index], ...normalized };
  } else {
    list.unshift(normalized);
  }
  setLocalCustomList(list);
}

export function mergeCustomLists(apiList = [], localList = []) {
  const map = new Map();
  [...localList, ...apiList].forEach((item) => {
    const normalized = normalizeItem(item);
    if (!normalized) {
      return;
    }
    const existing = map.get(normalized.customId) || {};
    map.set(normalized.customId, { ...existing, ...normalized });
  });
  return Array.from(map.values()).sort((a, b) => {
    const timeA = new Date(a.createTime || 0).getTime();
    const timeB = new Date(b.createTime || 0).getTime();
    return timeB - timeA;
  });
}

/**
 * 主订单状态变更后，同步更新本地定制列表缓存（购物车「我的定制」即时展示）
 * @param {string|number} orderId
 * @param {string|null} orderStatus 主订单 status，传 null 表示不更新
 * @param {string|null} cancelStatus 主订单 cancelStatus，传 null 表示不更新
 */
export function patchLocalCustomOrderStatus(orderId, orderStatus, cancelStatus) {
  if (orderId == null || orderId === '') {
    return;
  }
  const idStr = String(orderId);
  let changed = false;
  const list = getLocalCustomList().map((item) => {
    if (String(item.orderId) !== idStr) {
      return item;
    }
    changed = true;
    const next = { ...item };
    if (orderStatus != null) {
      next.orderStatus = String(orderStatus);
    }
    if (cancelStatus != null) {
      next.cancelStatus = String(cancelStatus);
    }
    return next;
  });
  if (changed) {
    setLocalCustomList(list);
  }
}
