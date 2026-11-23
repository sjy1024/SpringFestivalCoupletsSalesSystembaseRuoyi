import { marked } from 'marked'

const renderer = new marked.Renderer()

// marked 4.x 表格 token 结构
renderer.table = function(token) {
  const headerCells = (token.header || [])
    .map(cell => `<th>${cell.text || ''}</th>`)
    .join('')
  const bodyRows = (token.rows || [])
    .map(row => `<tr>${row.map(cell => `<td>${cell.text || ''}</td>`).join('')}</tr>`)
    .join('')
  return `<div class="md-table-wrap"><table class="md-table"><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table></div>`
}

marked.use({
  renderer,
  gfm: true,
  breaks: true,
  headerIds: false,
  mangle: false
})

/**
 * 将 Markdown 文本转为 HTML（AI 助手消息展示）
 * @param {string} text
 * @returns {string}
 */
export function renderMarkdown(text) {
  if (!text) return ''
  try {
    return marked.parse(String(text))
  } catch (e) {
    console.warn('[markdown] parse failed:', e)
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>')
  }
}
