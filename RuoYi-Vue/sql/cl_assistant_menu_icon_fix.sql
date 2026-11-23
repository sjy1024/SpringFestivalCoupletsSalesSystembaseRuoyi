-- =============================================================================
-- 智能助手 - 菜单图标修复（独立脚本，可重复执行）
-- =============================================================================
-- 问题：菜单 icon 若为 guide / chat-dot-round / 空，侧边栏会无图标或显示错误
-- 正确值：assistant（对应前端 ruoyi-ui/src/assets/icons/svg/assistant.svg）
--
-- 用法（任选其一）：
--   1. Navicat / DBeaver 打开 ry-vue 库，执行本文件
--   2. 命令行：mysql -u root -p ry-vue < sql/cl_assistant_menu_icon_fix.sql
--
-- 执行后：退出后台重新登录（或清浏览器缓存）
-- =============================================================================

UPDATE sys_menu
SET icon = 'assistant',
    update_by = 'admin',
    update_time = NOW()
WHERE menu_type IN ('M', 'C')
  AND (
    menu_name = '智能助手'
    OR perms = 'system:assistant:view'
    OR (path = 'assistant' AND IFNULL(component, '') LIKE '%assistant%')
  )
  AND IFNULL(icon, '') <> 'assistant';

-- 查看是否命中（应显示 icon = assistant）
SELECT menu_id, menu_name, parent_id, path, icon, menu_type, visible, status
FROM sys_menu
WHERE menu_name = '智能助手'
   OR perms = 'system:assistant:view'
   OR (path = 'assistant' AND IFNULL(component, '') LIKE '%assistant%');
