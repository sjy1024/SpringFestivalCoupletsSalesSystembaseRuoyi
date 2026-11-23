<template>
  <div class="app-container statistics-page" v-loading="loading">
    <!-- 工具栏 -->
    <el-row :gutter="10" class="toolbar-row">
      <el-col :span="16">
        <h2 class="page-title">
          <i class="el-icon-data-line"></i>
          数据统计
        </h2>
        <p class="page-desc">春联商城运营数据报表 · 销售趋势、订单分析、库存预警</p>
      </el-col>
      <el-col :span="8" class="toolbar-actions">
        <el-button icon="el-icon-refresh" size="small" :loading="refreshing" @click="handleRefresh">刷新数据</el-button>
        <el-button type="primary" icon="el-icon-monitor" size="small" plain @click="$router.push('/dashboard')">数据大屏</el-button>
      </el-col>
    </el-row>

    <!-- 概览卡片 -->
    <el-row :gutter="16" class="stat-row">
      <el-col :xs="12" :sm="8" :md="4" v-for="card in overviewCards" :key="card.key">
        <el-card shadow="hover" class="stat-card" :body-style="{ padding: '16px' }">
          <div class="stat-card-inner">
            <div class="stat-icon" :style="{ background: card.color }">
              <i :class="card.icon"></i>
            </div>
            <div class="stat-body">
              <div class="stat-value">{{ card.value }}</div>
              <div class="stat-label">{{ card.label }}</div>
              <div class="stat-hint" v-if="card.hint">{{ card.hint }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区 -->
    <el-row :gutter="16" class="chart-row">
      <el-col :xs="24" :lg="14">
        <el-card shadow="never" class="chart-card">
          <div slot="header" class="card-header">
            <span><i class="el-icon-data-line"></i> 近7天销售趋势</span>
            <el-tag size="mini" type="info">已支付/制作中/已完成</el-tag>
          </div>
          <div ref="salesChart" class="chart-box"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="10">
        <el-card shadow="never" class="chart-card">
          <div slot="header" class="card-header">
            <span><i class="el-icon-pie-chart"></i> 近30天订单状态分布</span>
          </div>
          <div ref="orderStatusChart" class="chart-box"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="chart-row">
      <el-col :span="24">
        <el-card shadow="never" class="chart-card">
          <div slot="header" class="card-header">
            <span><i class="el-icon-s-data"></i> 近30天热销商品 TOP10</span>
          </div>
          <div ref="hotGoodsChart" class="chart-box chart-box-lg"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 业务扩展统计 -->
    <el-row :gutter="16" class="extra-row">
      <el-col :xs="24" :md="12">
        <el-card shadow="never">
          <div slot="header" class="card-header">
            <span><i class="el-icon-edit-outline"></i> 定制订单统计（近30天）</span>
          </div>
          <el-row :gutter="12" class="extra-stats">
            <el-col :span="6" v-for="item in customStats" :key="item.label">
              <div class="extra-stat-item">
                <div class="extra-value" :style="{ color: item.color }">{{ item.value }}</div>
                <div class="extra-label">{{ item.label }}</div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="12">
        <el-card shadow="never">
          <div slot="header" class="card-header">
            <span><i class="el-icon-chat-dot-round"></i> AI 助手统计（近7天）</span>
          </div>
          <el-row :gutter="12" class="extra-stats">
            <el-col :span="8" v-for="item in aiStats" :key="item.label">
              <div class="extra-stat-item">
                <div class="extra-value" :style="{ color: item.color }">{{ item.value }}</div>
                <div class="extra-label">{{ item.label }}</div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据表格 -->
    <el-row :gutter="16" class="table-row">
      <el-col :xs="24" :lg="14">
        <el-card shadow="never">
          <div slot="header" class="card-header">
            <span><i class="el-icon-document"></i> 最近订单</span>
            <el-button type="text" size="mini" @click="$router.push('/mall/order')">查看全部</el-button>
          </div>
          <el-table :data="orders" size="small" stripe>
            <el-table-column prop="orderNo" label="订单号" min-width="140" show-overflow-tooltip />
            <el-table-column prop="amount" label="金额" width="100">
              <template slot-scope="scope">
                <span class="price-text">¥{{ scope.row.amount }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template slot-scope="scope">
                <el-tag :type="getStatusTagType(scope.row.status)" size="mini">{{ scope.row.status }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-if="!loading && orders.length === 0" description="暂无订单数据" :image-size="80" />
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="10">
        <el-card shadow="never">
          <div slot="header" class="card-header">
            <span><i class="el-icon-warning-outline"></i> 库存预警（库存 &lt; 10）</span>
            <el-tag type="danger" size="mini" v-if="alerts.length">{{ alerts.length }} 件</el-tag>
          </div>
          <el-table :data="alerts" size="small" stripe>
            <el-table-column prop="name" label="商品名称" min-width="120" show-overflow-tooltip />
            <el-table-column prop="stock" label="库存" width="80">
              <template slot-scope="scope">
                <span :class="{ 'stock-danger': scope.row.stock < 5 }">{{ scope.row.stock }}</span>
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-if="!loading && alerts.length === 0" description="库存充足，暂无预警" :image-size="80" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { getDashboardData } from '@/api/dashboard'

const STATUS_COLORS = {
  '待支付': '#e6a23c',
  '已支付': '#67c23a',
  '制作中': '#409eff',
  '已完成': '#909399',
  '已取消': '#f56c6c',
  '未知': '#c0c4cc'
}

export default {
  name: 'Statistics',
  data() {
    return {
      loading: true,
      refreshing: false,
      stats: [],
      orders: [],
      alerts: [],
      weeklySales: [],
      orderStatusDistribution: [],
      hotGoodsRanking: [],
      customOrderStats: {},
      aiChatStats: {},
      salesChart: null,
      orderStatusChart: null,
      hotGoodsChart: null
    }
  },
  computed: {
    overviewCards() {
      const base = (this.stats || []).map((item, index) => ({
        key: 'stat-' + index,
        label: item.label,
        value: item.value,
        icon: item.icon || 'el-icon-data-line',
        color: item.color || '#409eff',
        hint: ''
      }))
      const custom = this.customOrderStats || {}
      const ai = this.aiChatStats || {}
      return [
        ...base,
        {
          key: 'custom',
          label: '定制订单',
          value: custom.total_count || 0,
          icon: 'el-icon-edit',
          color: '#8b5cf6',
          hint: `${custom.processing_count || 0} 制作中`
        },
        {
          key: 'ai',
          label: 'AI 对话',
          value: ai.total_chats || 0,
          icon: 'el-icon-chat-dot-round',
          color: '#06b6d4',
          hint: `${ai.unique_sessions || 0} 个会话`
        }
      ]
    },
    customStats() {
      const s = this.customOrderStats || {}
      return [
        { label: '总数', value: s.total_count || 0, color: '#8b5cf6' },
        { label: '待接单', value: s.pending_count || 0, color: '#e6a23c' },
        { label: '制作中', value: s.processing_count || 0, color: '#409eff' },
        { label: '已完成', value: s.completed_count || 0, color: '#67c23a' }
      ]
    },
    aiStats() {
      const s = this.aiChatStats || {}
      return [
        { label: '对话总数', value: s.total_chats || 0, color: '#06b6d4' },
        { label: '独立会话', value: s.unique_sessions || 0, color: '#409eff' },
        { label: '平均响应(ms)', value: Math.round(s.avg_response_time || 0), color: '#67c23a' }
      ]
    }
  },
  mounted() {
    this.loadData()
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
    this.disposeCharts()
  },
  methods: {
    handleRefresh() {
      this.refreshing = true
      this.loadData()
    },
    loadData() {
      if (!this.refreshing) {
        this.loading = true
      }
      getDashboardData().then(response => {
        if (response.code === 200) {
          const data = response.data || {}
          this.stats = data.stats || []
          this.orders = data.orders || []
          this.alerts = data.alerts || []
          this.weeklySales = data.weeklySales || []
          this.orderStatusDistribution = data.orderStatusDistribution || []
          this.hotGoodsRanking = data.hotGoodsRanking || []
          this.customOrderStats = data.customOrderStats || {}
          this.aiChatStats = data.aiChatStats || {}
          this.$nextTick(() => {
            this.initCharts()
          })
        } else {
          this.$message.error(response.msg || '加载统计数据失败')
        }
      }).catch(() => {
        this.$message.error('加载统计数据失败，请检查后端服务')
      }).finally(() => {
        this.loading = false
        this.refreshing = false
      })
    },
    initCharts() {
      this.initSalesChart()
      this.initOrderStatusChart()
      this.initHotGoodsChart()
    },
    initSalesChart() {
      if (!this.$refs.salesChart) return
      if (this.salesChart) this.salesChart.dispose()
      this.salesChart = echarts.init(this.$refs.salesChart)

      const dates = this.weeklySales.map(item => {
        const d = new Date(item.date)
        return `${d.getMonth() + 1}/${d.getDate()}`
      })
      const salesAmounts = this.weeklySales.map(item => parseFloat(item.sales_amount || 0))
      const orderCounts = this.weeklySales.map(item => parseInt(item.order_count || 0))

      this.salesChart.setOption({
        tooltip: { trigger: 'axis' },
        legend: { data: ['销售额', '订单数'], top: 0 },
        grid: { left: '3%', right: '4%', bottom: '3%', top: '40px', containLabel: true },
        xAxis: {
          type: 'category',
          data: dates.length ? dates : ['暂无数据'],
          boundaryGap: false
        },
        yAxis: [
          { type: 'value', name: '销售额(元)' },
          { type: 'value', name: '订单数', splitLine: { show: false } }
        ],
        series: [
          {
            name: '销售额',
            type: 'line',
            smooth: true,
            data: salesAmounts.length ? salesAmounts : [0],
            itemStyle: { color: '#dc2626' },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(220, 38, 38, 0.25)' },
                { offset: 1, color: 'rgba(220, 38, 38, 0.02)' }
              ])
            }
          },
          {
            name: '订单数',
            type: 'bar',
            yAxisIndex: 1,
            data: orderCounts.length ? orderCounts : [0],
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#eab308' },
                { offset: 1, color: 'rgba(234, 179, 8, 0.3)' }
              ]),
              borderRadius: [4, 4, 0, 0]
            },
            barMaxWidth: 24
          }
        ]
      })
    },
    initOrderStatusChart() {
      if (!this.$refs.orderStatusChart) return
      if (this.orderStatusChart) this.orderStatusChart.dispose()
      this.orderStatusChart = echarts.init(this.$refs.orderStatusChart)

      const chartData = this.orderStatusDistribution.map(item => ({
        value: parseInt(item.count || 0),
        name: item.status_name || '未知',
        itemStyle: { color: STATUS_COLORS[item.status_name] || '#c0c4cc' }
      }))

      this.orderStatusChart.setOption({
        tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
        legend: { orient: 'vertical', right: 10, top: 'center' },
        series: [{
          type: 'pie',
          radius: ['42%', '68%'],
          center: ['40%', '50%'],
          data: chartData.length ? chartData : [{ value: 0, name: '暂无数据', itemStyle: { color: '#e4e7ed' } }],
          label: { formatter: '{b}\n{d}%' },
          emphasis: {
            itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.2)' }
          }
        }]
      })
    },
    initHotGoodsChart() {
      if (!this.$refs.hotGoodsChart) return
      if (this.hotGoodsChart) this.hotGoodsChart.dispose()
      this.hotGoodsChart = echarts.init(this.$refs.hotGoodsChart)

      const names = this.hotGoodsRanking.map(item => item.name || '未知商品')
      const counts = this.hotGoodsRanking.map(item => parseInt(item.sales_count || 0))

      this.hotGoodsChart.setOption({
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { left: '3%', right: '4%', bottom: '3%', top: '16px', containLabel: true },
        xAxis: {
          type: 'value',
          name: '销量'
        },
        yAxis: {
          type: 'category',
          data: names.length ? names.reverse() : ['暂无数据'],
          axisLabel: { width: 120, overflow: 'truncate' }
        },
        series: [{
          type: 'bar',
          data: counts.length ? counts.reverse() : [0],
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#dc2626' },
              { offset: 1, color: '#f87171' }
            ]),
            borderRadius: [0, 4, 4, 0]
          },
          barMaxWidth: 20
        }]
      })
    },
    getStatusTagType(status) {
      const map = {
        '待支付': 'warning',
        '已支付': 'success',
        '制作中': '',
        '已完成': 'info',
        '已取消': 'danger'
      }
      return map[status] || 'info'
    },
    handleResize() {
      if (this.salesChart) this.salesChart.resize()
      if (this.orderStatusChart) this.orderStatusChart.resize()
      if (this.hotGoodsChart) this.hotGoodsChart.resize()
    },
    disposeCharts() {
      if (this.salesChart) this.salesChart.dispose()
      if (this.orderStatusChart) this.orderStatusChart.dispose()
      if (this.hotGoodsChart) this.hotGoodsChart.dispose()
    }
  }
}
</script>

<style scoped lang="scss">
.statistics-page {
  background: #f5f7fa;
  min-height: calc(100vh - 84px);
}

.toolbar-row {
  margin-bottom: 16px;

  .page-title {
    margin: 0 0 4px;
    font-size: 20px;
    font-weight: 600;
    color: #303133;

    i {
      color: #dc2626;
      margin-right: 6px;
    }
  }

  .page-desc {
    margin: 0;
    font-size: 13px;
    color: #909399;
  }

  .toolbar-actions {
    text-align: right;
    padding-top: 8px;
  }
}

.stat-row {
  margin-bottom: 16px;
}

.stat-card {
  margin-bottom: 12px;
  border-radius: 8px;

  .stat-card-inner {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .stat-icon {
    width: 44px;
    height: 44px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 20px;
    flex-shrink: 0;
  }

  .stat-value {
    font-size: 20px;
    font-weight: 700;
    color: #303133;
    line-height: 1.2;
  }

  .stat-label {
    font-size: 12px;
    color: #909399;
    margin-top: 2px;
  }

  .stat-hint {
    font-size: 11px;
    color: #c0c4cc;
    margin-top: 2px;
  }
}

.chart-row,
.extra-row,
.table-row {
  margin-bottom: 16px;
}

.chart-card {
  margin-bottom: 16px;
  border-radius: 8px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
  color: #303133;

  i {
    margin-right: 6px;
    color: #dc2626;
  }
}

.chart-box {
  height: 320px;
}

.chart-box-lg {
  height: 360px;
}

.extra-stats {
  padding: 8px 0;
}

.extra-stat-item {
  text-align: center;
  padding: 12px 0;

  .extra-value {
    font-size: 24px;
    font-weight: 700;
    line-height: 1.2;
  }

  .extra-label {
    font-size: 12px;
    color: #909399;
    margin-top: 6px;
  }
}

.price-text {
  color: #dc2626;
  font-weight: 600;
}

.stock-danger {
  color: #f56c6c;
  font-weight: 700;
}

@media (max-width: 768px) {
  .toolbar-actions {
    text-align: left !important;
    padding-top: 12px !important;
  }

  .chart-box {
    height: 260px;
  }

  .chart-box-lg {
    height: 300px;
  }
}
</style>
