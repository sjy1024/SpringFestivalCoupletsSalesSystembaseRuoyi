<template>
  <div class="dashboard-screen">
    <!-- 装饰性背景元素 -->
    <div class="bg-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>

    <!-- 顶部标题栏 -->
    <div class="screen-header">
      <div class="header-left">
        <span class="lantern">🏮</span>
        <span class="title">
          <span class="title-text">春联商城数据大屏</span>
          <span class="title-subtitle">Spring Couplet Data Dashboard</span>
        </span>
        <span class="lantern">🏮</span>
      </div>
      <div class="header-center">
        <div class="time-box">
          <i class="el-icon-time"></i>
          <span class="time">{{ currentTime }}</span>
        </div>
      </div>
      <div class="header-right">
        <el-button type="text" @click="switchVersion" class="switch-btn">
          <i class="el-icon-s-data"></i> 切换图表版
        </el-button>
        <el-button type="text" @click="goBack" class="exit-btn">
          <i class="el-icon-close"></i> 退出全屏
        </el-button>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="screen-body">
      <!-- 加载遮罩 -->
      <div v-if="loading" class="loading-overlay">
        <div class="loading-spinner">
          <div class="spinner-ring"></div>
          <div class="spinner-ring"></div>
          <div class="spinner-ring"></div>
          <div class="loading-text">数据加载中...</div>
        </div>
      </div>

      <!-- 刷新提示 -->
      <transition name="refresh-fade">
        <div v-if="refreshing" class="refresh-indicator">
          <i class="el-icon-loading"></i>
          <span>数据刷新中...</span>
        </div>
      </transition>

      <!-- 左侧 -->
      <div class="panel left-panel">
        <div class="card glow-card" :class="{ 'refreshing': refreshing }">
          <div class="card-header">
            <div class="header-icon">
              <i class="el-icon-data-line"></i>
            </div>
            <span class="header-title">实时数据</span>
            <div class="header-line"></div>
          </div>
          <div class="card-body">
            <!-- 骨架屏 -->
            <template v-if="loading">
              <div class="skeleton-stat" v-for="i in 3" :key="'skeleton-' + i">
                <div class="skeleton-icon"></div>
                <div class="skeleton-content">
                  <div class="skeleton-line skeleton-line-lg"></div>
                  <div class="skeleton-line skeleton-line-sm"></div>
                </div>
              </div>
            </template>
            
            <!-- 真实数据 -->
            <transition-group v-else name="stat-fade" tag="div">
              <div class="stat-box" v-for="(item, index) in stats" :key="item.label">
                <div class="stat-icon" :style="{ background: item.color }">
                  <i :class="item.icon"></i>
                </div>
                <div class="stat-info">
                  <div class="stat-value" :data-value="item.value">
                    <span class="number">{{ formatAnimatedNumber(index) }}</span>
                  </div>
                  <div class="stat-label">{{ item.label }}</div>
                  <div class="stat-trend">
                    <i class="el-icon-top trend-up"></i>
                    <span>实时更新</span>
                  </div>
                </div>
              </div>
            </transition-group>
          </div>
        </div>
      </div>

      <!-- 中间 -->
      <div class="panel center-panel">
        <div class="card glow-card" :class="{ 'refreshing': refreshing }">
          <div class="card-header">
            <div class="header-icon">
              <i class="el-icon-document"></i>
            </div>
            <span class="header-title">最近订单</span>
            <div class="header-line"></div>
            <span class="header-badge">{{ loading ? '-' : orders.length }}</span>
          </div>
          <div class="card-body">
            <!-- 骨架屏 -->
            <template v-if="loading">
              <div class="skeleton-order" v-for="i in 5" :key="'skeleton-order-' + i">
                <div class="skeleton-icon"></div>
                <div class="skeleton-content">
                  <div class="skeleton-line"></div>
                  <div class="skeleton-line skeleton-line-sm"></div>
                </div>
              </div>
            </template>
            
            <!-- 真实数据 -->
            <div v-else class="order-list">
              <transition-group name="order-slide" tag="div">
                <div class="order-item" v-for="order in orders" :key="order.id">
                  <div class="order-left">
                    <div class="order-icon">
                      <i class="el-icon-shopping-cart-2"></i>
                    </div>
                    <div class="order-info">
                      <span class="order-no">{{ order.orderNo }}</span>
                      <span class="order-time">刚刚</span>
                    </div>
                  </div>
                  <div class="order-right">
                    <span class="order-amount">¥{{ order.amount }}</span>
                    <span class="order-status" :class="getStatusClass(order.status)">
                      {{ order.status }}
                    </span>
                  </div>
                </div>
              </transition-group>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧 -->
      <div class="panel right-panel">
        <div class="card glow-card" :class="{ 'refreshing': refreshing }">
          <div class="card-header">
            <div class="header-icon warning">
              <i class="el-icon-warning"></i>
            </div>
            <span class="header-title">库存预警</span>
            <div class="header-line"></div>
            <span class="header-badge warning">{{ loading ? '-' : alerts.length }}</span>
          </div>
          <div class="card-body">
            <!-- 骨架屏 -->
            <template v-if="loading">
              <div class="skeleton-alert" v-for="i in 3" :key="'skeleton-alert-' + i">
                <div class="skeleton-icon"></div>
                <div class="skeleton-content">
                  <div class="skeleton-line"></div>
                  <div class="skeleton-line skeleton-line-sm"></div>
                </div>
              </div>
            </template>
            
            <!-- 真实数据 -->
            <div v-else class="alert-list">
              <transition-group name="alert-bounce" tag="div">
                <div class="alert-item" v-for="item in alerts" :key="item.id">
                  <div class="alert-pulse">
                    <i class="el-icon-warning-outline"></i>
                  </div>
                  <div class="alert-content">
                    <span class="goods-name">{{ item.name }}</span>
                    <div class="stock-bar">
                      <div class="stock-progress" :style="{ width: (item.stock * 10) + '%' }"></div>
                    </div>
                  </div>
                  <span class="stock">{{ item.stock }}</span>
                </div>
              </transition-group>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部装饰 -->
    <div class="screen-footer">
      <div class="footer-line"></div>
      <div class="footer-text">数据每30秒自动刷新 | 春联商城管理系统</div>
    </div>
  </div>
</template>

<script>
import request from '@/utils/request'

export default {
  name: 'Dashboard',
  data() {
    return {
      currentTime: '',
      timer: null,
      refreshTimer: null,
      stats: [],
      orders: [],
      alerts: [],
      loading: true,
      animatedNumbers: {}, // 存储动画中的数字
      refreshing: false // 刷新状态
    }
  },
  mounted() {
    this.updateTime()
    this.timer = setInterval(this.updateTime, 1000)
    
    // 加载数据
    this.loadData()
    
    // 每30秒刷新一次数据
    this.refreshTimer = setInterval(() => {
      this.refreshing = true
      this.loadData()
    }, 30000)
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer)
    }
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer)
    }
  },
  methods: {
    // 加载数据
    loadData() {
      request({
        url: '/system/dashboard/data',
        method: 'get'
      }).then(response => {
        if (response.code === 200) {
          // 延迟显示，增加加载效果
          setTimeout(() => {
            const data = response.data
            this.stats = data.stats || []
            
            // 添加更多统计指标
            if (data.customOrderStats) {
              this.stats.push({
                label: '定制订单',
                value: data.customOrderStats.total_count || 0,
                icon: 'el-icon-edit',
                color: '#8b5cf6'
              })
            }
            
            if (data.aiChatStats) {
              this.stats.push({
                label: 'AI对话',
                value: data.aiChatStats.total_chats || 0,
                icon: 'el-icon-chat-dot-round',
                color: '#06b6d4'
              })
            }
            
            this.orders = data.orders || []
            this.alerts = data.alerts || []
            this.loading = false
            this.refreshing = false
            
            // 触发数字动画
            this.animateNumbers()
          }, 500)
        } else {
          this.$message.error(response.msg || '加载数据失败')
          this.loading = false
          this.refreshing = false
        }
      }).catch(error => {
        console.error('加载数据失败:', error)
        this.$message.error('加载数据失败，请检查后端服务')
        this.loading = false
        this.refreshing = false
      })
    },
    
    // 数字滚动动画
    animateNumbers() {
      this.stats.forEach((stat, index) => {
        const value = stat.value
        // 提取数字部分
        const match = value.match(/[\d.]+/)
        if (match) {
          const targetNumber = parseFloat(match[0])
          const prefix = value.substring(0, match.index)
          const suffix = value.substring(match.index + match[0].length)
          
          this.$set(this.animatedNumbers, index, 0)
          
          // 动画持续时间
          const duration = 2000
          const steps = 60
          const increment = targetNumber / steps
          let current = 0
          let step = 0
          
          const animate = () => {
            if (step < steps) {
              current += increment
              this.$set(this.animatedNumbers, index, current)
              step++
              requestAnimationFrame(animate)
            } else {
              this.$set(this.animatedNumbers, index, targetNumber)
            }
          }
          
          animate()
        }
      })
    },
    
    // 格式化动画数字
    formatAnimatedNumber(index) {
      const stat = this.stats[index]
      if (!stat) return ''
      
      const value = stat.value
      // 确保value是字符串
      if (typeof value !== 'string') {
        return String(value)
      }
      
      const match = value.match(/[\d.]+/)
      
      if (match && this.animatedNumbers[index] !== undefined) {
        const prefix = value.substring(0, match.index)
        const suffix = value.substring(match.index + match[0].length)
        const animatedValue = this.animatedNumbers[index]
        
        // 根据原始值决定小数位数
        const decimalPlaces = match[0].includes('.') ? 2 : 0
        const formattedNumber = animatedValue.toFixed(decimalPlaces)
        
        return prefix + formattedNumber + suffix
      }
      
      return value
    },
    
    updateTime() {
      const now = new Date()
      this.currentTime = now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      })
    },
    
    goBack() {
      this.$router.push('/index')
    },
    
    switchVersion() {
      this.$router.push('/dashboard-charts')
    },
    
    // 获取订单状态样式
    getStatusClass(status) {
      const statusMap = {
        '待支付': 'status-pending',
        '已支付': 'status-paid',
        '制作中': 'status-processing',
        '已完成': 'status-completed',
        '已取消': 'status-cancelled'
      }
      return statusMap[status] || ''
    }
  }
}
</script>

<style scoped lang="scss">
.dashboard-screen {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0000 0%, #2d0000 50%, #0a0000 100%);
  color: white;
  overflow: hidden;
}

// 背景装饰
.bg-decoration {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
  opacity: 0.1;
  
  .circle {
    position: absolute;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(234, 179, 8, 0.3) 0%, transparent 70%);
    animation: float 20s infinite ease-in-out;
    
    &.circle-1 {
      width: 300px;
      height: 300px;
      top: 10%;
      left: 10%;
      animation-delay: 0s;
    }
    
    &.circle-2 {
      width: 400px;
      height: 400px;
      top: 50%;
      right: 10%;
      animation-delay: 5s;
    }
    
    &.circle-3 {
      width: 250px;
      height: 250px;
      bottom: 10%;
      left: 50%;
      animation-delay: 10s;
    }
  }
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(30px, -30px) scale(1.1);
  }
}

// 顶部标题栏
.screen-header {
  height: 90px;
  background: linear-gradient(180deg, rgba(139, 0, 0, 0.8) 0%, rgba(139, 0, 0, 0.4) 100%);
  border-bottom: 3px solid;
  border-image: linear-gradient(90deg, transparent, #eab308, transparent) 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  position: relative;
  box-shadow: 0 4px 20px rgba(234, 179, 8, 0.3);
  
  &::after {
    content: '';
    position: absolute;
    bottom: -3px;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, transparent, #eab308, transparent);
    animation: borderFlow 3s linear infinite;
  }
  
  .header-left {
    display: flex;
    align-items: center;
    gap: 20px;
    
    .lantern {
      font-size: 36px;
      animation: swing 3s ease-in-out infinite;
      filter: drop-shadow(0 0 10px rgba(234, 179, 8, 0.8));
    }
    
    .title {
      display: flex;
      flex-direction: column;
      
      .title-text {
        font-size: 32px;
        font-weight: bold;
        background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #fbbf24 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-shadow: 0 0 30px rgba(234, 179, 8, 0.5);
        letter-spacing: 2px;
      }
      
      .title-subtitle {
        font-size: 12px;
        color: rgba(251, 191, 36, 0.6);
        letter-spacing: 3px;
        margin-top: 5px;
      }
    }
  }
  
  .header-center {
    .time-box {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 25px;
      background: rgba(0, 0, 0, 0.4);
      border-radius: 25px;
      border: 1px solid rgba(234, 179, 8, 0.3);
      box-shadow: 0 0 20px rgba(234, 179, 8, 0.2);
      
      i {
        color: #eab308;
        font-size: 18px;
      }
      
      .time {
        font-size: 20px;
        color: #fef3c7;
        font-family: 'Courier New', monospace;
        font-weight: bold;
        letter-spacing: 1px;
      }
    }
  }
  
  .header-right {
    display: flex;
    gap: 15px;
    
    .switch-btn {
      color: #fbbf24;
      font-size: 16px;
      padding: 10px 20px;
      border: 1px solid rgba(234, 179, 8, 0.3);
      border-radius: 20px;
      transition: all 0.3s;
      background: rgba(234, 179, 8, 0.1);
      
      &:hover {
        color: #fef3c7;
        background: rgba(234, 179, 8, 0.3);
        border-color: #eab308;
        box-shadow: 0 0 15px rgba(234, 179, 8, 0.4);
        transform: translateY(-2px);
      }
      
      i {
        margin-right: 5px;
      }
    }
    
    .exit-btn {
      color: #fbbf24;
      font-size: 16px;
      padding: 10px 20px;
      border: 1px solid rgba(234, 179, 8, 0.3);
      border-radius: 20px;
      transition: all 0.3s;
      
      &:hover {
        color: #fef3c7;
        background: rgba(234, 179, 8, 0.2);
        border-color: #eab308;
        box-shadow: 0 0 15px rgba(234, 179, 8, 0.4);
      }
    }
  }
}

@keyframes swing {
  0%, 100% {
    transform: rotate(-8deg);
  }
  50% {
    transform: rotate(8deg);
  }
}

@keyframes borderFlow {
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 200% 50%;
  }
}

// 主内容区
.screen-body {
  min-height: calc(100vh - 140px);
  display: flex;
  gap: 25px;
  padding: 25px;
  position: relative;
  z-index: 1;
  
  .panel {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .left-panel {
    flex: 0 0 28%;
  }
  
  .center-panel {
    flex: 0 0 44%;
  }
  
  .right-panel {
    flex: 0 0 28%;
  }
}

// 加载遮罩
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
  animation: fadeIn 0.3s;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  
  .spinner-ring {
    width: 80px;
    height: 80px;
    border: 4px solid transparent;
    border-top-color: #eab308;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    position: absolute;
    
    &:nth-child(1) {
      border-top-color: #eab308;
      animation-duration: 1s;
    }
    
    &:nth-child(2) {
      border-top-color: #dc2626;
      animation-duration: 1.5s;
      width: 60px;
      height: 60px;
    }
    
    &:nth-child(3) {
      border-top-color: #ef4444;
      animation-duration: 2s;
      width: 40px;
      height: 40px;
    }
  }
  
  .loading-text {
    margin-top: 100px;
    font-size: 18px;
    color: #fbbf24;
    letter-spacing: 2px;
    animation: pulse 1.5s ease-in-out infinite;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

// 刷新提示
.refresh-indicator {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(234, 179, 8, 0.9);
  color: white;
  padding: 12px 24px;
  border-radius: 25px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: bold;
  box-shadow: 0 4px 20px rgba(234, 179, 8, 0.5);
  z-index: 999;
  
  i {
    font-size: 18px;
    animation: spin 1s linear infinite;
  }
}

.refresh-fade-enter-active, .refresh-fade-leave-active {
  transition: all 0.3s;
}

.refresh-fade-enter, .refresh-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

// 骨架屏样式
.skeleton-stat,
.skeleton-order,
.skeleton-alert {
  display: flex;
  align-items: center;
  padding: 20px;
  margin-bottom: 18px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  
  .skeleton-icon {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    background: linear-gradient(90deg, rgba(255, 255, 255, 0.05) 25%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.05) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    margin-right: 20px;
  }
  
  .skeleton-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .skeleton-line {
    height: 20px;
    border-radius: 4px;
    background: linear-gradient(90deg, rgba(255, 255, 255, 0.05) 25%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.05) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    
    &.skeleton-line-lg {
      width: 80%;
      height: 24px;
    }
    
    &.skeleton-line-sm {
      width: 60%;
      height: 16px;
    }
  }
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

// 刷新时的卡片效果
.card.refreshing {
  animation: cardPulse 0.5s ease-in-out;
}

@keyframes cardPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(0.98);
    opacity: 0.8;
  }
}

// 卡片样式
.card {
  background: rgba(20, 0, 0, 0.6);
  border: 2px solid rgba(234, 179, 8, 0.3);
  border-radius: 16px;
  padding: 25px;
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
  
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, transparent, rgba(234, 179, 8, 0.3), transparent);
    border-radius: 16px;
    z-index: -1;
    opacity: 0;
    transition: opacity 0.3s;
  }
  
  &.glow-card:hover::before {
    opacity: 1;
    animation: borderRotate 3s linear infinite;
  }
  
  .card-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 25px;
    position: relative;
    
    .header-icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, rgba(234, 179, 8, 0.3), rgba(220, 38, 38, 0.3));
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 20px rgba(234, 179, 8, 0.4);
      
      &.warning {
        background: linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(220, 38, 38, 0.3));
        box-shadow: 0 0 20px rgba(239, 68, 68, 0.4);
      }
      
      i {
        font-size: 22px;
        color: #fbbf24;
      }
    }
    
    .header-title {
      font-size: 20px;
      font-weight: bold;
      color: #fbbf24;
      letter-spacing: 1px;
    }
    
    .header-line {
      flex: 1;
      height: 2px;
      background: linear-gradient(90deg, rgba(234, 179, 8, 0.5), transparent);
      margin: 0 10px;
    }
    
    .header-badge {
      padding: 4px 12px;
      background: rgba(234, 179, 8, 0.2);
      border: 1px solid rgba(234, 179, 8, 0.4);
      border-radius: 12px;
      font-size: 14px;
      color: #fbbf24;
      font-weight: bold;
      
      &.warning {
        background: rgba(239, 68, 68, 0.2);
        border-color: rgba(239, 68, 68, 0.4);
        color: #ef4444;
      }
    }
  }
  
  .card-body {
    color: #fef3c7;
  }
}

@keyframes borderRotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

// 统计卡片
.stat-box {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.4), rgba(20, 0, 0, 0.4));
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 18px;
  border: 1px solid rgba(234, 179, 8, 0.2);
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(234, 179, 8, 0.1), transparent);
    transition: left 0.5s;
  }
  
  &:hover {
    transform: translateX(5px);
    border-color: rgba(234, 179, 8, 0.5);
    box-shadow: 0 5px 25px rgba(234, 179, 8, 0.3);
    
    &::before {
      left: 100%;
    }
  }
  
  .stat-icon {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 20px;
    box-shadow: 0 0 25px rgba(234, 179, 8, 0.4);
    
    i {
      font-size: 28px;
      color: white;
    }
  }
  
  .stat-info {
    flex: 1;
    
    .stat-value {
      font-size: 32px;
      font-weight: bold;
      color: #fef3c7;
      margin-bottom: 8px;
      font-family: 'Arial', sans-serif;
      text-shadow: 0 0 10px rgba(234, 179, 8, 0.5);
      
      .number {
        display: inline-block;
        animation: numberPulse 2s ease-in-out infinite;
      }
    }
    
    .stat-label {
      font-size: 15px;
      color: rgba(254, 243, 199, 0.7);
      margin-bottom: 5px;
    }
    
    .stat-trend {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 12px;
      color: rgba(234, 179, 8, 0.8);
      
      .trend-up {
        color: #10b981;
        animation: trendBounce 1s ease-in-out infinite;
      }
    }
  }
}

@keyframes numberPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes trendBounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

// 订单列表
.order-list {
  max-height: calc(100vh - 250px);
  overflow-y: auto;
  padding-right: 10px;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(234, 179, 8, 0.4);
    border-radius: 3px;
    
    &:hover {
      background: rgba(234, 179, 8, 0.6);
    }
  }
  
  .order-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px;
    margin-bottom: 12px;
    background: linear-gradient(135deg, rgba(0, 0, 0, 0.3), rgba(20, 0, 0, 0.3));
    border-radius: 10px;
    border-left: 4px solid #eab308;
    transition: all 0.3s;
    
    &:hover {
      transform: translateX(5px);
      background: linear-gradient(135deg, rgba(234, 179, 8, 0.1), rgba(220, 38, 38, 0.1));
      box-shadow: 0 4px 15px rgba(234, 179, 8, 0.2);
    }
    
    .order-left {
      display: flex;
      align-items: center;
      gap: 15px;
      
      .order-icon {
        width: 45px;
        height: 45px;
        background: rgba(234, 179, 8, 0.2);
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        
        i {
          font-size: 20px;
          color: #eab308;
        }
      }
      
      .order-info {
        display: flex;
        flex-direction: column;
        gap: 5px;
        
        .order-no {
          font-size: 15px;
          font-weight: 500;
          color: #fef3c7;
        }
        
        .order-time {
          font-size: 12px;
          color: rgba(254, 243, 199, 0.5);
        }
      }
    }
    
    .order-right {
      display: flex;
      align-items: center;
      gap: 15px;
      
      .order-amount {
        color: #eab308;
        font-weight: bold;
        font-size: 18px;
        text-shadow: 0 0 10px rgba(234, 179, 8, 0.5);
      }
      
      .order-status {
        padding: 6px 14px;
        border-radius: 15px;
        font-size: 13px;
        font-weight: 500;
        
        &.status-pending {
          background: rgba(251, 191, 36, 0.2);
          color: #fbbf24;
          border: 1px solid rgba(251, 191, 36, 0.4);
        }
        
        &.status-paid {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.4);
        }
        
        &.status-processing {
          background: rgba(59, 130, 246, 0.2);
          color: #3b82f6;
          border: 1px solid rgba(59, 130, 246, 0.4);
        }
        
        &.status-completed {
          background: rgba(34, 197, 94, 0.2);
          color: #22c55e;
          border: 1px solid rgba(34, 197, 94, 0.4);
        }
        
        &.status-cancelled {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.4);
        }
      }
    }
  }
}

// 库存预警
.alert-list {
  .alert-item {
    display: flex;
    align-items: center;
    padding: 18px;
    margin-bottom: 12px;
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.1));
    border-radius: 10px;
    border-left: 4px solid #ef4444;
    transition: all 0.3s;
    
    &:hover {
      transform: translateX(5px);
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.15));
      box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
    }
    
    .alert-pulse {
      width: 45px;
      height: 45px;
      background: rgba(239, 68, 68, 0.2);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 15px;
      position: relative;
      
      &::before {
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 10px;
        background: rgba(239, 68, 68, 0.4);
        animation: pulse 2s ease-out infinite;
      }
      
      i {
        color: #ef4444;
        font-size: 22px;
        position: relative;
        z-index: 1;
      }
    }
    
    .alert-content {
      flex: 1;
      
      .goods-name {
        font-size: 15px;
        color: #fef3c7;
        display: block;
        margin-bottom: 8px;
      }
      
      .stock-bar {
        width: 100%;
        height: 6px;
        background: rgba(0, 0, 0, 0.3);
        border-radius: 3px;
        overflow: hidden;
        
        .stock-progress {
          height: 100%;
          background: linear-gradient(90deg, #ef4444, #f59e0b);
          border-radius: 3px;
          transition: width 0.5s;
        }
      }
    }
    
    .stock {
      color: #ef4444;
      font-weight: bold;
      font-size: 20px;
      min-width: 40px;
      text-align: right;
      text-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
    }
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

// 底部装饰
.screen-footer {
  height: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  
  .footer-line {
    width: 80%;
    height: 2px;
    background: linear-gradient(90deg, transparent, rgba(234, 179, 8, 0.5), transparent);
    margin-bottom: 10px;
  }
  
  .footer-text {
    font-size: 13px;
    color: rgba(254, 243, 199, 0.5);
    letter-spacing: 1px;
  }
}

// 过渡动画
.stat-fade-enter-active, .stat-fade-leave-active {
  transition: all 0.5s;
}

.stat-fade-enter, .stat-fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.order-slide-enter-active {
  transition: all 0.4s;
}

.order-slide-enter {
  opacity: 0;
  transform: translateX(-30px);
}

.alert-bounce-enter-active {
  animation: alertBounce 0.5s;
}

@keyframes alertBounce {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
