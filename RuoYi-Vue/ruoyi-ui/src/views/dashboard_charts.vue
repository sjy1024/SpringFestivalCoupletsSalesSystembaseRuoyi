<template>
  <div class="dashboard-screen">
    <!-- 背景装饰 -->
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
          <i class="el-icon-s-grid"></i> 切换简洁版
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

      <!-- 顶部统计卡片 -->
      <div class="stats-row">
        <!-- 骨架屏 -->
        <template v-if="loading">
          <div class="stat-card skeleton-card" v-for="i in 5" :key="'skeleton-' + i">
            <div class="skeleton-icon"></div>
            <div class="skeleton-content">
              <div class="skeleton-line skeleton-line-lg"></div>
              <div class="skeleton-line skeleton-line-sm"></div>
            </div>
          </div>
        </template>
        
        <!-- 真实数据 -->
        <template v-else>
          <!-- 基础统计 -->
          <div class="stat-card" v-for="(item, index) in stats" :key="item.label" :style="{ animationDelay: (index * 0.1) + 's' }">
            <div class="stat-icon" :style="{ background: item.color }">
              <i :class="item.icon"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ formatAnimatedNumber(index) }}</div>
              <div class="stat-label">{{ item.label }}</div>
            </div>
            <div class="stat-wave" :style="{ background: item.color }"></div>
          </div>
          
          <!-- 定制订单统计 -->
          <div class="stat-card" :style="{ animationDelay: '0.3s' }">
            <div class="stat-icon" style="background: #8b5cf6">
              <i class="el-icon-edit"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ customOrderStats.total_count || 0 }}</div>
              <div class="stat-label">定制订单</div>
              <div class="stat-subtext">
                <span class="status-badge processing">{{ customOrderStats.processing_count || 0 }}制作中</span>
                <span class="status-badge pending">{{ customOrderStats.pending_count || 0 }}待接单</span>
              </div>
            </div>
            <div class="stat-wave" style="background: #8b5cf6"></div>
          </div>
          
          <!-- AI对话统计 -->
          <div class="stat-card" :style="{ animationDelay: '0.4s' }">
            <div class="stat-icon" style="background: #06b6d4">
              <i class="el-icon-chat-dot-round"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ aiChatStats.total_chats || 0 }}</div>
              <div class="stat-label">AI对话</div>
              <div class="stat-subtext">
                <span class="ai-stat">{{ aiChatStats.unique_sessions || 0 }}个会话</span>
                <span class="ai-stat">{{ Math.round(aiChatStats.avg_response_time || 0) }}ms响应</span>
              </div>
            </div>
            <div class="stat-wave" style="background: #06b6d4"></div>
          </div>
        </template>
      </div>

      <!-- 图表区域 -->
      <div class="charts-container">
        <!-- 左侧列 -->
        <div class="chart-column left-column">
          <!-- 销售趋势图 -->
          <div class="chart-card">
            <div class="chart-header">
              <i class="el-icon-data-line"></i>
              <span>销售趋势</span>
              <div class="header-line"></div>
            </div>
            <div ref="salesChart" class="chart-content"></div>
          </div>
        </div>

        <!-- 中间列 -->
        <div class="chart-column center-column">
          <!-- 订单状态分布 -->
          <div class="chart-card">
            <div class="chart-header">
              <i class="el-icon-pie-chart"></i>
              <span>订单状态分布</span>
              <div class="header-line"></div>
            </div>
            <div ref="orderStatusChart" class="chart-content"></div>
          </div>

          <!-- 最近订单列表 -->
          <div class="chart-card order-card">
            <div class="chart-header">
              <i class="el-icon-document"></i>
              <span>最近订单</span>
              <div class="header-line"></div>
              <span class="header-badge">{{ orders.length }}</span>
            </div>
            <div class="order-list-scroll">
              <div class="order-item" v-for="order in orders" :key="order.id">
                <div class="order-icon">
                  <i class="el-icon-shopping-cart-2"></i>
                </div>
                <div class="order-info">
                  <span class="order-no">{{ order.orderNo }}</span>
                  <span class="order-time">刚刚</span>
                </div>
                <span class="order-amount">¥{{ order.amount }}</span>
                <span class="order-status" :class="getStatusClass(order.status)">
                  {{ order.status }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧列 -->
        <div class="chart-column right-column">
          <!-- 热门商品排行 -->
          <div class="chart-card">
            <div class="chart-header">
              <i class="el-icon-s-data"></i>
              <span>热门商品排行</span>
              <div class="header-line"></div>
            </div>
            <div ref="hotGoodsChart" class="chart-content"></div>
          </div>

          <!-- 库存预警 -->
          <div class="chart-card alert-card">
            <div class="chart-header">
              <i class="el-icon-warning"></i>
              <span>库存预警</span>
              <div class="header-line"></div>
              <span class="header-badge warning">{{ alerts.length }}</span>
            </div>
            <div class="alert-list-scroll">
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
import * as echarts from 'echarts'

export default {
  name: 'DashboardCharts',
  data() {
    return {
      currentTime: '',
      timer: null,
      refreshTimer: null,
      stats: [],
      orders: [],
      alerts: [],
      weeklySales: [],
      orderStatusDistribution: [],
      hotGoodsRanking: [],
      customOrderStats: {},
      aiChatStats: {},
      loading: true,
      animatedNumbers: {},
      refreshing: false,
      // 图表实例
      salesChart: null,
      orderStatusChart: null,
      hotGoodsChart: null
    }
  },
  mounted() {
    this.updateTime()
    this.timer = setInterval(this.updateTime, 1000)
    this.loadData()
    this.refreshTimer = setInterval(() => {
      this.refreshing = true
      this.loadData()
    }, 30000)
  },
  beforeDestroy() {
    if (this.timer) clearInterval(this.timer)
    if (this.refreshTimer) clearInterval(this.refreshTimer)
    if (this.salesChart) this.salesChart.dispose()
    if (this.orderStatusChart) this.orderStatusChart.dispose()
    if (this.hotGoodsChart) this.hotGoodsChart.dispose()
  },
  methods: {
    loadData() {
      request({
        url: '/system/dashboard/data',
        method: 'get'
      }).then(response => {
        if (response.code === 200) {
          setTimeout(() => {
            this.stats = response.data.stats || []
            this.orders = response.data.orders || []
            this.alerts = response.data.alerts || []
            this.weeklySales = response.data.weeklySales || []
            this.orderStatusDistribution = response.data.orderStatusDistribution || []
            this.hotGoodsRanking = response.data.hotGoodsRanking || []
            this.customOrderStats = response.data.customOrderStats || {}
            this.aiChatStats = response.data.aiChatStats || {}
            this.loading = false
            this.refreshing = false
            this.animateNumbers()
            this.$nextTick(() => {
              this.initCharts()
            })
          }, 500)
        }
      }).catch(error => {
        console.error('加载数据失败:', error)
        this.loading = false
        this.refreshing = false
      })
    },

    animateNumbers() {
      this.stats.forEach((stat, index) => {
        const value = stat.value
        // 确保value是字符串
        if (typeof value !== 'string') {
          return
        }
        const match = value.match(/[\d.]+/)
        if (match) {
          const targetNumber = parseFloat(match[0])
          this.$set(this.animatedNumbers, index, 0)
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
        const decimalPlaces = match[0].includes('.') ? 2 : 0
        const formattedNumber = animatedValue.toFixed(decimalPlaces)
        return prefix + formattedNumber + suffix
      }
      return value
    },

    initCharts() {
      this.initSalesChart()
      this.initOrderStatusChart()
      this.initHotGoodsChart()
    },
    // 销售趋势图
    initSalesChart() {
      if (this.salesChart) this.salesChart.dispose()
      this.salesChart = echarts.init(this.$refs.salesChart)
      
      // 处理周销售数据
      const weeklyData = this.weeklySales || []
      const dates = weeklyData.map(item => {
        const date = new Date(item.date)
        return `${date.getMonth() + 1}/${date.getDate()}`
      })
      const salesAmounts = weeklyData.map(item => parseFloat(item.sales_amount || 0))
      const orderCounts = weeklyData.map(item => parseInt(item.order_count || 0))
      
      const option = {
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          borderColor: '#eab308',
          textStyle: { color: '#fef3c7' },
          formatter: function(params) {
            let result = `<div style="font-weight: bold; margin-bottom: 5px;">${params[0].axisValue}</div>`
            params.forEach(param => {
              const value = param.seriesName === '销售额' ? `¥${param.value}` : param.value
              result += `<div style="display: flex; align-items: center; margin: 3px 0;">
                <span style="display: inline-block; width: 10px; height: 10px; background: ${param.color}; border-radius: 50%; margin-right: 8px;"></span>
                <span>${param.seriesName}: ${value}</span>
              </div>`
            })
            return result
          }
        },
        legend: {
          data: ['销售额', '订单数'],
          textStyle: { color: '#fef3c7' },
          top: '5%'
        },
        grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
        xAxis: {
          type: 'category',
          data: dates.length > 0 ? dates : ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
          axisLine: { lineStyle: { color: 'rgba(234, 179, 8, 0.3)' } },
          axisLabel: { color: '#fef3c7' }
        },
        yAxis: [
          {
            type: 'value',
            name: '销售额(元)',
            axisLine: { lineStyle: { color: 'rgba(234, 179, 8, 0.3)' } },
            axisLabel: { color: '#fef3c7' },
            splitLine: { lineStyle: { color: 'rgba(234, 179, 8, 0.1)' } }
          },
          {
            type: 'value',
            name: '订单数',
            axisLine: { lineStyle: { color: 'rgba(234, 179, 8, 0.3)' } },
            axisLabel: { color: '#fef3c7' },
            splitLine: { show: false }
          }
        ],
        series: [
          {
            name: '销售额',
            type: 'line',
            smooth: true,
            data: salesAmounts.length > 0 ? salesAmounts : [1200, 1500, 1800, 2200, 2800, 3200, 3800],
            lineStyle: { color: '#eab308', width: 3 },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(234, 179, 8, 0.5)' },
                { offset: 1, color: 'rgba(234, 179, 8, 0.05)' }
              ])
            },
            itemStyle: { color: '#eab308', borderWidth: 2, borderColor: '#fff' },
            emphasis: { itemStyle: { color: '#fbbf24', borderWidth: 3 } },
            animationDuration: 2000,
            animationEasing: 'cubicOut'
          },
          {
            name: '订单数',
            type: 'bar',
            yAxisIndex: 1,
            data: orderCounts.length > 0 ? orderCounts : [12, 15, 18, 22, 28, 32, 38],
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(220, 38, 38, 0.8)' },
                { offset: 1, color: 'rgba(220, 38, 38, 0.2)' }
              ]),
              borderRadius: [4, 4, 0, 0]
            },
            animationDuration: 2000,
            animationEasing: 'elasticOut'
          }
        ]
      }
      this.salesChart.setOption(option)
    },

    // 订单状态饼图
    initOrderStatusChart() {
      if (this.orderStatusChart) this.orderStatusChart.dispose()
      this.orderStatusChart = echarts.init(this.$refs.orderStatusChart)
      
      // 处理订单状态分布数据
      const statusData = this.orderStatusDistribution || []
      const chartData = statusData.map(item => ({
        value: parseInt(item.count || 0),
        name: item.status_name || '未知',
        itemStyle: {
          color: this.getStatusColor(item.status_name)
        }
      }))
      
      // 如果没有数据，使用默认数据
      if (chartData.length === 0) {
        chartData.push(
          { value: 3, name: '待支付', itemStyle: { color: '#fbbf24' } },
          { value: 5, name: '已支付', itemStyle: { color: '#10b981' } },
          { value: 2, name: '制作中', itemStyle: { color: '#3b82f6' } },
          { value: 4, name: '已完成', itemStyle: { color: '#22c55e' } },
          { value: 1, name: '已取消', itemStyle: { color: '#ef4444' } }
        )
      }
      
      const option = {
        tooltip: {
          trigger: 'item',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          borderColor: '#eab308',
          textStyle: { color: '#fef3c7' },
          formatter: '{a}<br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          right: '10%',
          top: 'center',
          textStyle: { color: '#fef3c7' }
        },
        series: [{
          name: '订单状态',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['35%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: 'rgba(0, 0, 0, 0.5)',
            borderWidth: 2
          },
          label: {
            show: true,
            formatter: '{b}: {c}',
            color: '#fef3c7'
          },
          emphasis: {
            label: { show: true, fontSize: '16', fontWeight: 'bold' },
            itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(234, 179, 8, 0.5)' }
          },
          data: chartData,
          animationType: 'scale',
          animationEasing: 'elasticOut',
          animationDelay: function (idx) {
            return idx * 200
          }
        }]
      }
      this.orderStatusChart.setOption(option)
    },
    
    // 获取状态颜色
    getStatusColor(status) {
      const colorMap = {
        '待支付': '#fbbf24',
        '已支付': '#10b981',
        '制作中': '#3b82f6',
        '已完成': '#22c55e',
        '已取消': '#ef4444'
      }
      return colorMap[status] || '#999'
    },

    // 热门商品柱状图
    initHotGoodsChart() {
      if (this.hotGoodsChart) this.hotGoodsChart.dispose()
      this.hotGoodsChart = echarts.init(this.$refs.hotGoodsChart)
      
      // 处理热门商品数据
      const hotGoodsData = this.hotGoodsRanking || []
      const goodsNames = hotGoodsData.map(item => item.name || '未知商品')
      const salesCounts = hotGoodsData.map(item => parseInt(item.sales_count || 0))
      
      // 如果没有数据，使用默认数据
      if (goodsNames.length === 0) {
        goodsNames.push('福字春联', '财源广进', '恭喜发财', '定制春联', '宣纸版')
        salesCounts.push(120, 200, 150, 80, 70)
      }
      
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          borderColor: '#eab308',
          textStyle: { color: '#fef3c7' },
          formatter: function(params) {
            const param = params[0]
            return `<div style="font-weight: bold;">${param.name}</div>
                    <div>销量: ${param.value}</div>`
          }
        },
        grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
        xAxis: {
          type: 'value',
          name: '销量',
          axisLine: { lineStyle: { color: 'rgba(234, 179, 8, 0.3)' } },
          axisLabel: { color: '#fef3c7' },
          splitLine: { lineStyle: { color: 'rgba(234, 179, 8, 0.1)' } }
        },
        yAxis: {
          type: 'category',
          data: goodsNames,
          axisLine: { lineStyle: { color: 'rgba(234, 179, 8, 0.3)' } },
          axisLabel: { 
            color: '#fef3c7',
            formatter: function(value) {
              // 商品名称过长时截断
              return value.length > 8 ? value.substring(0, 8) + '...' : value
            }
          }
        },
        series: [{
          name: '销量',
          type: 'bar',
          data: salesCounts,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#dc2626' },
              { offset: 0.5, color: '#eab308' },
              { offset: 1, color: '#fbbf24' }
            ]),
            borderRadius: [0, 10, 10, 0]
          },
          label: {
            show: true,
            position: 'right',
            color: '#fef3c7',
            formatter: '{c}'
          },
          animationDuration: 2000,
          animationEasing: 'elasticOut',
          animationDelay: function (idx) {
            return idx * 200
          }
        }]
      }
      this.hotGoodsChart.setOption(option)
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
      this.$router.push('/dashboard')
    },
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
  box-shadow: 0 4px 20px rgba(234, 179, 8, 0.3);
  position: relative;
  z-index: 10;
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
      i {
        color: #eab308;
        font-size: 18px;
      }
      .time {
        font-size: 20px;
        color: #fef3c7;
        font-family: 'Courier New', monospace;
        font-weight: bold;
      }
    }
  }
  .header-right {
    display: flex;
    gap: 15px;
    position: relative;
    z-index: 100;
    
    .switch-btn {
      color: #fbbf24;
      font-size: 16px;
      padding: 10px 20px;
      border: 1px solid rgba(234, 179, 8, 0.3);
      border-radius: 20px;
      transition: all 0.3s;
      background: rgba(234, 179, 8, 0.1);
      cursor: pointer;
      position: relative;
      z-index: 101;
      
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
      cursor: pointer;
      position: relative;
      z-index: 101;
      
      &:hover {
        color: #fef3c7;
        background: rgba(234, 179, 8, 0.2);
        border-color: #eab308;
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

// 主内容区
.screen-body {
  min-height: calc(100vh - 140px);
  padding: 20px;
  position: relative;
  z-index: 1;
  overflow-y: auto;
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

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
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

// 统计卡片行
.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

// 骨架屏卡片
.skeleton-card {
  background: linear-gradient(135deg, rgba(20, 0, 0, 0.6), rgba(40, 0, 0, 0.6));
  border: 2px solid rgba(234, 179, 8, 0.3);
  border-radius: 16px;
  padding: 25px;
  display: flex;
  align-items: center;
  gap: 20px;
  
  .skeleton-icon {
    width: 70px;
    height: 70px;
    border-radius: 16px;
    background: linear-gradient(90deg, rgba(255, 255, 255, 0.05) 25%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.05) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
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
      height: 32px;
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

.stat-card {
  background: linear-gradient(135deg, rgba(20, 0, 0, 0.6), rgba(40, 0, 0, 0.6));
  border: 2px solid rgba(234, 179, 8, 0.3);
  border-radius: 16px;
  padding: 25px;
  display: flex;
  align-items: center;
  gap: 20px;
  position: relative;
  overflow: hidden;
  animation: slideInUp 0.6s ease-out both;
  transition: all 0.3s;
  &:hover {
    transform: translateY(-5px);
    border-color: rgba(234, 179, 8, 0.6);
    box-shadow: 0 10px 30px rgba(234, 179, 8, 0.3);
  }
  .stat-icon {
    width: 70px;
    height: 70px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 30px rgba(234, 179, 8, 0.5);
    i {
      font-size: 32px;
      color: white;
    }
  }
  .stat-content {
    flex: 1;
    .stat-value {
      font-size: 36px;
      font-weight: bold;
      color: #fef3c7;
      margin-bottom: 8px;
      text-shadow: 0 0 10px rgba(234, 179, 8, 0.5);
    }
    .stat-label {
      font-size: 16px;
      color: rgba(254, 243, 199, 0.7);
      margin-bottom: 5px;
    }
    .stat-subtext {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 5px;
      .status-badge {
        padding: 3px 8px;
        border-radius: 10px;
        font-size: 12px;
        font-weight: 500;
        &.pending {
          background: rgba(251, 191, 36, 0.2);
          color: #fbbf24;
          border: 1px solid rgba(251, 191, 36, 0.4);
        }
        &.processing {
          background: rgba(59, 130, 246, 0.2);
          color: #3b82f6;
          border: 1px solid rgba(59, 130, 246, 0.4);
        }
      }
      .ai-stat {
        font-size: 12px;
        color: rgba(254, 243, 199, 0.6);
        background: rgba(6, 182, 212, 0.1);
        padding: 3px 8px;
        border-radius: 10px;
        border: 1px solid rgba(6, 182, 212, 0.3);
      }
    }
  }
  .stat-wave {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 4px;
    opacity: 0.5;
    animation: wave 2s ease-in-out infinite;
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes wave {
  0%, 100% {
    transform: scaleX(1);
  }
  50% {
    transform: scaleX(0.8);
  }
}

// 图表容器
.charts-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  height: calc(100% - 180px);
}

.chart-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.chart-card {
  background: linear-gradient(135deg, rgba(20, 0, 0, 0.6), rgba(40, 0, 0, 0.6));
  border: 2px solid rgba(234, 179, 8, 0.3);
  border-radius: 16px;
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  transition: all 0.3s;
  &:hover {
    border-color: rgba(234, 179, 8, 0.5);
    box-shadow: 0 5px 20px rgba(234, 179, 8, 0.2);
  }
  .chart-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 15px;
    i {
      font-size: 20px;
      color: #eab308;
    }
    span {
      font-size: 18px;
      font-weight: bold;
      color: #fbbf24;
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
      &.warning {
        background: rgba(239, 68, 68, 0.2);
        border-color: rgba(239, 68, 68, 0.4);
        color: #ef4444;
      }
    }
  }
  .chart-content {
    flex: 1;
    min-height: 300px;
  }
}

.order-card, .alert-card {
  flex: 0.6;
}

// 订单列表
.order-list-scroll {
  flex: 1;
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
  }
}

.order-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  margin-bottom: 10px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  border-left: 4px solid #eab308;
  transition: all 0.3s;
  &:hover {
    transform: translateX(5px);
    background: rgba(234, 179, 8, 0.1);
  }
  .order-icon {
    width: 40px;
    height: 40px;
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
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 5px;
    .order-no {
      font-size: 14px;
      color: #fef3c7;
    }
    .order-time {
      font-size: 12px;
      color: rgba(254, 243, 199, 0.5);
    }
  }
  .order-amount {
    color: #eab308;
    font-weight: bold;
    font-size: 16px;
  }
  .order-status {
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 12px;
    &.status-pending {
      background: rgba(251, 191, 36, 0.2);
      color: #fbbf24;
    }
    &.status-paid {
      background: rgba(16, 185, 129, 0.2);
      color: #10b981;
    }
    &.status-processing {
      background: rgba(59, 130, 246, 0.2);
      color: #3b82f6;
    }
    &.status-completed {
      background: rgba(34, 197, 94, 0.2);
      color: #22c55e;
    }
    &.status-cancelled {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
    }
  }
}

// 库存预警列表
.alert-list-scroll {
  flex: 1;
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
    background: rgba(239, 68, 68, 0.4);
    border-radius: 3px;
  }
}

.alert-item {
  display: flex;
  align-items: center;
  padding: 15px;
  margin-bottom: 10px;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 10px;
  border-left: 4px solid #ef4444;
  transition: all 0.3s;
  &:hover {
    transform: translateX(5px);
    background: rgba(239, 68, 68, 0.15);
  }
  .alert-pulse {
    width: 40px;
    height: 40px;
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
      animation: alertPulse 2s ease-out infinite;
    }
    i {
      color: #ef4444;
      font-size: 20px;
      position: relative;
      z-index: 1;
    }
  }
  .alert-content {
    flex: 1;
    .goods-name {
      font-size: 14px;
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
    font-size: 18px;
    min-width: 40px;
    text-align: right;
  }
}

@keyframes alertPulse {
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
</style>
