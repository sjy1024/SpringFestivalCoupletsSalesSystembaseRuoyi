/* eslint-disable no-param-reassign */
import { fetchDeliveryAddressList, deleteDeliveryAddress, setDefaultAddress } from '../../../../services/address/fetchAddress';
import Toast from 'tdesign-miniprogram/toast/index';
import { resolveAddress, rejectAddress } from '../../../../services/address/list';
import { getAddressPromise } from '../../../../services/address/edit';

Page({
  data: {
    addressList: [],
    deleteID: '',
    showDeleteConfirm: false,
    isOrderSure: false,
  },

  /** 选择模式 */
  selectMode: false,
  /** 是否已经选择地址，不置为true的话页面离开时会触发取消选择行为 */
  hasSelect: false,

  onLoad(query) {
    const { selectMode = '', isOrderSure = '', id = '' } = query;
    this.setData({
      isOrderSure: !!isOrderSure,
      id,
    });
    this.selectMode = !!selectMode;
    this.init();
  },

  init() {
    this.getAddressList();
  },
  
  onUnload() {
    if (this.selectMode && !this.hasSelect) {
      rejectAddress();
    }
  },
  
  onShow() {
    // 从编辑页返回时刷新列表
    this.getAddressList();
  },
  
  getAddressList() {
    const { id } = this.data;
    fetchDeliveryAddressList().then((addressList) => {
      addressList.forEach((address) => {
        if (address.id === id || address.addressId === id) {
          address.checked = true;
        }
      });
      this.setData({ addressList });
    }).catch((err) => {
      console.error('获取地址列表失败:', err);
      Toast({
        context: this,
        selector: '#t-toast',
        message: '获取地址列表失败',
        icon: 'error',
        duration: 2000,
      });
    });
  },
  
  getWXAddressHandle() {
    wx.chooseAddress({
      success: (res) => {
        if (res.errMsg.indexOf('ok') === -1) {
          Toast({
            context: this,
            selector: '#t-toast',
            message: res.errMsg,
            icon: '',
            duration: 1000,
          });
          return;
        }
        Toast({
          context: this,
          selector: '#t-toast',
          message: '添加成功',
          icon: '',
          duration: 1000,
        });
        const { length: len } = this.data.addressList;
        this.setData({
          [`addressList[${len}]`]: {
            name: res.userName,
            phoneNumber: res.telNumber,
            address: `${res.provinceName}${res.cityName}${res.countryName}${res.detailInfo}`,
            isDefault: 0,
            tag: '微信地址',
            id: len,
          },
        });
      },
    });
  },
  
  confirmDeleteHandle({ detail }) {
    const { id } = detail || {};
    if (id !== undefined) {
      this.setData({ deleteID: id, showDeleteConfirm: true });
    } else {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '删除失败',
        icon: 'error',
        duration: 1000,
      });
    }
  },
  
  deleteAddressHandle(e) {
    const { id } = e.currentTarget.dataset;
    
    // 调用删除接口
    deleteDeliveryAddress(id).then(() => {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '地址删除成功',
        theme: 'success',
        duration: 1000,
      });
      
      // 从列表中移除
      this.setData({
        addressList: this.data.addressList.filter((address) => address.id !== id && address.addressId !== id),
        deleteID: '',
        showDeleteConfirm: false,
      });
    }).catch((err) => {
      console.error('删除地址失败:', err);
      Toast({
        context: this,
        selector: '#t-toast',
        message: '删除失败',
        icon: 'error',
        duration: 1000,
      });
      this.setData({ showDeleteConfirm: false });
    });
  },
  
  editAddressHandle({ detail }) {
    this.waitForNewAddress();

    const { id } = detail || {};
    wx.navigateTo({ url: `/pages/user/address/edit/index?id=${id}` });
  },
  
  selectHandle({ detail }) {
    if (this.selectMode) {
      this.hasSelect = true;
      resolveAddress(detail);
      wx.navigateBack({ delta: 1 });
    } else {
      this.editAddressHandle({ detail });
    }
  },
  
  createHandle() {
    this.waitForNewAddress();
    wx.navigateTo({ url: '/pages/user/address/edit/index' });
  },

  waitForNewAddress() {
    getAddressPromise()
      .then((newAddress) => {
        // 刷新地址列表
        this.getAddressList();
      })
      .catch((e) => {
        if (e.message !== 'cancel') {
          Toast({
            context: this,
            selector: '#t-toast',
            message: '地址编辑发生错误',
            icon: 'error',
            duration: 1000,
          });
        }
      });
  },
});
