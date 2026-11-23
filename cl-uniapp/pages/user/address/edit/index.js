import Toast from 'tdesign-miniprogram/toast/index';
import { fetchDeliveryAddress, addDeliveryAddress, updateDeliveryAddress } from '../../../../services/address/fetchAddress';
import { areaData } from '../../../../config/areaData';
import { resolveAddress, rejectAddress } from '../../../../services/address/edit';

const innerPhoneReg = '^1(?:3\\d|4[4-9]|5[0-35-9]|6[67]|7[0-8]|8\\d|9\\d)\\d{8}$';
const innerNameReg = '^[a-zA-Z\\d\\u4e00-\\u9fa5]+$';
const labelsOptions = [
  { id: 0, name: '家' },
  { id: 1, name: '公司' },
];

Page({
  options: {
    multipleSlots: true,
  },
  externalClasses: ['theme-wrapper-class'],
  data: {
    locationState: {
      labelIndex: null,
      addressId: '',
      addressTag: '',
      cityCode: '',
      cityName: '',
      detailAddress: '',
      districtCode: '',
      districtName: '',
      isDefault: 0,
      name: '',
      phone: '',
      provinceCode: '',
      provinceName: '',
      isEdit: false,
    },
    areaData: areaData,
    labels: labelsOptions,
    areaPickerVisible: false,
    submitActive: false,
    visible: false,
    labelValue: '',
    columns: 3,
  },
  privateData: {
    verifyTips: '',
  },
  
  onLoad(options) {
    const { id } = options;
    this.init(id);
  },

  onUnload() {
    if (!this.hasSaved) {
      rejectAddress();
    }
  },

  hasSaved: false,

  init(id) {
    if (id) {
      this.getAddressDetail(Number(id));
    }
  },
  
  getAddressDetail(id) {
    fetchDeliveryAddress(id).then((detail) => {
      const locationState = {
        ...detail,
        addressId: detail.addressId || detail.id,
        name: detail.receiverName || detail.name,
        phone: detail.receiverPhone || detail.phone,
        isEdit: true,
      };
      
      this.setData({ locationState }, () => {
        const { isLegal, tips } = this.onVerifyInputLegal();
        this.setData({
          submitActive: isLegal,
        });
        this.privateData.verifyTips = tips;
      });
    }).catch((err) => {
      console.error('获取地址详情失败:', err);
      Toast({
        context: this,
        selector: '#t-toast',
        message: '获取地址详情失败',
        icon: 'error',
        duration: 2000,
      });
    });
  },
  
  onInputValue(e) {
    const { item } = e.currentTarget.dataset;
    if (item === 'address') {
      const { selectedOptions = [] } = e.detail;
      this.setData(
        {
          'locationState.provinceCode': selectedOptions[0]?.value || '',
          'locationState.provinceName': selectedOptions[0]?.label || '',
          'locationState.cityName': selectedOptions[1]?.label || '',
          'locationState.cityCode': selectedOptions[1]?.value || '',
          'locationState.districtCode': selectedOptions[2]?.value || '',
          'locationState.districtName': selectedOptions[2]?.label || '',
          areaPickerVisible: false,
        },
        () => {
          const { isLegal, tips } = this.onVerifyInputLegal();
          this.setData({
            submitActive: isLegal,
          });
          this.privateData.verifyTips = tips;
        },
      );
    } else {
      const { value = '' } = e.detail;
      this.setData(
        {
          [`locationState.${item}`]: value,
        },
        () => {
          const { isLegal, tips } = this.onVerifyInputLegal();
          this.setData({
            submitActive: isLegal,
          });
          this.privateData.verifyTips = tips;
        },
      );
    }
  },
  
  onPickArea() {
    this.setData({ areaPickerVisible: true });
  },
  
  onPickLabels(e) {
    const { item } = e.currentTarget.dataset;
    const {
      locationState: { labelIndex = undefined },
      labels = [],
    } = this.data;
    let payload = {
      labelIndex: item,
      addressTag: labels[item].name,
    };
    if (item === labelIndex) {
      payload = { labelIndex: null, addressTag: '' };
    }
    this.setData({
      'locationState.labelIndex': payload.labelIndex,
      'locationState.addressTag': payload.addressTag,
    });
  },
  
  addLabels() {
    this.setData({
      visible: true,
    });
  },
  
  confirmHandle() {
    const { labels, labelValue } = this.data;
    this.setData({
      visible: false,
      labels: [...labels, { id: labels[labels.length - 1].id + 1, name: labelValue }],
      labelValue: '',
    });
  },
  
  cancelHandle() {
    this.setData({
      visible: false,
      labelValue: '',
    });
  },
  
  onCheckDefaultAddress({ detail }) {
    const { value } = detail;
    this.setData({
      'locationState.isDefault': value ? 1 : 0,
    });
  },

  onVerifyInputLegal() {
    const { name, phone, detailAddress, districtName } = this.data.locationState;
    const phoneRegExp = new RegExp(innerPhoneReg);
    const nameRegExp = new RegExp(innerNameReg);

    if (!name || !name.trim()) {
      return {
        isLegal: false,
        tips: '请填写收货人',
      };
    }
    if (!nameRegExp.test(name)) {
      return {
        isLegal: false,
        tips: '收货人仅支持输入中文、英文、数字',
      };
    }
    if (!phone || !phone.trim()) {
      return {
        isLegal: false,
        tips: '请填写手机号',
      };
    }
    if (!phoneRegExp.test(phone)) {
      return {
        isLegal: false,
        tips: '请填写正确的手机号',
      };
    }
    if (!districtName || !districtName.trim()) {
      return {
        isLegal: false,
        tips: '请选择省市区信息',
      };
    }
    if (!detailAddress || !detailAddress.trim()) {
      return {
        isLegal: false,
        tips: '请完善详细地址',
      };
    }
    if (detailAddress && detailAddress.trim().length > 50) {
      return {
        isLegal: false,
        tips: '详细地址不能超过50个字符',
      };
    }
    return {
      isLegal: true,
      tips: '添加成功',
    };
  },

  formSubmit() {
    const { submitActive } = this.data;
    if (!submitActive) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: this.privateData.verifyTips,
        icon: 'error',
        duration: 2000,
      });
      return;
    }
    
    const { locationState } = this.data;
    
    // 构建提交数据
    const addressData = {
      addressId: locationState.addressId,
      receiverName: locationState.name,
      receiverPhone: locationState.phone,
      provinceCode: locationState.provinceCode,
      provinceName: locationState.provinceName,
      cityCode: locationState.cityCode,
      cityName: locationState.cityName,
      districtCode: locationState.districtCode,
      districtName: locationState.districtName,
      detailAddress: locationState.detailAddress,
      addressTag: locationState.addressTag || '',
      isDefault: locationState.isDefault || 0,
      latitude: locationState.latitude || '',
      longitude: locationState.longitude || '',
    };

    this.hasSaved = true;

    // 判断是新增还是修改
    const apiCall = locationState.isEdit ? updateDeliveryAddress(addressData) : addDeliveryAddress(addressData);
    
    apiCall.then((result) => {
      Toast({
        context: this,
        selector: '#t-toast',
        message: locationState.isEdit ? '修改成功' : '添加成功',
        theme: 'success',
        duration: 1500,
      });
      
      // 通知地址列表页刷新
      resolveAddress({
        ...addressData,
        id: result.addressId || addressData.addressId,
        phoneNumber: addressData.receiverPhone,
        phone: addressData.receiverPhone,
        name: addressData.receiverName,
        address: `${addressData.provinceName}${addressData.cityName}${addressData.districtName}${addressData.detailAddress}`,
        tag: addressData.addressTag,
      });
      
      setTimeout(() => {
        wx.navigateBack({ delta: 1 });
      }, 1500);
    }).catch((err) => {
      console.error('保存地址失败:', err);
      this.hasSaved = false;
      Toast({
        context: this,
        selector: '#t-toast',
        message: err.message || '保存失败，请重试',
        icon: 'error',
        duration: 2000,
      });
    });
  },
});
