/**
 * 智能助手 - 首页快捷入口配置
 * 
 * 使用方法：
 * 1. 打开 ruoyi-ui/src/views/index_modern.vue
 * 2. 找到 quickActions 数组（大约在第 229 行）
 * 3. 将下面的对象添加到数组中
 */

// 添加到 quickActions 数组中
{
  id: 3,  // 注意：ID 要根据现有的递增，不要重复
  title: '智能助手',
  desc: 'AI 驱动的智能管理',
  icon: 'el-icon-chat-dot-round',
  color: 'rgba(102, 126, 234, 0.85)',  // 紫色渐变
  path: '/assistant/index',
  permission: null  // 如果需要权限控制，改为 'system:assistant:view'
}

/**
 * 完整的 quickActions 数组示例：
 */
/*
quickActions: [
  {
    id: 1,
    title: '数据统计',
    desc: '查看数据统计报表',
    icon: 'el-icon-data-line',
    color: 'rgba(220, 38, 38, 0.85)',
    path: '/statistics',
    permission: null
  },
  {
    id: 2,
    title: '数据大屏',
    desc: '可视化数据展示',
    icon: 'el-icon-monitor',
    color: 'rgba(234, 179, 8, 0.85)',
    path: '/dashboard',
    permission: null
  },
  {
    id: 3,
    title: '智能助手',
    desc: 'AI 驱动的智能管理',
    icon: 'el-icon-chat-dot-round',
    color: 'rgba(102, 126, 234, 0.85)',
    path: '/assistant/index',
    permission: null
  }
]
*/
