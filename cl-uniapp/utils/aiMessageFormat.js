/**
 * 将 AI 回复中的常见 Markdown 转为 rich-text 可渲染的 HTML
 */

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * @param {string} text 原始 AI 文本
 * @returns {string} rich-text nodes（HTML 字符串）
 */
export function markdownToHtml(text) {
  if (!text) {
    return '';
  }

  let html = escapeHtml(text);

  // 代码块
  html = html.replace(/```[\w-]*\n?([\s\S]*?)```/g, (_, code) => {
    const body = String(code).trim().replace(/\n/g, '<br/>');
    return `<div style="margin:8rpx 0;padding:12rpx 16rpx;background:#f5f5f5;border-radius:8rpx;font-size:24rpx;line-height:1.5;white-space:pre-wrap;">${body}</div>`;
  });

  // 行内代码
  html = html.replace(/`([^`\n]+)`/g, '<span style="background:#f0f0f0;padding:2rpx 8rpx;border-radius:6rpx;font-size:24rpx;">$1</span>');

  // 标题
  html = html.replace(/^#### (.+)$/gm, '<div style="font-weight:600;margin:10rpx 0 4rpx;">$1</div>');
  html = html.replace(/^### (.+)$/gm, '<div style="font-weight:600;margin:12rpx 0 6rpx;">$1</div>');
  html = html.replace(/^## (.+)$/gm, '<div style="font-weight:600;font-size:30rpx;margin:14rpx 0 8rpx;">$1</div>');
  html = html.replace(/^# (.+)$/gm, '<div style="font-weight:700;font-size:32rpx;margin:16rpx 0 10rpx;">$1</div>');

  // 粗体 / 斜体
  html = html.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__([^_\n]+)__/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');

  // 无序列表
  html = html.replace(/^[\-*] (.+)$/gm, '<div style="padding-left:8rpx;margin:4rpx 0;line-height:1.55;">• $1</div>');

  // 有序列表（保留序号）
  html = html.replace(/^(\d+)\. (.+)$/gm, '<div style="padding-left:8rpx;margin:4rpx 0;line-height:1.55;">$1. $2</div>');

  // 换行
  html = html.replace(/\n/g, '<br/>');

  return html;
}

/**
 * 为 AI 消息附加 contentHtml 字段
 * @param {object} msg
 * @returns {object}
 */
export function withAiDisplayHtml(msg) {
  if (!msg || msg.type !== 'ai') {
    return msg;
  }
  const content = msg.content || '';
  return {
    ...msg,
    contentHtml: markdownToHtml(content)
  };
}
