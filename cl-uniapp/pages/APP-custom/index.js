// 定制页面逻辑
import { getCustomTypes, getSizeOptions, calculatePrice, submitCustomPlan } from '../../services/custom/custom';
import { mockPay } from '../../services/app/order';
import { generateCouplet, fetchAiHealth, getRecommendTopics } from '../../services/ai/ai';
import { applyPendingCustomBridge } from '../../utils/customBridge';

Page({
  data: {
    customTypes: [
      { id: 1, name: '春联', image: '/static/images/custom/spring-couplet.jpg' },
      { id: 2, name: '福字', image: '/static/images/custom/fu.jpg' },
      { id: 3, name: '横批', image: '/static/images/custom/horizontal.jpg' }
    ],
    sizeOptions: [
      { id: 1, name: '1.2米', price: 38 },
      { id: 2, name: '1.5米', price: 48 },
      { id: 3, name: '1.8米', price: 58 },
      { id: 4, name: '2.1米', price: 68 }
    ],
    paperOptions: [
      { id: 1, name: '丹色', price: 0, color: '#c41e3a' },
      { id: 2, name: '纯红色', price: 0, color: '#e60012' },
      { id: 3, name: '点金红色', price: 5, color: '#d4af37' }
    ],
    selectedOptions: {
      type: 1,
      size: 1,
      paper: 1,
      shanglian: '',
      xialian: '',
      hengpi: '',
      remark: ''
    },
    price: 38,
    priceDisplay: '38.00',
    loading: false,
    error: '',
    boundOrderId: null,
    boundOrderNo: '',
    llmOnline: false,
    aiGenerating: false,
    aiThemes: ['生意兴隆', '万事如意', '阖家欢乐', '四季平安', '财源广进']
  },

  onLoad() {
    this.loadCustomData();
    this.loadAiThemes();
  },

  onShow() {
    this.getTabBar?.()?.init?.();
    applyPendingCustomBridge(this);
    this.refreshAiHealth();
    this.updatePriceDisplay();
  },

  updatePriceDisplay() {
    const p = Number(this.data.price) || 0;
    this.setData({
      priceDisplay: p.toFixed(2)
    });
  },

  refreshAiHealth() {
    fetchAiHealth()
      .then((h) => {
        this.setData({
          llmOnline: !!(h && h.llmOnline)
        });
      })
      .catch(() => {
        this.setData({ llmOnline: false });
      });
  },

  loadAiThemes() {
    getRecommendTopics()
      .then((res) => {
        if (res && res.topics && res.topics.length) {
          this.setData({ aiThemes: res.topics.slice(0, 6) });
        }
      })
      .catch(() => {});
  },

  loadCustomData() {
    Promise.all([getCustomTypes(), getSizeOptions()])
      .then(([types, sizes]) => {
        if (types && types.length > 0) {
          this.setData({ customTypes: types });
        }
        if (sizes && sizes.length > 0) {
          this.setData({ sizeOptions: sizes });
        }
      })
      .catch((err) => {
        console.error('加载定制数据失败:', err);
      });
  },

  selectCustomType(e) {
    this.setData({ 'selectedOptions.type': parseInt(e.currentTarget.dataset.id, 10) });
    this.calculatePrice();
  },

  selectSize(e) {
    this.setData({ 'selectedOptions.size': parseInt(e.currentTarget.dataset.id, 10) });
    this.calculatePrice();
  },

  selectPaper(e) {
    this.setData({ 'selectedOptions.paper': parseInt(e.currentTarget.dataset.id, 10) });
    this.calculatePrice();
  },

  inputRemark(e) {
    const remark = e.detail.value;
    this.setData({
      'selectedOptions.remark': remark
    });
  },

  inputShanglian(e) {
    this.setData({ 'selectedOptions.shanglian': e.detail.value });
  },

  inputXialian(e) {
    this.setData({ 'selectedOptions.xialian': e.detail.value });
  },

  inputHengpi(e) {
    this.setData({ 'selectedOptions.hengpi': e.detail.value });
  },

  applyCoupletToForm(payload) {
    if (!payload) return;
    this.setData({
      'selectedOptions.shanglian': payload.shanglian || '',
      'selectedOptions.xialian': payload.xialian || '',
      'selectedOptions.hengpi': payload.hengpi || '',
      error: ''
    });
  },

  onThemeGenerate(e) {
    if (this.data.aiGenerating) return;
    const theme = e.currentTarget.dataset.theme;
    if (theme) {
      this.runGenerateCouplet(theme);
    }
  },

  promptGenerateCouplet() {
    if (this.data.aiGenerating) return;
    wx.showModal({
      title: 'AI 生成春联',
      content: '输入主题关键词，AI 将自动生成上联、下联和横批',
      editable: true,
      placeholderText: '例如：生意兴隆、新春快乐',
      confirmText: '生成',
      success: (res) => {
        if (res.confirm) {
          const theme = (res.content || '').trim() || '万事如意';
          this.runGenerateCouplet(theme);
        }
      }
    });
  },

  runGenerateCouplet(theme) {
    this.setData({ aiGenerating: true, error: '' });
    generateCouplet({ theme })
      .then((data) => {
        const payload = data && (data.shanglian != null ? data : data.data);
        if (payload && payload.shanglian) {
          this.applyCoupletToForm({
            shanglian: payload.shanglian,
            xialian: payload.xialian,
            hengpi: payload.hengpi
          });
          wx.showToast({
            title: payload.usedLlm ? 'AI 已生成' : '已填充文案',
            icon: 'success'
          });
        } else {
          wx.showToast({ title: '生成失败，请重试', icon: 'none' });
        }
      })
      .catch((err) => {
        console.error('AI 生成春联失败:', err);
        wx.showToast({ title: '生成失败，请检查网络', icon: 'none' });
      })
      .finally(() => {
        this.setData({ aiGenerating: false });
      });
  },

  calculatePrice() {
    const { size, paper } = this.data.selectedOptions;
    const selectedSize = this.data.sizeOptions.find((item) => item.id === size);
    const selectedPaper = this.data.paperOptions.find((item) => item.id === paper);

    let totalPrice = 0;
    if (selectedSize) totalPrice += selectedSize.price;
    if (selectedPaper) totalPrice += selectedPaper.price;

    this.setData({ price: totalPrice });
    this.updatePriceDisplay();

    calculatePrice(this.data.selectedOptions)
      .then((res) => {
        const price = res && (res.price != null ? res.price : res.data && res.data.price);
        if (price != null) {
          this.setData({ price });
          this.updatePriceDisplay();
        }
      })
      .catch((err) => {
        console.error('计算价格失败:', err);
      });
  },

  validateForm() {
    const { shanglian, xialian, hengpi } = this.data.selectedOptions;
    if (!shanglian || !shanglian.trim()) {
      this.setData({ error: '请输入上联内容' });
      return false;
    }
    if (!xialian || !xialian.trim()) {
      this.setData({ error: '请输入下联内容' });
      return false;
    }
    if (!hengpi || !hengpi.trim()) {
      this.setData({ error: '请输入横批内容' });
      return false;
    }
    this.setData({ error: '' });
    return true;
  },

  payOrder() {
    if (!this.validateForm()) {
      wx.showToast({ title: this.data.error, icon: 'none' });
      return;
    }
    if (this.data.loading) return;

    wx.showModal({
      title: '模拟支付',
      content: `确认支付 ¥${this.data.priceDisplay}？`,
      success: (modalRes) => {
        if (!modalRes.confirm) return;
        this.submitAndPay();
      }
    });
  },

  submitAndPay() {
    this.setData({ loading: true });
    const customData = {
      ...this.data.selectedOptions,
      price: this.data.price
    };
    if (this.data.boundOrderId) {
      customData.orderId = this.data.boundOrderId;
    }

    submitCustomPlan(customData)
      .then(async (res) => {
        const payload = res && (res.queueNo != null ? res : res.data);
        if (!payload || payload.queueNo == null) {
          wx.showToast({ title: (res && res.msg) || '提交失败', icon: 'none' });
          return;
        }

        const orderId = payload.orderId;
        if (orderId) {
          try {
            await mockPay(orderId);
          } catch (error) {
            const msg = (error && error.message) || '';
            if (!msg.includes('状态异常')) {
              wx.showToast({ title: msg || '支付失败', icon: 'none' });
              return;
            }
          }
        }

        wx.showModal({
          title: '支付成功',
          content: `排队号：${payload.queueNo}\n预计完成：约 ${payload.estimatedTime} 分钟`,
          showCancel: false,
          success: () => {
            if (orderId) {
              wx.navigateTo({
                url: `/pages/order/detail/index?orderId=${orderId}`,
                fail: () => wx.navigateTo({ url: '/pages/order/order-list/index' })
              });
            } else {
              wx.navigateTo({
                url: '/pages/order/order-list/index',
                fail: () => wx.switchTab({ url: '/pages/usercenter/index' })
              });
            }
          }
        });
      })
      .catch(() => {
        wx.showToast({ title: '网络错误，请稍后重试', icon: 'none' });
      })
      .finally(() => {
        this.setData({ loading: false });
      });
  },

  navigateToAIChat() {
    wx.navigateTo({ url: '/pages/APP-ai-chat/index' });
  },

  resetForm() {
    if (this.data.loading) return;
    wx.showModal({
      title: '重置定制',
      content: '将清空已填写的春联内容与备注，规格恢复默认，是否继续？',
      confirmText: '重置',
      confirmColor: '#c41e3a',
      success: (res) => {
        if (!res.confirm) return;
        this.setData({
          selectedOptions: {
            type: 1,
            size: 1,
            paper: 1,
            shanglian: '',
            xialian: '',
            hengpi: '',
            remark: ''
          },
          error: '',
          aiGenerating: false
        });
        this.calculatePrice();
        wx.showToast({ title: '已重置', icon: 'success' });
      }
    });
  },

  clearOrderBinding() {
    this.setData({ boundOrderId: null, boundOrderNo: '' });
  }
});
