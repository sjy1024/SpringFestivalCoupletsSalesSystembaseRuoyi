import { fetchUserCenter, getDefaultUserCenterPayload } from '../../services/usercenter/fetchUsercenter';
import Toast from 'tdesign-miniprogram/toast/index';
import { OrderStatus } from '../../utils/orderConfig';

const menuData = [
  [
    {
      title: 'AI 春联助手',
      tit: '智能生成',
      url: '',
      type: 'ai-assistant',
    },
    {
      title: '收货地址',
      tit: '',
      url: '',
      type: 'address',
    },
    {
      title: '积分',
      tit: '',
      url: '',
      type: 'point',
    },
  ],
  [
    {
      title: '帮助中心',
      tit: '',
      url: '',
      type: 'help-center',
    },
    {
      title: '客服热线',
      tit: '',
      url: '',
      type: 'service',
      icon: 'service',
    },
  ],
];

const orderTagInfos = [
  {
    title: '待付款',
    iconName: 'wallet',
    orderNum: 0,
    tabType: OrderStatus.PENDING_PAYMENT,
    status: 1,
  },
  {
    title: '已支付',
    iconName: 'shop',
    orderNum: 0,
    tabType: OrderStatus.PAID,
    status: 1,
  },
  {
    title: '制作中',
    iconName: 'tools',
    orderNum: 0,
    tabType: OrderStatus.IN_PRODUCTION,
    status: 1,
  },
  {
    title: '已收货',
    iconName: 'check-circle',
    orderNum: 0,
    tabType: OrderStatus.COMPLETED,
    status: 1,
  },
];

const getDefaultData = () => ({
  showMakePhone: false,
  userInfo: {
    avatarUrl: '',
    nickName: '春联用户',
    phoneNumber: '',
  },
  menuData: menuData.map((row) => row.map((item) => ({ ...item }))),
  orderTagInfos: orderTagInfos.map((item) => ({ ...item })),
  customerServiceInfo: {
    servicePhone: '13650638839',
    serviceTimeDuration: '9:00-18:00',
  },
  currAuthStep: 2,
  showKefu: true,
  versionNo: '',
});

Page({
  data: getDefaultData(),

  onLoad() {
    this.getVersionInfo();
  },

  onShow() {
    this.getTabBar?.()?.init?.();
    this.init();
  },
  onPullDownRefresh() {
    this.init();
  },

  init() {
    this.fetUseriInfoHandle();
  },

  applyUserCenterData(payload) {
    const { userInfo, countsData, orderTagInfos: orderInfo, customerServiceInfo } = payload;
    const nextMenuData = menuData.map((row) =>
      row.map((item) => {
        const nextItem = { ...item };
        (countsData || []).forEach((counts) => {
          if (counts.type === nextItem.type) {
            nextItem.tit = counts.num;
          }
        });
        return nextItem;
      })
    );
    const info = orderTagInfos.map((v, index) => ({
      ...v,
      ...(orderInfo[index] || {}),
    }));
    this.setData({
      userInfo,
      menuData: nextMenuData,
      orderTagInfos: info,
      customerServiceInfo,
      currAuthStep: 2,
    });
  },

  fetUseriInfoHandle() {
    fetchUserCenter()
      .then((payload) => {
        this.applyUserCenterData(payload);
        wx.stopPullDownRefresh();
      })
      .catch((error) => {
        console.error('个人中心加载失败:', error);
        this.applyUserCenterData(getDefaultUserCenterPayload());
        wx.stopPullDownRefresh();
      });
  },

  onClickCell({ currentTarget }) {
    const { type } = currentTarget.dataset;

    switch (type) {
      case 'ai-assistant': {
        wx.navigateTo({ url: '/pages/APP-ai-chat/index' });
        break;
      }
      case 'address': {
        wx.navigateTo({ url: '/pages/user/address/list/index' });
        break;
      }
      case 'service': {
        this.openMakePhone();
        break;
      }
      case 'help-center': {
        Toast({
          context: this,
          selector: '#t-toast',
          message: '你点击了帮助中心',
          icon: '',
          duration: 1000,
        });
        break;
      }
      case 'point': {
        Toast({
          context: this,
          selector: '#t-toast',
          message: '你点击了积分菜单',
          icon: '',
          duration: 1000,
        });
        break;
      }
      default: {
        Toast({
          context: this,
          selector: '#t-toast',
          message: '未知跳转',
          icon: '',
          duration: 1000,
        });
        break;
      }
    }
  },

  jumpNav(e) {
    const status = e.detail.tabType;
    wx.navigateTo({ url: `/pages/order/order-list/index?status=${status}` });
  },

  jumpAllOrder() {
    wx.navigateTo({ url: '/pages/order/order-list/index' });
  },

  openMakePhone() {
    this.setData({ showMakePhone: true });
  },

  closeMakePhone() {
    this.setData({ showMakePhone: false });
  },

  call() {
    wx.makePhoneCall({
      phoneNumber: this.data.customerServiceInfo.servicePhone,
    });
  },

  gotoUserEditPage() {
    const { currAuthStep } = this.data;
    if (currAuthStep === 2) {
      wx.navigateTo({ url: '/pages/user/person-info/index' });
    } else {
      this.fetUseriInfoHandle();
    }
  },

  getVersionInfo() {
    try {
      const versionInfo = wx.getAccountInfoSync();
      const { version, envVersion } = versionInfo.miniProgram;
      this.setData({
        versionNo: envVersion === 'release' ? (version || '') : (envVersion || ''),
      });
    } catch (error) {
      console.warn('获取版本信息失败:', error);
    }
  },
});
