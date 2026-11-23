/**
 * 智能助手 - 路由配置
 * 
 * 使用方法：
 * 1. 打开 ruoyi-ui/src/router/index.js
 * 2. 找到 constantRoutes 数组
 * 3. 将下面的路由配置添加到数组中
 */

// 方式一：作为独立路由（推荐）
{
  path: '/assistant',
  component: Layout,
  hidden: false,
  children: [
    {
      path: 'index',
      component: () => import('@/views/system/assistant/index'),
      name: 'Assistant',
      meta: { 
        title: '智能助手', 
        icon: 'chat-dot-round',
        noCache: true
      }
    }
  ]
}

// 方式二：作为系统管理的子菜单
// 如果你想把智能助手放在"系统管理"菜单下，可以这样配置：
/*
找到系统管理的路由配置（path: '/system'），在其 children 数组中添加：
{
  path: 'assistant',
  component: () => import('@/views/system/assistant/index'),
  name: 'Assistant',
  meta: { 
    title: '智能助手', 
    icon: 'chat-dot-round',
    noCache: true
  }
}
*/

/**
 * 完整示例（添加到 constantRoutes 数组末尾）：
 */
/*
export const constantRoutes = [
  // ... 其他路由配置 ...
  
  // 智能助手
  {
    path: '/assistant',
    component: Layout,
    hidden: false,
    children: [
      {
        path: 'index',
        component: () => import('@/views/system/assistant/index'),
        name: 'Assistant',
        meta: { 
          title: '智能助手', 
          icon: 'chat-dot-round',
          noCache: true
        }
      }
    ]
  }
]
*/

/**
 * 注意事项：
 * 1. Layout 组件通常已经在文件顶部导入
 * 2. 如果使用方式二，路径应该是 '/system/assistant'
 * 3. icon 可以使用 Element UI 的图标名称
 * 4. noCache: true 表示不缓存页面，每次都重新加载
 */
