// AI服务API
import { post, get, del } from '../_utils/request';

/**
 * 发送AI聊天请求（body 可带 deviceId、sessionId 与后端 cl_app_ai_chat 对齐）
 * @param {Object} data - { message, deviceId?, sessionId? }
 */
export function sendChatRequest(data) {
  return post('/api/ai/chat', data, { showLoading: false });
}

/**
 * 拉取服务端历史（需 deviceId；可选 sessionId 只拉当前会话）
 */
export function fetchAiHistory(deviceId, params = {}) {
  return get('/api/ai/history', { deviceId, ...params }, { showLoading: false });
}

/** 清空该设备在服务端的小程序 AI 记录 */
export function clearAiServerHistory(deviceId) {
  const q = encodeURIComponent(deviceId || '');
  return del(`/api/ai/history?deviceId=${q}`, {}, { showLoading: true });
}

/** LM 是否在线、是否启用 use-llm */
export function fetchAiHealth() {
  return get('/api/ai/health', {}, { showLoading: false });
}

/**
 * 生成春联内容
 * @param {Object} data - 生成请求数据
 * @returns {Promise} - 返回Promise对象
 */
export function generateCouplet(data) {
  return post('/api/ai/generate-couplet', data, { showLoading: false });
}

/**
 * 获取推荐主题
 * @returns {Promise} - 返回Promise对象
 */
export function getRecommendTopics() {
  return post('/api/ai/recommend-topics', {}, { showLoading: false });
}

/** 经典春联推荐列表 */
export function fetchRecommendCouplets() {
  return get('/api/ai/recommend', {}, { showLoading: false });
}

/** 格式化为可展示、可解析的春联文本 */
export function formatCoupletText(shanglian, xialian, hengpi, title) {
  const head = title ? `【${title}】\n\n` : '';
  return `${head}上联：${shanglian || ''}\n下联：${xialian || ''}\n横批：${hengpi || ''}`;
}

/** 判断文本是否含可填入定制的春联结构 */
export function hasCoupletStructure(text, coupletData) {
  if (coupletData && coupletData.shanglian && coupletData.xialian && coupletData.hengpi) {
    return true;
  }
  if (!text || typeof text !== 'string') {
    return false;
  }
  return /上联\s*[：:]/.test(text) && /下联\s*[：:]/.test(text) && /横批\s*[：:]/.test(text);
}
