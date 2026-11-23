<template>
  <div class="assistant-container">
    <!-- 头部 -->
    <div class="assistant-header">
      <div class="header-content">
        <div class="header-left">
          <i class="el-icon-chat-dot-round"></i>
          <div class="header-text">
            <h2>智能助手</h2>
            <p>AI 驱动的智能管理助手，自动读取数据库中的订单、商品、库存数据</p>
          </div>
        </div>
        <div class="header-right">
          <el-button
            type="warning"
            icon="el-icon-time"
            size="small"
            @click="showHistoryDialog = true"
            plain
          >
            对话历史
          </el-button>
          <el-tag :type="aiServiceOnline ? 'success' : 'danger'" effect="dark">
            <i :class="aiServiceOnline ? 'el-icon-check' : 'el-icon-close'"></i>
            {{ aiServiceOnline ? 'AI 服务在线' : 'AI 服务离线' }}
          </el-tag>
        </div>
      </div>
    </div>

    <!-- 主体内容 -->
    <div class="assistant-body">
      <!-- 左侧：对话区 -->
      <div class="chat-section">
        <el-card shadow="never" class="chat-card">
          <!-- 消息列表 -->
          <div class="messages-container" ref="messagesContainer">
            <div v-if="messages.length === 0" class="welcome-message">
              <div class="welcome-icon">
                <i class="el-icon-chat-dot-round"></i>
              </div>
              <h3>👋 您好！我是智能助手</h3>
              <p>我可以帮您：</p>
              <ul>
                <li>📊 基于真实订单/销售数据进行分析</li>
                <li>📦 查询库存预警并给出补货建议</li>
                <li>💡 结合热销商品数据优化运营</li>
                <li>❓ 回答任何与店铺数据相关的问题</li>
              </ul>
              <p class="tip">提问前会自动从数据库加载最新业务快照，请放心追问具体数字</p>
            </div>

            <div
              v-for="(msg, index) in messages"
              :key="index"
              :class="['message-item', msg.role === 'user' ? 'user-message' : 'ai-message']"
            >
              <div class="message-avatar">
                <i :class="msg.role === 'user' ? 'el-icon-user' : 'el-icon-chat-dot-round'"></i>
              </div>
              <div class="message-content">
                <div class="message-header">
                  <span class="message-role">{{ msg.role === 'user' ? '您' : 'AI 助手' }}</span>
                  <span class="message-time">{{ msg.time }}</span>
                </div>
                <div v-if="msg.dataLoaded" class="data-linked-badge">
                  <el-tag type="success" size="mini" effect="plain">
                    <i class="el-icon-connection"></i> 已联动数据库实时数据
                  </el-tag>
                </div>
                <div class="message-text markdown-body" v-html="formatMessage(msg.content)"></div>
                <div v-if="msg.loading" class="message-loading">
                  <i class="el-icon-loading"></i> AI 正在思考中...
                </div>
              </div>
            </div>
          </div>

          <!-- 输入区 -->
          <div class="input-section">
            <el-input
              v-model="inputMessage"
              type="textarea"
              :rows="3"
              placeholder="输入您的问题... (Shift+Enter 换行，Enter 发送)"
              @keydown.enter.exact.prevent="sendMessage"
              :disabled="sending"
            ></el-input>
            <div class="input-actions">
              <el-button
                type="primary"
                icon="el-icon-s-promotion"
                @click="sendMessage"
                :loading="sending"
                :disabled="!inputMessage.trim()"
              >
                {{ sending ? '发送中...' : '发送' }}
              </el-button>
              <el-button icon="el-icon-delete" @click="clearChat">清空对话</el-button>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 右侧：快捷功能 -->
      <div class="quick-section">
        <!-- 快捷提问 -->
        <el-card shadow="never" class="quick-card">
          <div slot="header" class="card-header">
            <i class="el-icon-magic-stick"></i>
            <span>快捷提问</span>
          </div>
          <div class="quick-questions">
            <el-button
              v-for="q in quickQuestions"
              :key="q.id"
              class="quick-btn"
              @click="quickAsk(q.question)"
              :disabled="sending"
            >
              <i :class="q.icon"></i>
              {{ q.title }}
            </el-button>
          </div>
        </el-card>

        <!-- 智能分析 -->
        <el-card shadow="never" class="quick-card">
          <div slot="header" class="card-header">
            <i class="el-icon-data-analysis"></i>
            <span>智能分析</span>
          </div>
          <div class="analysis-actions">
            <el-button
              v-for="action in analysisActions"
              :key="action.id"
              class="analysis-btn"
              :type="action.type"
              @click="handleAnalysis(action.action)"
              :loading="action.loading"
            >
              <i :class="action.icon"></i>
              {{ action.title }}
            </el-button>
          </div>
        </el-card>

        <!-- 使用提示 -->
        <el-card shadow="never" class="quick-card tips-card">
          <div slot="header" class="card-header">
            <i class="el-icon-info"></i>
            <span>使用提示</span>
          </div>
          <div class="tips-content">
            <p><strong>💡 提问技巧：</strong></p>
            <ul>
              <li>尽量描述清楚您的需求</li>
              <li>可以询问具体的数据指标</li>
              <li>支持多轮对话，可追问</li>
            </ul>
            <p><strong>⚡ 快捷键：</strong></p>
            <ul>
              <li>Enter - 发送消息</li>
              <li>Shift+Enter - 换行</li>
            </ul>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 对话历史弹窗 -->
    <el-dialog
      title="对话历史"
      :visible.sync="showHistoryDialog"
      width="70%"
      top="5vh"
      :close-on-click-modal="false"
    >
      <div class="history-container">
        <!-- 搜索和筛选 -->
        <div class="history-filters">
          <el-input
            v-model="historySearch"
            placeholder="搜索对话内容..."
            prefix-icon="el-icon-search"
            clearable
            style="width: 300px; margin-right: 10px;"
          ></el-input>
          <el-select
            v-model="historyTypeFilter"
            placeholder="问题类型"
            clearable
            style="width: 150px; margin-right: 10px;"
          >
            <el-option label="全部" value=""></el-option>
            <el-option label="订单相关" value="order"></el-option>
            <el-option label="商品相关" value="goods"></el-option>
            <el-option label="数据分析" value="data"></el-option>
            <el-option label="通用问题" value="general"></el-option>
          </el-select>
          <el-button
            type="primary"
            icon="el-icon-refresh"
            @click="loadHistory"
            :loading="historyLoading"
          >
            刷新
          </el-button>
        </div>

        <!-- 历史记录列表 -->
        <div class="history-list" v-loading="historyLoading">
          <el-empty v-if="filteredHistory.length === 0" description="暂无对话历史"></el-empty>
          
          <div
            v-for="item in filteredHistory"
            :key="item.chatId"
            class="history-item"
          >
            <div class="history-header">
              <div class="history-meta">
                <el-tag
                  :type="item.role === 'user' ? 'primary' : 'success'"
                  size="mini"
                >
                  {{ item.role === 'user' ? '用户' : 'AI' }}
                </el-tag>
                <el-tag
                  v-if="item.questionType"
                  type="info"
                  size="mini"
                  style="margin-left: 5px;"
                >
                  {{ getQuestionTypeLabel(item.questionType) }}
                </el-tag>
                <span class="history-time">{{ item.createTime }}</span>
                <span v-if="item.responseTime" class="history-response-time">
                  响应: {{ item.responseTime }}ms
                </span>
              </div>
              <div class="history-actions">
                <el-button
                  type="text"
                  icon="el-icon-copy-document"
                  size="mini"
                  @click="copyContent(item.content)"
                >
                  复制
                </el-button>
                <el-button
                  v-if="item.role === 'user'"
                  type="text"
                  icon="el-icon-refresh-right"
                  size="mini"
                  @click="reuseQuestion(item.content)"
                >
                  重新提问
                </el-button>
                <el-button
                  type="text"
                  icon="el-icon-delete"
                  size="mini"
                  style="color: #f56c6c;"
                  @click="deleteSingleHistory(item)"
                >
                  删除
                </el-button>
              </div>
            </div>
            <div class="history-content markdown-body" v-html="formatMessage(item.content)"></div>
          </div>
        </div>

        <!-- 分页 -->
        <div class="history-pagination">
          <el-pagination
            @size-change="handleHistorySizeChange"
            @current-change="handleHistoryPageChange"
            :current-page="historyPage"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="historyPageSize"
            :total="historyTotal"
            layout="total, sizes, prev, pager, next, jumper"
          >
          </el-pagination>
        </div>
      </div>

      <span slot="footer" class="dialog-footer">
        <el-button @click="showHistoryDialog = false">关闭</el-button>
        <el-button
          type="danger"
          icon="el-icon-delete"
          @click="clearAllHistory"
        >
          清空所有历史
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request'
import { renderMarkdown } from '@/utils/markdown'

export default {
  name: 'AssistantIndex',
  data() {
    return {
      // 消息列表
      messages: [],
      // 输入内容
      inputMessage: '',
      // 发送中
      sending: false,
      // AI服务状态
      aiServiceOnline: false,
      healthCheckTimer: null,
      /** 与后端会话对齐，多轮对话写入同一 session_id */
      currentSessionId: '',
      // 对话历史弹窗
      showHistoryDialog: false,
      historyLoading: false,
      historyList: [],
      historySearch: '',
      historyTypeFilter: '',
      historyPage: 1,
      historyPageSize: 20,
      historyTotal: 0,
      // 快捷提问
      quickQuestions: [
        {
          id: 1,
          title: '今日订单',
          question: '今天的订单情况怎么样？',
          icon: 'el-icon-shopping-cart-2'
        },
        {
          id: 2,
          title: '库存预警',
          question: '有哪些商品需要补货？',
          icon: 'el-icon-box'
        },
        {
          id: 3,
          title: '商品优化',
          question: '给我一些商品优化建议',
          icon: 'el-icon-goods'
        },
        {
          id: 4,
          title: '销售分析',
          question: '分析一下最近的销售数据',
          icon: 'el-icon-data-line'
        },
        {
          id: 5,
          title: '数据概览',
          question: '给我看看整体数据概览',
          icon: 'el-icon-pie-chart'
        }
      ],
      // 智能分析功能
      analysisActions: [
        {
          id: 1,
          title: '订单分析',
          action: 'orders',
          icon: 'el-icon-document',
          type: 'primary',
          loading: false
        },
        {
          id: 2,
          title: '库存分析',
          action: 'inventory',
          icon: 'el-icon-box',
          type: 'success',
          loading: false
        },
        {
          id: 3,
          title: '商品建议',
          action: 'goods',
          icon: 'el-icon-goods',
          type: 'warning',
          loading: false
        }
      ]
    }
  },
  methods: {
    // 发送消息
    async sendMessage() {
      const message = this.inputMessage.trim()
      if (!message || this.sending) return

      // AI 离线时仍尝试请求（避免答辩现场完全无法演示）
      if (!this.aiServiceOnline) {
        this.$message.warning('AI 服务显示离线，正在尝试连接…')
      }

      // 添加用户消息
      this.addMessage('user', message)
      this.inputMessage = ''
      this.sending = true

      // 添加 AI 消息占位
      const aiMsgIndex = this.messages.length
      this.addMessage('ai', '', true)

      try {
        // 调用流式 API
        await this.streamChat(message, aiMsgIndex)
      } catch (error) {
        this.messages[aiMsgIndex].content = '❌ 抱歉，AI 服务暂时不可用，请稍后再试。'
        this.messages[aiMsgIndex].loading = false
        this.$message.error('AI 服务调用失败')
      } finally {
        this.sending = false
      }
    },

    // 流式对话
    async streamChat(message, msgIndex) {
      const token = this.$store.getters.token
      const url = `${process.env.VUE_APP_BASE_API}/system/assistant/chat/stream`

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify({
            message,
            sessionId: this.currentSessionId || undefined
          })
        })

        if (!response.ok) {
          throw new Error('网络请求失败')
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder('utf-8')
        let buffer = ''
        let pendingEvent = 'message'

        while (true) {
          const { done, value } = await reader.read()
          if (done) {
            this.messages[msgIndex].loading = false
            break
          }

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed) continue

            if (trimmed.startsWith('event:')) {
              pendingEvent = trimmed.substring(6).trim()
              continue
            }

            if (trimmed.startsWith('data:')) {
              const data = trimmed.substring(5).trim()

              if (pendingEvent === 'session') {
                this.currentSessionId = data
                pendingEvent = 'message'
                continue
              }

              if (pendingEvent === 'data') {
                this.messages[msgIndex].dataLoaded = true
                pendingEvent = 'message'
                continue
              }

              if (data === '[DONE]') {
                this.messages[msgIndex].loading = false
                pendingEvent = 'message'
                continue
              }

              if (pendingEvent === 'error') {
                this.messages[msgIndex].content = data
                this.messages[msgIndex].loading = false
                pendingEvent = 'message'
                this.$nextTick(() => {
                  this.scrollToBottom()
                })
                continue
              }

              // 流式正文
              this.messages[msgIndex].content += data
              this.messages[msgIndex].loading = false
              pendingEvent = 'message'
              this.$nextTick(() => {
                this.scrollToBottom()
              })
            }
          }
        }
      } catch (error) {
        console.error('流式对话错误:', error)
        throw error
      }
    },

    // 添加消息
    addMessage(role, content, loading = false) {
      this.messages.push({
        role,
        content,
        time: this.formatTime(new Date()),
        loading,
        dataLoaded: false
      })
      this.$nextTick(() => {
        this.scrollToBottom()
      })
    },

    // 快捷提问
    quickAsk(question) {
      this.inputMessage = question
      this.sendMessage()
    },

    // 智能分析
    async handleAnalysis(action) {
      const actionItem = this.analysisActions.find(a => a.action === action)
      if (!actionItem || actionItem.loading) return

      actionItem.loading = true

      try {
        let endpoint = ''
        let title = ''
        switch (action) {
          case 'orders':
            endpoint = '/system/assistant/analyze/orders'
            title = '订单分析'
            break
          case 'inventory':
            endpoint = '/system/assistant/analyze/inventory'
            title = '库存分析'
            break
          case 'goods':
            endpoint = '/system/assistant/suggest/goods'
            title = '商品优化建议'
            break
        }

        // 添加用户消息
        this.addMessage('user', title)

        // 使用若依的 request 方法发送请求
        const response = await request({
          url: endpoint,
          method: 'get',
          params: this.currentSessionId ? { sessionId: this.currentSessionId } : {}
        })

        if (response.code === 200) {
          const d = response.data
          const text = typeof d === 'string' ? d : (d && (d.content || d.reply)) || response.msg || ''
          if (d && typeof d === 'object' && d.sessionId) {
            this.currentSessionId = d.sessionId
          }
          this.addMessage('ai', text)
          const last = this.messages[this.messages.length - 1]
          if (last) {
            last.dataLoaded = true
          }
        } else {
          this.addMessage('ai', '❌ ' + (response.msg || '分析失败'))
          this.$message.error(response.msg || '分析失败')
        }
      } catch (error) {
        this.addMessage('ai', '❌ 分析失败：' + error.message)
        this.$message.error('分析失败：' + error.message)
      } finally {
        actionItem.loading = false
      }
    },

    // 清空对话
    clearChat() {
      this.$confirm('确定要清空所有对话记录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.messages = []
        this.currentSessionId = ''
        this.$message.success('对话已清空')
      }).catch(() => {})
    },

    // 格式化消息（支持换行）
    formatMessage(text) {
      return renderMarkdown(text)
    },

    // 格式化时间
    formatTime(date) {
      const h = date.getHours().toString().padStart(2, '0')
      const m = date.getMinutes().toString().padStart(2, '0')
      return `${h}:${m}`
    },

    // 滚动到底部
    scrollToBottom() {
      const container = this.$refs.messagesContainer
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    },

    // ========== 对话历史相关方法 ==========

    // 加载对话历史
    async loadHistory() {
      this.historyLoading = true
      try {
        const response = await request({
          url: '/system/assistant/recent',
          method: 'get',
          params: {
            limit: 100 // 加载最近100条
          }
        })

        if (response.code === 200) {
          this.historyList = response.rows || response.data || []
          this.historyTotal = this.historyList.length
        } else {
          this.$message.error('加载历史记录失败：' + response.msg)
        }
      } catch (error) {
        this.$message.error('加载历史记录失败：' + error.message)
      } finally {
        this.historyLoading = false
      }
    },

    // 获取问题类型标签
    getQuestionTypeLabel(type) {
      const typeMap = {
        'order': '订单',
        'goods': '商品',
        'data': '数据',
        'general': '通用'
      }
      return typeMap[type] || type
    },

    // 复制内容
    copyContent(content) {
      const textarea = document.createElement('textarea')
      textarea.value = content
      document.body.appendChild(textarea)
      textarea.select()
      try {
        document.execCommand('copy')
        this.$message.success('已复制到剪贴板')
      } catch (err) {
        this.$message.error('复制失败')
      }
      document.body.removeChild(textarea)
    },

    // 重新提问
    reuseQuestion(question) {
      this.showHistoryDialog = false
      this.inputMessage = question
      this.$nextTick(() => {
        // 可以选择自动发送或让用户手动发送
        // this.sendMessage()
      })
    },

    // 清空所有历史
    clearAllHistory() {
      this.$confirm('确定要清空所有对话历史吗？此操作不可恢复！', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const response = await request({
            url: '/system/assistant/history/all',
            method: 'delete'
          })

          if (response.code === 200) {
            this.historyList = []
            this.historyTotal = 0
            this.$message.success('历史记录已清空')
          } else {
            this.$message.error(response.msg || '清空失败')
          }
        } catch (error) {
          this.$message.error('清空失败：' + error.message)
        }
      }).catch(() => {})
    },

    // 删除单条历史记录
    deleteSingleHistory(item) {
      this.$confirm('确定要删除这条记录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const response = await request({
            url: `/system/assistant/history/${item.sessionId}`,
            method: 'delete'
          })

          if (response.code === 200) {
            // 从列表中移除
            const index = this.historyList.findIndex(h => h.chatId === item.chatId)
            if (index > -1) {
              this.historyList.splice(index, 1)
              this.historyTotal--
            }
            this.$message.success('删除成功')
          } else {
            this.$message.error(response.msg || '删除失败')
          }
        } catch (error) {
          this.$message.error('删除失败：' + error.message)
        }
      }).catch(() => {})
    },

    // 分页大小改变
    handleHistorySizeChange(size) {
      this.historyPageSize = size
      this.historyPage = 1
    },

    // 页码改变
    handleHistoryPageChange(page) {
      this.historyPage = page
    },

    // ========== AI服务健康检查 ==========

    // 检查AI服务状态
    async checkAIServiceStatus() {
      try {
        const response = await request({
          url: '/system/assistant/health',
          method: 'get',
          timeout: 5000
        })
        this.aiServiceOnline = response.code === 200
      } catch (error) {
        this.aiServiceOnline = false
      }
    },

    // 启动健康检查定时器
    startHealthCheck() {
      // 立即检查一次
      this.checkAIServiceStatus()
      // 每30秒检查一次
      this.healthCheckTimer = setInterval(() => {
        this.checkAIServiceStatus()
      }, 30000)
    },

    // 停止健康检查定时器
    stopHealthCheck() {
      if (this.healthCheckTimer) {
        clearInterval(this.healthCheckTimer)
        this.healthCheckTimer = null
      }
    }
  },

  mounted() {
    // 启动健康检查
    this.startHealthCheck()
  },

  beforeDestroy() {
    // 清理定时器
    this.stopHealthCheck()
  },

  computed: {
    // 过滤后的历史记录
    filteredHistory() {
      let list = this.historyList

      // 按搜索关键词过滤
      if (this.historySearch) {
        const keyword = this.historySearch.toLowerCase()
        list = list.filter(item =>
          item.content.toLowerCase().includes(keyword)
        )
      }

      // 按问题类型过滤
      if (this.historyTypeFilter) {
        list = list.filter(item =>
          item.questionType === this.historyTypeFilter
        )
      }

      // 分页
      const start = (this.historyPage - 1) * this.historyPageSize
      const end = start + this.historyPageSize
      return list.slice(start, end)
    }
  },

  watch: {
    // 打开历史弹窗时加载数据
    showHistoryDialog(val) {
      if (val) {
        this.loadHistory()
      }
    }
  }
}
</script>

<style scoped lang="scss">
.assistant-container {
  height: calc(100vh - 84px);
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #fff5f5 0%, #ffe8e8 50%, #fff5f5 100%);
  position: relative;
  
  // 新年装饰背景
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      radial-gradient(circle at 20% 30%, rgba(255, 215, 0, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, rgba(255, 0, 0, 0.08) 0%, transparent 50%);
    pointer-events: none;
  }
}

// 头部 - 新年红金主题
.assistant-header {
  background: linear-gradient(135deg, #d32f2f 0%, #c62828 50%, #b71c1c 100%);
  color: #fff;
  padding: 20px 30px;
  box-shadow: 0 4px 12px rgba(211, 47, 47, 0.3);
  position: relative;
  overflow: hidden;
  
  // 金色装饰条纹
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #ffd700 0%, #ffed4e 50%, #ffd700 100%);
  }
  
  &::after {
    content: '🧧';
    position: absolute;
    right: 30px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 50px;
    opacity: 0.2;
  }

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    z-index: 1;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 15px;

    > i {
      font-size: 40px;
      color: #ffd700;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .header-text {
      h2 {
        margin: 0 0 5px 0;
        font-size: 24px;
        font-weight: 600;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }

      p {
        margin: 0;
        font-size: 14px;
        opacity: 0.95;
        color: #ffe8e8;
      }
    }
  }
  
  .header-right {
    ::v-deep .el-tag {
      background: rgba(255, 215, 0, 0.2);
      border-color: #ffd700;
      color: #ffd700;
      font-weight: 600;
    }
  }
}

// 主体
.assistant-body {
  flex: 1;
  display: flex;
  gap: 20px;
  padding: 20px;
  overflow: hidden;
  position: relative;
  z-index: 1;
}

// 对话区
.chat-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;

  .chat-card {
    height: 100%;
    display: flex;
    flex-direction: column;
    border: 2px solid #ffcdd2;
    box-shadow: 0 4px 12px rgba(211, 47, 47, 0.15);
    border-radius: 12px;
    overflow: hidden;

    ::v-deep .el-card__body {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 0;
      overflow: hidden;
      background: #fff;
    }
  }
}

// 消息容器
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: linear-gradient(to bottom, #fff 0%, #fffaf0 100%);
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #ff6b6b 0%, #d32f2f 100%);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: #ffe8e8;
  }
}

// 欢迎消息
.welcome-message {
  text-align: center;
  padding: 40px 20px;
  color: #c62828;

  .welcome-icon {
    font-size: 60px;
    margin-bottom: 20px;

    i {
      font-size: 60px;
      color: #d32f2f;
      filter: drop-shadow(0 4px 8px rgba(211, 47, 47, 0.3));
    }
  }

  h3 {
    font-size: 24px;
    margin: 0 0 20px 0;
    color: #b71c1c;
    font-weight: 700;
  }

  p {
    font-size: 16px;
    margin: 15px 0;
    color: #d32f2f;
  }

  ul {
    text-align: left;
    display: inline-block;
    margin: 20px 0;

    li {
      margin: 10px 0;
      font-size: 15px;
      color: #c62828;
    }
  }

  .tip {
    font-size: 14px;
    color: #e57373;
    margin-top: 30px;
  }
}

// 消息项
.message-item {
  display: flex;
  margin-bottom: 20px;
  animation: fadeIn 0.3s;

  &.user-message {
    flex-direction: row-reverse;

    .message-content {
      background: linear-gradient(135deg, #d32f2f 0%, #c62828 100%);
      color: white;
      border-radius: 16px 16px 4px 16px;
      box-shadow: 0 4px 12px rgba(211, 47, 47, 0.3);
    }

    .message-avatar {
      background: linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%);
      border: 2px solid #ffd700;
      box-shadow: 0 2px 8px rgba(211, 47, 47, 0.4);
    }
  }

  &.ai-message {
    .message-content {
      background: linear-gradient(135deg, #fff 0%, #fffaf0 100%);
      border: 2px solid #ffcdd2;
      border-radius: 16px 16px 16px 4px;
      color: #333;
      box-shadow: 0 4px 12px rgba(211, 47, 47, 0.15);
    }

    .message-avatar {
      background: linear-gradient(135deg, #ffd700 0%, #ffa000 100%);
      border: 2px solid #d32f2f;
      box-shadow: 0 2px 8px rgba(255, 215, 0, 0.4);
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  flex-shrink: 0;
  margin: 0 10px;
}

.message-content {
  max-width: 70%;
  padding: 14px 18px;

  .message-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 12px;
    opacity: 0.85;
    font-weight: 600;
  }

  .data-linked-badge {
    margin-bottom: 8px;
  }

  .message-text {
    font-size: 14px;
    line-height: 1.7;
    word-wrap: break-word;
  }

  .markdown-body {
    ::v-deep h1,
    ::v-deep h2,
    ::v-deep h3,
    ::v-deep h4 {
      margin: 12px 0 8px;
      font-weight: 600;
      line-height: 1.4;
      color: inherit;
    }

    ::v-deep h1 { font-size: 1.35em; }
    ::v-deep h2 { font-size: 1.2em; }
    ::v-deep h3 { font-size: 1.08em; }
    ::v-deep h4 { font-size: 1em; }

    ::v-deep p {
      margin: 8px 0;
    }

    ::v-deep ul,
    ::v-deep ol {
      margin: 8px 0;
      padding-left: 1.4em;
    }

    ::v-deep li {
      margin: 4px 0;
    }

    ::v-deep blockquote {
      margin: 8px 0;
      padding: 8px 12px;
      border-left: 3px solid #dc2626;
      background: rgba(220, 38, 38, 0.06);
      color: #606266;
    }

    ::v-deep code {
      padding: 2px 6px;
      border-radius: 4px;
      background: rgba(0, 0, 0, 0.06);
      font-family: Consolas, Monaco, monospace;
      font-size: 0.92em;
    }

    ::v-deep pre {
      margin: 10px 0;
      padding: 12px;
      border-radius: 8px;
      background: #f6f8fa;
      overflow-x: auto;

      code {
        padding: 0;
        background: transparent;
        font-size: 13px;
      }
    }

    ::v-deep .md-table-wrap {
      margin: 10px 0;
      overflow-x: auto;
    }

    ::v-deep .md-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;

      th,
      td {
        border: 1px solid #ebeef5;
        padding: 8px 10px;
        text-align: left;
      }

      th {
        background: #f5f7fa;
        font-weight: 600;
      }

      tr:nth-child(even) td {
        background: #fafafa;
      }
    }

    ::v-deep hr {
      margin: 12px 0;
      border: none;
      border-top: 1px solid #ebeef5;
    }

    ::v-deep a {
      color: #dc2626;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }

    ::v-deep strong {
      font-weight: 600;
    }
  }

  .message-loading {
    margin-top: 10px;
    font-size: 13px;
    opacity: 0.8;
    color: #d32f2f;

    i {
      margin-right: 5px;
    }
  }
}

// 输入区
.input-section {
  border-top: 2px solid #ffcdd2;
  padding: 20px;
  background: linear-gradient(to bottom, #fff 0%, #fffaf0 100%);

  ::v-deep .el-textarea__inner {
    border: 2px solid #ffcdd2;
    border-radius: 8px;
    
    &:focus {
      border-color: #d32f2f;
    }
  }

  .input-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 10px;
    
    ::v-deep .el-button--primary {
      background: linear-gradient(135deg, #d32f2f 0%, #c62828 100%);
      border-color: #d32f2f;
      
      &:hover {
        background: linear-gradient(135deg, #c62828 0%, #b71c1c 100%);
      }
    }
  }
}

// 快捷功能区
.quick-section {
  width: 320px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
  max-height: 100%;

  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #ff6b6b 0%, #d32f2f 100%);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: #ffe8e8;
  }
}

.quick-card {
  border: 2px solid #ffcdd2;
  box-shadow: 0 4px 12px rgba(211, 47, 47, 0.15);
  border-radius: 12px;
  flex-shrink: 0;
  
  ::v-deep .el-card__header {
    background: linear-gradient(135deg, #fff 0%, #fffaf0 100%);
    border-bottom: 2px solid #ffcdd2;
    padding: 15px 20px;
  }
  
  ::v-deep .el-card__body {
    padding: 15px;
    max-height: 400px;
    overflow-y: auto;
    
    &::-webkit-scrollbar {
      width: 6px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: #ffcdd2;
      border-radius: 3px;
    }
  }
  
  .card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 700;
    color: #b71c1c;

    i {
      color: #d32f2f;
      font-size: 18px;
    }
  }
}

// 快捷提问
.quick-questions {
  display: flex;
  flex-direction: column;
  gap: 10px;

  .quick-btn {
    width: 100%;
    text-align: left;
    height: auto;
    padding: 12px 15px;
    border: 2px solid #ffcdd2;
    background: linear-gradient(135deg, #fff 0%, #fffaf0 100%);
    transition: all 0.3s;
    color: #c62828;
    font-weight: 500;

    &:hover:not(:disabled) {
      border-color: #d32f2f;
      color: #b71c1c;
      transform: translateX(5px);
      box-shadow: 0 4px 12px rgba(211, 47, 47, 0.2);
      background: linear-gradient(135deg, #fff 0%, #ffe8e8 100%);
    }

    i {
      margin-right: 8px;
      color: #d32f2f;
    }
  }
}

// 智能分析
.analysis-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;

  .analysis-btn {
    width: 100%;
    height: auto;
    padding: 12px 15px;
    font-weight: 600;
    border-width: 2px;

    i {
      margin-right: 8px;
    }
    
    &.el-button--primary {
      background: linear-gradient(135deg, #d32f2f 0%, #c62828 100%);
      border-color: #d32f2f;
      
      &:hover {
        background: linear-gradient(135deg, #c62828 0%, #b71c1c 100%);
      }
    }
    
    &.el-button--success {
      background: linear-gradient(135deg, #ffd700 0%, #ffa000 100%);
      border-color: #ffd700;
      color: #b71c1c;
      
      &:hover {
        background: linear-gradient(135deg, #ffa000 0%, #ff8f00 100%);
      }
    }
    
    &.el-button--warning {
      background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
      border-color: #ff6b6b;
      
      &:hover {
        background: linear-gradient(135deg, #ee5a6f 0%, #e91e63 100%);
      }
    }
  }
}

// 使用提示
.tips-card {
  ::v-deep .el-card__body {
    background: linear-gradient(135deg, #fffaf0 0%, #fff 100%);
  }
  
  .tips-content {
    font-size: 13px;
    color: #c62828;
    line-height: 1.8;

    p {
      margin: 10px 0 5px 0;
      
      strong {
        color: #b71c1c;
      }
    }

    ul {
      margin: 5px 0;
      padding-left: 20px;

      li {
        margin: 5px 0;
        color: #d32f2f;
      }
    }
  }
}

// 响应式
@media (max-width: 1200px) {
  .quick-section {
    width: 280px;
  }
}

@media (max-width: 992px) {
  .assistant-body {
    flex-direction: column;
  }

  .quick-section {
    width: 100%;
    flex-direction: row;
    overflow-x: auto;

    .quick-card {
      min-width: 300px;
    }
  }
}

// ========== 对话历史弹窗样式 ==========
.history-container {
  max-height: 70vh;
  display: flex;
  flex-direction: column;
}

.history-filters {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #ffcdd2;
}

.history-list {
  flex: 1;
  overflow-y: auto;
  min-height: 400px;
  max-height: 50vh;
  padding: 10px;
  background: linear-gradient(to bottom, #fff 0%, #fffaf0 100%);
  border-radius: 8px;
  border: 2px solid #ffcdd2;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #ff6b6b 0%, #d32f2f 100%);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-track {
    background: #ffe8e8;
  }
}

.history-item {
  background: #fff;
  border: 2px solid #ffcdd2;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  transition: all 0.3s;

  &:hover {
    border-color: #d32f2f;
    box-shadow: 0 4px 12px rgba(211, 47, 47, 0.2);
    transform: translateY(-2px);
  }

  &:last-child {
    margin-bottom: 0;
  }
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ffe8e8;
}

.history-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;

  .history-time {
    font-size: 12px;
    color: #999;
  }

  .history-response-time {
    font-size: 12px;
    color: #d32f2f;
    font-weight: 600;
  }
}

.history-actions {
  display: flex;
  gap: 5px;

  .el-button--text {
    color: #d32f2f;

    &:hover {
      color: #b71c1c;
    }
  }
}

.history-content {
  font-size: 14px;
  line-height: 1.7;
  color: #333;
  word-wrap: break-word;
  max-height: 200px;
  overflow-y: auto;

  &.markdown-body {
    ::v-deep h1,
    ::v-deep h2,
    ::v-deep h3,
    ::v-deep h4 {
      margin: 10px 0 6px;
      font-weight: 600;
    }

    ::v-deep .md-table-wrap {
      overflow-x: auto;
    }

    ::v-deep .md-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;

      th,
      td {
        border: 1px solid #ebeef5;
        padding: 6px 8px;
      }

      th {
        background: #f5f7fa;
      }
    }
  }

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #ffcdd2;
    border-radius: 2px;
  }
}

.history-pagination {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 2px solid #ffcdd2;
  display: flex;
  justify-content: center;

  ::v-deep .el-pagination {
    .el-pager li.active {
      background: linear-gradient(135deg, #d32f2f 0%, #c62828 100%);
      color: #fff;
    }

    .el-pager li:hover {
      color: #d32f2f;
    }

    .btn-prev, .btn-next {
      &:hover {
        color: #d32f2f;
      }
    }
  }
}

// 对话历史按钮样式
.header-right {
  display: flex;
  align-items: center;
  gap: 10px;

  ::v-deep .el-button--warning.is-plain {
    background: rgba(255, 215, 0, 0.2);
    border-color: #ffd700;
    color: #ffd700;

    &:hover {
      background: rgba(255, 215, 0, 0.3);
      border-color: #ffd700;
      color: #fff;
    }
  }
}
</style>
