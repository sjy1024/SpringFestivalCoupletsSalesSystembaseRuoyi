-- =============================================================================
-- 智能助手：菜单与按钮权限（与 AdminAssistantController @PreAuthorize 对齐）
-- =============================================================================
-- 依赖：已执行若依基础库（含 sys_menu / sys_role_menu 表结构）。
-- 超级管理员（admin）在代码中拥有 *:*:*，可不分配 role_menu 也能调用接口；
-- 普通角色需在「角色管理」中勾选本脚本插入的菜单/按钮，或执行下方可选授权。
--
-- 与 LM Studio 联调：先在本机开启 Local Server（默认 1234），模型 id 与
-- ruoyi-admin application.yml 中 ruoyi.openaiApi.model 保持一致。
-- =============================================================================

-- 主菜单（C）：挂在「系统管理」下，order_num=10 避免与若依默认二级菜单序号冲突
INSERT INTO sys_menu (
  menu_name, parent_id, order_num, path, component, query, route_name,
  is_frame, is_cache, menu_type, visible, status, perms, icon,
  create_by, create_time, update_by, update_time, remark
) VALUES (
  '智能助手', 1, 10, 'assistant', 'system/assistant/index', NULL, '',
  1, 0, 'C', '0', '0', 'system:assistant:view', 'guide',
  'admin', sysdate(), '', NULL, '管理端 AI 助手（LM Studio OpenAI 兼容）'
);

SET @assistant_menu_id := LAST_INSERT_ID();

-- 按钮（F）
INSERT INTO sys_menu (
  menu_name, parent_id, order_num, path, component, query, route_name,
  is_frame, is_cache, menu_type, visible, status, perms, icon,
  create_by, create_time, update_by, update_time, remark
) VALUES
('智能对话', @assistant_menu_id, 1, '', '', NULL, '', 1, 0, 'F', '0', '0', 'system:assistant:chat', '#', 'admin', sysdate(), '', NULL, '流式/普通对话'),
('智能分析', @assistant_menu_id, 2, '', '', NULL, '', 1, 0, 'F', '0', '0', 'system:assistant:analyze', '#', 'admin', sysdate(), '', NULL, '订单/库存/商品建议'),
('删除历史', @assistant_menu_id, 3, '', '', NULL, '', 1, 0, 'F', '0', '0', 'system:assistant:delete', '#', 'admin', sysdate(), '', NULL, '删除对话历史');

-- 可选：为「普通角色」role_id=2 授权（与 ry_20250522.sql 初始化一致；若你库中角色 ID 不同请改数字）
INSERT INTO sys_role_menu (role_id, menu_id)
SELECT 2, m.menu_id FROM sys_menu m
WHERE (m.menu_id = @assistant_menu_id OR m.parent_id = @assistant_menu_id)
  AND NOT EXISTS (
    SELECT 1 FROM sys_role_menu rm WHERE rm.role_id = 2 AND rm.menu_id = m.menu_id
  );
