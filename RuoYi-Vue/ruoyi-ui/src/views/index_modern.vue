<template>
  <div class="dashboard-container">
    <!-- 欢迎横幅 -->
    <el-card class="welcome-banner" shadow="never">
      <el-row :gutter="20" type="flex" align="middle">
        <el-col :xs="24" :sm="16">
          <div class="welcome-content">
            <h1 class="welcome-title">
              <i class="el-icon-sunny"></i>
              欢迎回来，{{ userName }}
            </h1>
            <p class="welcome-subtitle">春联商城管理系统 - 让传统文化焕发新生</p>
            <div class="welcome-time">
              <i class="el-icon-time"></i>
              {{ currentTime }}
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="8" class="text-right">
          <img src="@/assets/logo/logo.png" alt="春联" class="welcome-image" @error="handleImageError">
        </el-col>
      </el-row>
    </el-card>

    <!-- 数据统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="12" :sm="12" :md="6" v-for="stat in statistics" :key="stat.id">
        <el-card shadow="hover" class="stat-card" :body-style="{ padding: '20px' }">
          <div class="stat-content">
            <div class="stat-icon" :style="{ background: stat.color }">
              <i :class="stat.icon"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
              <div v-if="stat.trend !== null" class="stat-trend" :class="stat.trend > 0 ? 'trend-up' : 'trend-down'">
                <i :class="stat.trend > 0 ? 'el-icon-top' : 'el-icon-bottom'"></i>
                {{ Math.abs(stat.trend) }}%
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快捷操作 -->
    <el-card class="quick-actions-card" shadow="never">
      <div slot="header" class="card-header">
        <span class="card-title">
          <i class="el-icon-s-grid"></i>
          快捷操作
        </span>
      </div>
      <el-row :gutter="20">
        <el-col :xs="12" :sm="8" :md="6" v-for="action in quickActions" :key="action.id">
          <div class="quick-action-item" @click="handleQuickAction(action)">
            <div class="action-icon-wrapper" :style="{ background: action.color }">
              <i :class="action.icon"></i>
            </div>
            <div class="action-title">{{ action.title }}</div>
            <div class="action-desc">{{ action.desc }}</div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 主要内容区域 -->
    <el-row :gutter="20">
      <!-- 最近订单 -->
      <el-col :xs="24" :lg="12">
        <el-card class="content-card" shadow="never">
          <div slot="header" class="card-header">
            <span class="card-title">
              <i class="el-icon-shopping-cart-2"></i>
              最近订单
            </span>
          </div>
          <el-table :data="recentOrders" style="width: 100%" v-loading="ordersLoading">
            <el-table-column prop="orderNo" label="订单号" width="150" show-overflow-tooltip />
            <el-table-column prop="totalAmount" label="金额" width="100">
              <template slot-scope="scope">
                <span class="price-text">¥{{ scope.row.totalAmount }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template slot-scope="scope">
                <el-tag :type="getOrderStatusType(scope.row.status)" size="small">
                  {{ getOrderStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="时间" show-overflow-tooltip />
          </el-table>
          <div v-if="recentOrders.length === 0 && !ordersLoading" class="empty-data">
            <i class="el-icon-document"></i>
            <p>暂无订单数据</p>
          </div>
        </el-card>
      </el-col>

      <!-- 热门商品 -->
      <el-col :xs="24" :lg="12">
        <el-card class="content-card" shadow="never">
          <div slot="header" class="card-header">
            <span class="card-title">
              <i class="el-icon-goods"></i>
              热门商品
            </span>
          </div>
          <el-table :data="hotGoods" style="width: 100%" v-loading="goodsLoading">
            <el-table-column prop="goodsName" label="商品名称" show-overflow-tooltip />
            <el-table-column prop="goodsPrice" label="价格" width="100">
              <template slot-scope="scope">
                <span class="price-text">¥{{ scope.row.goodsPrice }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="stock" label="库存" width="80" />
            <el-table-column prop="status" label="状态" width="80">
              <template slot-scope="scope">
                <el-tag :type="scope.row.status === '0' ? 'success' : 'info'" size="small">
                  {{ scope.row.status === '0' ? '上架' : '下架' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
          <div v-if="hotGoods.length === 0 && !goodsLoading" class="empty-data">
            <i class="el-icon-goods"></i>
            <p>暂无商品数据</p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 系统信息和公告 -->
    <el-row :gutter="20">
      <el-col :xs="24" :md="12">
        <el-card class="content-card" shadow="never">
          <div slot="header" class="card-header">
            <span class="card-title">
              <i class="el-icon-info"></i>
              平台信息
            </span>
          </div>
          <div class="info-list">
            <div class="info-item" v-for="info in platformInfo" :key="info.label">
              <span class="info-label">
                <i :class="info.icon"></i>
                {{ info.label }}
              </span>
              <span class="info-value">{{ info.value }}</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="12">
        <el-card class="content-card" shadow="never">
          <div slot="header" class="card-header">
            <span class="card-title">
              <i class="el-icon-bell"></i>
              系统公告
            </span>
          </div>
          <div class="notice-list">
            <div class="notice-item" v-for="notice in notices" :key="notice.id">
              <div class="notice-title">
                <el-tag :type="notice.type" size="mini">{{ notice.tag }}</el-tag>
                {{ notice.title }}
              </div>
              <div class="notice-time">{{ notice.time }}</div>
            </div>
          </div>
          <div v-if="notices.length === 0" class="empty-data">
            <i class="el-icon-bell"></i>
            <p>暂无公告</p>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { getDashboardData } from '@/api/dashboard'

export default {
  name: "DashboardModern",
  data() {
    return {
      // 当前时间
      currentTime: '',
      // 用户名
      userName: '管理员',
      // 统计数据
      statistics: [
        {
          id: 1,
          label: '商品总数',
          value: 0,
          icon: 'el-icon-goods',
          color: 'rgba(220, 38, 38, 0.8)',  // 中国红
          trend: null
        },
        {
          id: 2,
          label: '订单总数',
          value: 0,
          icon: 'el-icon-shopping-cart-2',
          color: 'rgba(234, 179, 8, 0.8)',  // 金色
          trend: null
        },
        {
          id: 3,
          label: '今日销售',
          value: '¥0',
          icon: 'el-icon-coin',
          color: 'rgba(239, 68, 68, 0.8)',  // 喜庆红
          trend: null
        },
        {
          id: 4,
          label: '待处理订单',
          value: 0,
          icon: 'el-icon-document',
          color: 'rgba(217, 119, 6, 0.8)',  // 橙金色
          trend: null
        }
      ],
      // 快捷操作
      quickActions: [
        {
          id: 1,
          title: '数据统计',
          desc: '查看数据统计报表',
          icon: 'el-icon-data-line',
          color: 'rgba(220, 38, 38, 0.85)',  // 中国红
          path: '/statistics',
          permission: null
        },
        {
          id: 2,
          title: '数据大屏',
          desc: '可视化数据展示',
          icon: 'el-icon-monitor',
          color: 'rgba(234, 179, 8, 0.85)',  // 金色
          path: '/dashboard',
          permission: null
        },
        {
          id: 3,  // 注意：ID 要根据现有的递增，不要重复
          title: '智能助手',
          desc: 'AI 驱动的智能管理',
          icon: 'el-icon-chat-dot-round',
          color: 'rgba(102, 126, 234, 0.85)',  // 紫色渐变
          path: '/assistant/index',
          permission: null  // 如果需要权限控制，改为 'system:assistant:view'
        }
      ],
      // 最近订单
      recentOrders: [],
      ordersLoading: false,
      // 热门商品
      hotGoods: [],
      goodsLoading: false,
      // 平台信息
      platformInfo: [
        { label: '平台名称', value: '春联商城', icon: 'el-icon-s-promotion' },
        { label: '联系方式', value: '13650638839', icon: 'el-icon-phone' },
        { label: '客服邮箱', value: '2778828799@qq.com', icon: 'el-icon-message' },
        { label: '营业时间', value: '9:00-18:00', icon: 'el-icon-time' }
      ],
      // 系统公告
      notices: [
        {
          id: 1,
          title: '春节促销活动即将开始',
          tag: '活动',
          type: 'danger',
          time: '2026-02-09'
        },
        {
          id: 2,
          title: '系统将于今晚进行维护',
          tag: '通知',
          type: 'warning',
          time: '2026-02-08'
        },
        {
          id: 3,
          title: '新增定制春联功能',
          tag: '更新',
          type: 'success',
          time: '2026-02-07'
        }
      ]
    }
  },
  mounted() {
    this.updateTime()
    this.getUserInfo()
    this.loadDashboardData()
    // 每分钟更新一次时间
    setInterval(this.updateTime, 60000)
  },
  methods: {
    // 更新当前时间
    updateTime() {
      const now = new Date()
      const hours = now.getHours()
      let greeting = '早上好'
      if (hours >= 12 && hours < 18) {
        greeting = '下午好'
      } else if (hours >= 18) {
        greeting = '晚上好'
      }
      
      const dateStr = now.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      })
      
      this.currentTime = `${greeting}，今天是 ${dateStr}`
    },
    
    // 获取用户信息
    getUserInfo() {
      const userInfo = this.$store.state.user
      if (userInfo && userInfo.name) {
        this.userName = userInfo.name
      }
    },
    
    // 加载仪表盘数据
    async loadDashboardData() {
      try {
        const response = await getDashboardData()
        if (response.code !== 200) {
          this.$message.error(response.msg || '加载首页数据失败')
          return
        }
        const data = response.data || {}
        this.applyHomeOverview(data.homeOverview || {})
        this.applyRecentOrders(data.orders || [])
        this.applyHotGoods(data.hotGoodsForHome || [])
      } catch (error) {
        console.error('加载首页数据失败:', error)
        this.$message.error('加载首页数据失败，请检查后端服务')
      }
    },

    applyHomeOverview(overview) {
      this.statistics[0].value = overview.totalGoods ?? 0
      this.statistics[1].value = overview.totalOrders ?? 0
      this.statistics[2].value = this.formatCurrency(overview.todaySales)
      this.statistics[3].value = overview.pendingOrders ?? 0
    },

    applyRecentOrders(orders) {
      this.ordersLoading = true
      this.recentOrders = orders.map(order => ({
        orderNo: order.orderNo,
        totalAmount: order.totalAmount ?? order.amount ?? '0.00',
        status: order.statusCode ?? order.status,
        createTime: order.createTime || ''
      }))
      this.ordersLoading = false
    },

    applyHotGoods(goods) {
      this.goodsLoading = true
      this.hotGoods = goods.map(item => ({
        goodsName: item.goodsName,
        goodsPrice: item.goodsPrice ?? '0.00',
        stock: item.stock ?? 0,
        status: item.status ?? '0'
      }))
      this.goodsLoading = false
    },

    formatCurrency(value) {
      const amount = parseFloat(value || 0)
      return `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    },
    
    // 快捷操作点击
    handleQuickAction(action) {
      if (action.path) {
        this.goToPage(action.path)
      }
    },
    
    // 页面跳转统一处理
    goToPage(path) {
      this.$router.push(path).catch(err => {
        // 如果路由不存在，给出友好提示
        if (err.name === 'NavigationDuplicated') {
          // 已经在当前页面，忽略错误
          return
        }
        console.error('路由跳转失败:', err)
        this.$message.warning('该功能暂未开放，请先在菜单管理中配置相应菜单')
      })
    },
    
    // 获取订单状态类型
    getOrderStatusType(status) {
      const statusMap = {
        '0': 'warning',
        '1': 'primary',
        '2': 'info',
        '3': 'success',
        '4': 'danger',
        '待支付': 'warning',
        '已支付': 'primary',
        '制作中': 'info',
        '已完成': 'success',
        '已取消': 'danger'
      }
      return statusMap[status] || 'info'
    },
    
    // 获取订单状态文本
    getOrderStatusText(status) {
      const statusMap = {
        '0': '待支付',
        '1': '已支付',
        '2': '制作中',
        '3': '已完成',
        '4': '已取消'
      }
      return statusMap[status] || status || '未知'
    },
    
    // 图片加载失败处理
    handleImageError(e) {
      e.target.style.display = 'none'
    }
  }
}
</script>

<style scoped lang="scss">
.dashboard-container {
  padding: 20px;
  background: linear-gradient(to bottom, #fff5f5 0%, #fef2f2 100%);  // 淡红色背景
  min-height: calc(100vh - 84px);
}

// 欢迎横幅 - 中国红主题
.welcome-banner {
  margin-bottom: 20px;
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);  // 中国红渐变
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
  
  ::v-deep .el-card__body {
    padding: 30px;
  }
  
  .welcome-content {
    .welcome-title {
      font-size: 28px;
      font-weight: 600;
      margin: 0 0 10px 0;
      
      i {
        margin-right: 10px;
        color: #fbbf24;  // 金色图标
      }
    }
    
    .welcome-subtitle {
      font-size: 16px;
      opacity: 0.95;
      margin: 0 0 15px 0;
    }
    
    .welcome-time {
      font-size: 14px;
      opacity: 0.9;
      
      i {
        margin-right: 5px;
        color: #fbbf24;  // 金色图标
      }
    }
  }
  
  .welcome-image {
    max-width: 150px;
    height: auto;
    opacity: 0.9;
  }
}

// 统计卡片 - 春节配色
.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  margin-bottom: 20px;
  transition: all 0.3s;
  border: 2px solid rgba(220, 38, 38, 0.1);
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.1);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(220, 38, 38, 0.2);
    border-color: rgba(220, 38, 38, 0.3);
  }
  
  .stat-content {
    display: flex;
    align-items: center;
    
    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 15px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      
      i {
        font-size: 28px;
        color: white;
      }
    }
    
    .stat-info {
      flex: 1;
      
      .stat-value {
        font-size: 24px;
        font-weight: bold;
        color: #dc2626;  // 中国红
        margin-bottom: 5px;
      }
      
      .stat-label {
        font-size: 14px;
        color: #6b7280;
        margin-bottom: 5px;
      }
      
      .stat-trend {
        font-size: 12px;
        
        &.trend-up {
          color: #dc2626;  // 红色表示上涨（喜庆）
        }
        
        &.trend-down {
          color: #9ca3af;  // 灰色表示下降
        }
        
        i {
          margin-right: 2px;
        }
      }
    }
  }
}

// 快捷操作 - 中国风
.quick-actions-card {
  margin-bottom: 20px;
  border: 2px solid rgba(220, 38, 38, 0.1);
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.1);
  
  .quick-action-item {
    text-align: center;
    padding: 20px;
    cursor: pointer;
    transition: all 0.3s;
    border-radius: 8px;
    border: 2px solid transparent;
    
    &:hover {
      background: linear-gradient(to bottom, #fef2f2, #fff);
      transform: translateY(-3px);
      border-color: rgba(220, 38, 38, 0.2);
      box-shadow: 0 4px 12px rgba(220, 38, 38, 0.15);
      
      .action-icon-wrapper {
        transform: scale(1.1);
      }
    }
    
    .action-icon-wrapper {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 10px;
      transition: all 0.3s;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      
      i {
        font-size: 28px;
        color: white;
      }
    }
    
    .action-title {
      font-size: 16px;
      font-weight: 600;
      color: #dc2626;  // 中国红
      margin-bottom: 5px;
    }
    
    .action-desc {
      font-size: 12px;
      color: #6b7280;
    }
  }
}

// 内容卡片 - 春节风格
.content-card {
  margin-bottom: 20px;
  border: 2px solid rgba(220, 38, 38, 0.1);
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.1);
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .card-title {
      font-size: 16px;
      font-weight: 600;
      color: #dc2626;  // 中国红
      
      i {
        margin-right: 8px;
        color: #eab308;  // 金色图标
      }
    }
  }
  
  .price-text {
    color: #dc2626;  // 中国红
    font-weight: 600;
  }
  
  .empty-data {
    text-align: center;
    padding: 40px 0;
    color: #9ca3af;
    
    i {
      font-size: 48px;
      margin-bottom: 10px;
      display: block;
      color: #fca5a5;  // 淡红色
    }
    
    p {
      margin: 0;
      font-size: 14px;
    }
  }
}

// 信息列表 - 中国风
.info-list {
  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid rgba(220, 38, 38, 0.1);
    
    &:last-child {
      border-bottom: none;
    }
    
    .info-label {
      color: #4b5563;
      font-size: 14px;
      
      i {
        margin-right: 8px;
        color: #dc2626;  // 中国红图标
      }
    }
    
    .info-value {
      color: #1f2937;
      font-weight: 500;
      font-size: 14px;
    }
  }
}

// 公告列表 - 春节风格
.notice-list {
  .notice-item {
    padding: 12px 0;
    border-bottom: 1px solid rgba(220, 38, 38, 0.1);
    
    &:last-child {
      border-bottom: none;
    }
    
    .notice-title {
      font-size: 14px;
      color: #1f2937;
      margin-bottom: 5px;
      
      .el-tag {
        margin-right: 8px;
      }
    }
    
    .notice-time {
      font-size: 12px;
      color: #9ca3af;
    }
  }
}

// 响应式
@media (max-width: 768px) {
  .dashboard-container {
    padding: 10px;
  }
  
  .welcome-banner {
    ::v-deep .el-card__body {
      padding: 20px;
    }
    
    .welcome-content {
      .welcome-title {
        font-size: 22px;
      }
      
      .welcome-subtitle {
        font-size: 14px;
      }
    }
    
    .text-right {
      text-align: center !important;
      margin-top: 15px;
    }
  }
  
  .stat-card {
    .stat-content {
      .stat-icon {
        width: 50px;
        height: 50px;
        
        i {
          font-size: 24px;
        }
      }
      
      .stat-info {
        .stat-value {
          font-size: 20px;
        }
      }
    }
  }
}

.text-right {
  text-align: right;
}
</style>
