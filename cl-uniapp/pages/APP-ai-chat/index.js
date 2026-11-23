// AI对话页面逻辑
import {
  sendChatRequest,
  getRecommendTopics,
  fetchRecommendCouplets,
  generateCouplet,
  fetchAiHistory,
  clearAiServerHistory,
  fetchAiHealth,
  formatCoupletText,
  hasCoupletStructure
} from '../../services/ai/ai';
import { parseCoupletFromText, setAiCoupletPayload } from '../../utils/customBridge';
import { getDeviceId } from '../../utils/deviceId';
import { withAiDisplayHtml } from '../../utils/aiMessageFormat';

const WELCOME = [
  {
    type: 'system',
    content: '欢迎使用 AI 春联助手：对话咨询、一键生成春联、经典推荐，均可填入定制页下单。'
  },
  {
    type: 'ai',
    content: '您好！可点下方主题「一键生成」，或输入问题与我对话。'
  }
];

function buildAiMessage(content, usedLlm, coupletData) {
  const msg = {
    type: 'ai',
    content,
    time: formatTime(new Date()),
    usedLlm: !!usedLlm,
    canApplyCustom: hasCoupletStructure(content, coupletData)
  };
  if (coupletData) {
    msg.coupletData = coupletData;
  }
  return withAiDisplayHtml(msg);
}

function formatTime(date) {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

Page({
  data: {
    messages: [],
    inputMessage: '',
    recommendTopics: ['生意兴隆', '万事如意', '阖家欢乐', '四季平安', '财源广进', '吉星高照'],
    recommendCouplets: [],
    quickReplies: ['一键生成春联', '定制流程说明', '价格与尺寸'],
    loading: false,
    error: '',
    deviceId: '',
    sessionId: '',
    llmOnline: false,
    appAiUseLlm: false,
    scrollIntoView: '',
    historyLoaded: false
  },

  onLoad() {
    const deviceId = getDeviceId();
    const t = formatTime(new Date());
    this.setData({
      deviceId,
      messages: [
        { type: 'system', content: WELCOME[0].content, time: t },
        buildAiMessage(WELCOME[1].content, false)
      ]
    });
    this.refreshAiHealth();
    this.loadRecommendTopics();
    this.loadRecommendCouplets();
    this.loadHistorySilently();
  },

  onShow() {
    this.refreshAiHealth();
  },

  refreshAiHealth() {
    fetchAiHealth()
      .then((h) => {
        const online = !!(h && h.llmOnline);
        const useLlm = !!(h && h.appAiUseLlm);
        this.setData({ llmOnline: online, appAiUseLlm: useLlm });
      })
      .catch(() => {
        this.setData({ llmOnline: false, appAiUseLlm: false });
      });
  },

  loadRecommendTopics() {
    getRecommendTopics()
      .then((res) => {
        if (res && res.topics && res.topics.length > 0) {
          this.setData({ recommendTopics: res.topics });
        }
      })
      .catch((err) => {
        console.error('加载推荐主题失败:', err);
      });
  },

  loadRecommendCouplets() {
    fetchRecommendCouplets()
      .then((list) => {
        if (Array.isArray(list) && list.length > 0) {
          this.setData({ recommendCouplets: list.slice(0, 6) });
        }
      })
      .catch((err) => {
        console.error('加载经典春联失败:', err);
      });
  },

  mapHistoryList(list) {
    return list.map((r) => {
      const content = r.content || r.message || '';
      const time = r.createTime || this.formatTs(r.timestamp);
      const isAi = r.sender === 'ai' || r.role === 'assistant';
      if (isAi) {
        return buildAiMessage(content, r.usedLlm, parseCoupletFromText(content) || undefined);
      }
      return {
        type: 'user',
        content,
        time
      };
    });
  },

  /** 进入页面自动拉取最近对话（无记录则保留欢迎语） */
  loadHistorySilently() {
    const { deviceId, historyLoaded } = this.data;
    if (!deviceId || historyLoaded) {
      return;
    }
    fetchAiHistory(deviceId, { limit: 50 })
      .then((res) => {
        const list = (res && res.list) || [];
        if (!list.length) {
          this.setData({ historyLoaded: true });
          return;
        }
        const head = [{ type: 'system', content: WELCOME[0].content, time: formatTime(new Date()) }];
        this.setData({
          messages: [...head, ...this.mapHistoryList(list)],
          historyLoaded: true
        });
        this.scrollToBottom();
      })
      .catch(() => {
        this.setData({ historyLoaded: true });
      });
  },

  syncHistoryFromServer() {
    const { deviceId } = this.data;
    if (!deviceId) {
      return;
    }
    wx.showLoading({ title: '加载历史...', mask: true });
    const params = { limit: 80 };
    if (this.data.sessionId) {
      params.sessionId = this.data.sessionId;
    }
    fetchAiHistory(deviceId, params)
      .then((res) => {
        const list = (res && res.list) || [];
        if (!list.length) {
          wx.showToast({ title: '暂无服务端记录', icon: 'none' });
          return;
        }
        const head = [{ type: 'system', content: WELCOME[0].content, time: formatTime(new Date()) }];
        this.setData({
          messages: [...head, ...this.mapHistoryList(list)],
          historyLoaded: true
        });
        wx.showToast({ title: '历史已加载', icon: 'success' });
        this.scrollToBottom();
      })
      .catch((e) => {
        console.error(e);
        wx.showToast({ title: '加载失败', icon: 'none' });
      })
      .finally(() => {
        wx.hideLoading();
      });
  },

  formatTs(ts) {
    if (!ts) {
      return '';
    }
    const d = new Date(Number(ts));
    if (Number.isNaN(d.getTime())) {
      return '';
    }
    return formatTime(d);
  },

  newConversation() {
    const t = formatTime(new Date());
    this.setData({
      sessionId: '',
      historyLoaded: false,
      messages: [
        { type: 'system', content: WELCOME[0].content, time: t },
        buildAiMessage(WELCOME[1].content, false)
      ]
    });
    wx.showToast({ title: '已开始新对话', icon: 'none' });
  },

  clearServerAndLocal() {
    const { deviceId } = this.data;
    wx.showModal({
      title: '清空云端记录',
      content: '将删除本机设备在服务器上的全部小程序 AI 聊天记录，是否继续？',
      success: (r) => {
        if (!r.confirm) {
          return;
        }
        clearAiServerHistory(deviceId)
          .then(() => {
            wx.showToast({ title: '已清空', icon: 'success' });
            this.newConversation();
          })
          .catch(() => {
            wx.showToast({ title: '清空失败', icon: 'none' });
          });
      }
    });
  },

  sendMessage() {
    const message = this.data.inputMessage.trim();
    if (!message || this.data.loading) {
      return;
    }

    if (message === '一键生成春联' || message.includes('一键生成')) {
      this.setData({ inputMessage: '' });
      this.generateCoupletForTheme('万事如意', { showUserMsg: true });
      return;
    }

    const userMessage = {
      type: 'user',
      content: message,
      time: formatTime(new Date())
    };

    this.setData({
      messages: [...this.data.messages, userMessage],
      inputMessage: '',
      loading: true,
      error: ''
    });
    this.scrollToBottom();

    sendChatRequest({
      message,
      deviceId: this.data.deviceId,
      sessionId: this.data.sessionId || undefined
    })
      .then((res) => {
        const text = (res && (res.reply || res.content)) || '';
        const sid = res && res.sessionId;
        if (sid) {
          this.setData({ sessionId: sid });
        }
        const parsed = parseCoupletFromText(text);
        const aiMessage = buildAiMessage(
          text || this.buildLocalChatFallback(message),
          res && res.usedLlm,
          parsed || undefined
        );
        this.setData({
          messages: [...this.data.messages, aiMessage],
          loading: false
        });
        this.scrollToBottom();
      })
      .catch((err) => {
        console.error('AI回复失败:', err);
        const fallback = this.buildLocalChatFallback(message);
        const aiMessage = buildAiMessage(`网络异常，已使用本地提示：\n${fallback}`, false);
        this.setData({
          messages: [...this.data.messages, aiMessage],
          loading: false
        });
        this.scrollToBottom();
      });
  },

  /** 专用春联生成接口，格式稳定，便于填入定制页 */
  generateCoupletForTheme(theme, options = {}) {
    const themeText = (theme || '万事如意').trim();
    if (this.data.loading) {
      return;
    }

    const showUserMsg = options.showUserMsg !== false;
    const userContent = options.userContent || `请帮我生成「${themeText}」主题的春联`;
    let messages = this.data.messages;

    if (showUserMsg) {
      messages = [
        ...messages,
        { type: 'user', content: userContent, time: formatTime(new Date()) }
      ];
      this.setData({ messages, loading: true, inputMessage: '' });
    } else {
      this.setData({ loading: true });
    }
    this.scrollToBottom();

    generateCouplet({ theme: themeText, keyword: themeText })
      .then((res) => {
        const shanglian = (res && res.shanglian) || '';
        const xialian = (res && res.xialian) || '';
        const hengpi = (res && res.hengpi) || '';
        const coupletData = { shanglian, xialian, hengpi };
        const content = formatCoupletText(shanglian, xialian, hengpi, themeText);
        const aiMessage = buildAiMessage(content, res && res.usedLlm, coupletData);
        this.setData({
          messages: [...this.data.messages, aiMessage],
          loading: false
        });
        this.scrollToBottom();
      })
      .catch((err) => {
        console.error('generateCouplet 失败:', err);
        const fallback = this.buildLocalCoupletFallback(themeText);
        const parsed = parseCoupletFromText(fallback);
        const aiMessage = buildAiMessage(
          `生成服务暂不可用，已使用本地模板：\n${fallback}`,
          false,
          parsed || undefined
        );
        this.setData({
          messages: [...this.data.messages, aiMessage],
          loading: false
        });
        this.scrollToBottom();
      });
  },

  /** 展示经典推荐春联（不调大模型） */
  applyClassicCouplet(e) {
    const index = e.currentTarget.dataset.index;
    const item = this.data.recommendCouplets[index];
    if (!item) {
      return;
    }
    const coupletData = {
      shanglian: item.shanglian || '',
      xialian: item.xialian || '',
      hengpi: item.hengpi || ''
    };
    const content = formatCoupletText(coupletData.shanglian, coupletData.xialian, coupletData.hengpi, item.title);
    const userMessage = {
      type: 'user',
      content: `我想看看「${item.title || '经典春联'}」`,
      time: formatTime(new Date())
    };
    const aiMessage = buildAiMessage(
      `${content}${item.description ? `\n\n${item.description}` : ''}`,
      false,
      coupletData
    );
    this.setData({
      messages: [...this.data.messages, userMessage, aiMessage]
    });
    this.scrollToBottom();
  },

  inputMessage(e) {
    this.setData({ inputMessage: e.detail.value });
  },

  selectTopic(e) {
    const topic = e.currentTarget.dataset.topic;
    this.generateCoupletForTheme(topic);
  },

  selectQuickReply(e) {
    const reply = e.currentTarget.dataset.reply;
    if (reply === '一键生成春联') {
      this.generateCoupletForTheme('万事如意');
      return;
    }
    if (reply.includes('定制')) {
      this.setData({ inputMessage: '春联定制流程是怎样的？' });
      return;
    }
    if (reply.includes('价格')) {
      this.setData({ inputMessage: '春联定制的价格和尺寸有哪些？' });
      return;
    }
    this.setData({ inputMessage: reply });
  },

  buildLocalCoupletFallback(theme) {
    if (theme.includes('生意') || theme.includes('兴隆')) {
      return formatCoupletText('生意兴隆通四海', '财源茂盛达三江', '吉星高照', theme);
    }
    if (theme.includes('阖家') || theme.includes('幸福') || theme.includes('家庭')) {
      return formatCoupletText('阖家欢乐迎新春', '万事如意贺新年', '幸福安康', theme);
    }
    return formatCoupletText('一帆风顺年年好', '万事如意步步高', '吉星高照', theme);
  },

  buildLocalChatFallback(message) {
    if (message.includes('定制') && message.includes('流程')) {
      return '定制流程：① 在「定制」Tab 选类型与尺寸；② 填写上联/下联/横批（可用 AI 一键填入）；③ 确认报价后提交。也可从 AI 页点「填入定制页」带字跳转。';
    }
    if (message.includes('价格') || message.includes('尺寸')) {
      return '常见尺寸约 1.2～2.1 米，价格随尺寸与联纸材质浮动。请在「定制」页选择规格后查看实时报价。';
    }
    const parsed = this.buildLocalCoupletFallback(
      message.includes('生意') ? '生意兴隆' : '万事如意'
    );
    return parsed;
  },

  scrollToBottom() {
    wx.nextTick(() => {
      this.setData({ scrollIntoView: 'ai-bottom-anchor' });
    });
  },

  extractCoupletFromMessage(msg) {
    if (!msg) {
      return null;
    }
    if (msg.coupletData && msg.coupletData.shanglian && msg.coupletData.xialian && msg.coupletData.hengpi) {
      return msg.coupletData;
    }
    return parseCoupletFromText(msg.content || '');
  },

  applyCoupletFromMessage(e) {
    const index = e.currentTarget.dataset.index;
    const msg = this.data.messages[index];
    const parsed = this.extractCoupletFromMessage(msg);
    if (!parsed) {
      wx.showToast({
        title: '该条消息无法识别春联格式',
        icon: 'none'
      });
      return;
    }
    setAiCoupletPayload(parsed);
    wx.switchTab({ url: '/pages/APP-custom/index' });
  },

  applyLastAiCoupletToCustom() {
    const msgs = this.data.messages || [];
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].type === 'ai') {
        const parsed = this.extractCoupletFromMessage(msgs[i]);
        if (parsed) {
          setAiCoupletPayload(parsed);
          wx.switchTab({ url: '/pages/APP-custom/index' });
          return;
        }
      }
    }
    wx.showToast({
      title: '未找到可填入的春联，请先一键生成或对话生成',
      icon: 'none',
      duration: 2800
    });
  }
});
