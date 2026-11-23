// 订单状态与配置（主包共享，供个人中心、服务等引用）
export const OrderStatus = {
  PENDING_PAYMENT: '0', // 待支付
  PAID: '1', // 已支付
  IN_PRODUCTION: '2', // 制作中
  COMPLETED: '3', // 已完成/已收货
  CANCELED: '4', // 已取消
};

export const OrderStatusNames = {
  [OrderStatus.PENDING_PAYMENT]: '待付款',
  [OrderStatus.PAID]: '已支付',
  [OrderStatus.IN_PRODUCTION]: '制作中',
  [OrderStatus.COMPLETED]: '已收货',
  [OrderStatus.CANCELED]: '已取消',
};

export const OrderStatusDesc = {
  [OrderStatus.PENDING_PAYMENT]: '请尽快完成支付',
  [OrderStatus.PAID]: '商家已接单，准备制作',
  [OrderStatus.IN_PRODUCTION]: '春联正在精心制作中',
  [OrderStatus.COMPLETED]: '感谢您的购买，祝您新年快乐！',
  [OrderStatus.CANCELED]: '订单已取消',
};

export const OrderStatusIcons = {
  [OrderStatus.PENDING_PAYMENT]: 'wallet',
  [OrderStatus.PAID]: 'check-circle',
  [OrderStatus.IN_PRODUCTION]: 'tools',
  [OrderStatus.COMPLETED]: 'star-filled',
  [OrderStatus.CANCELED]: 'close-circle',
};

export const AfterServiceStatus = {
  TO_AUDIT: 10,
  THE_APPROVED: 20,
  HAVE_THE_GOODS: 30,
  ABNORMAL_RECEIVING: 40,
  COMPLETE: 50,
  CLOSED: 60,
};

export const ServiceType = {
  RETURN_GOODS: 10,
  ONLY_REFUND: 20,
  ORDER_CANCEL: 30,
};

export const ServiceTypeDesc = {
  [ServiceType.RETURN_GOODS]: '退货',
  [ServiceType.ONLY_REFUND]: '退款',
  [ServiceType.ORDER_CANCEL]: '支付后取消',
};

export const OrderButtonTypes = {
  PAY: 1,
  CANCEL: 2,
  CONFIRM: 3,
  APPLY_REFUND: 4,
  VIEW_REFUND: 5,
  COMMENT: 6,
  DELETE: 7,
  DELIVERY: 8,
  REBUY: 9,
  INVITE_GROUPON: 11,
};

export const ServiceButtonTypes = {
  REVOKE: 2,
  FILL_TRACKING_NO: 3,
  CHANGE_TRACKING_NO: 4,
  VIEW_DELIVERY: 5,
};

export const ServiceStatus = {
  PENDING_VERIFY: 100,
  VERIFIED: 110,
  PENDING_DELIVERY: 120,
  PENDING_RECEIPT: 130,
  RECEIVED: 140,
  EXCEPTION: 150,
  REFUNDED: 160,
  CLOSED: 170,
};

export const ServiceReceiptStatus = {
  RECEIPTED: 1,
  NOT_RECEIPTED: 2,
};

export const LogisticsNodeTypes = {
  SUBMITTED: 200001,
  PAYMENTED: 200002,
  SHIPPED: 200003,
  CANCELED: 200004,
  RECEIVED: 200005,
  ADDRESS_CHANGED: 200006,
  IN_TRANSIT: 200007,
};

export const LogisticsIconMap = {
  [LogisticsNodeTypes.SUBMITTED]: '',
  [LogisticsNodeTypes.PAYMENTED]: 'credit_card',
  [LogisticsNodeTypes.SHIPPED]: 'deliver',
  [LogisticsNodeTypes.CANCELED]: '',
  [LogisticsNodeTypes.RECEIVED]: 'check',
  [LogisticsNodeTypes.ADDRESS_CHANGED]: '',
  [LogisticsNodeTypes.IN_TRANSIT]: 'yunshuzhong',
};
