-- =============================================================================
-- 定制订单管理 - 菜单与字典增量脚本（可重复执行）
-- =============================================================================
-- 前提：库中已有「春联商城」一级菜单 parent_id=2000
-- 用法：整文件执行；执行后退出后台重新登录
-- =============================================================================

DELETE FROM sys_role_menu WHERE menu_id IN (2003, 2031, 2032, 2033, 2034);
DELETE FROM sys_menu WHERE menu_id IN (2003, 2031, 2032, 2033, 2034);

INSERT INTO sys_menu (
  menu_id, menu_name, parent_id, order_num, path, component, query, route_name,
  is_frame, is_cache, menu_type, visible, status, perms, icon,
  create_by, create_time, update_by, update_time, remark
) VALUES (
  2003, '定制订单管理', 2000, 3, 'customOrder', 'system/customOrder/index', NULL, '',
  1, 0, 'C', '0', '0', 'system:customOrder:list', 'edit',
  'admin', NOW(), '', NULL, '定制订单管理'
);

INSERT INTO sys_menu (
  menu_id, menu_name, parent_id, order_num, path, component, query, route_name,
  is_frame, is_cache, menu_type, visible, status, perms, icon,
  create_by, create_time, update_by, update_time, remark
) VALUES
(2031, '定制订单查询', 2003, 1, '', NULL, NULL, '', 1, 0, 'F', '0', '0', 'system:customOrder:query',  '#', 'admin', NOW(), '', NULL, ''),
(2032, '定制订单修改', 2003, 2, '', NULL, NULL, '', 1, 0, 'F', '0', '0', 'system:customOrder:edit',   '#', 'admin', NOW(), '', NULL, ''),
(2033, '定制订单删除', 2003, 3, '', NULL, NULL, '', 1, 0, 'F', '0', '0', 'system:customOrder:remove', '#', 'admin', NOW(), '', NULL, ''),
(2034, '定制订单导出', 2003, 4, '', NULL, NULL, '', 1, 0, 'F', '0', '0', 'system:customOrder:export', '#', 'admin', NOW(), '', NULL, '');

INSERT INTO sys_role_menu (role_id, menu_id)
SELECT 2, m.menu_id
FROM sys_menu m
WHERE m.menu_id IN (2003, 2031, 2032, 2033, 2034)
  AND NOT EXISTS (
    SELECT 1 FROM sys_role_menu rm WHERE rm.role_id = 2 AND rm.menu_id = m.menu_id
  );

-- 定制订单状态字典
DELETE FROM sys_dict_data WHERE dict_type = 'cl_custom_order_status';
DELETE FROM sys_dict_type WHERE dict_type = 'cl_custom_order_status';

INSERT INTO sys_dict_type (
  dict_id, dict_name, dict_type, status, create_by, create_time, update_by, update_time, remark
) VALUES (
  10001, '定制订单状态', 'cl_custom_order_status', '0', 'admin', NOW(), '', NULL, '定制订单制作进度'
);

INSERT INTO sys_dict_data (
  dict_code, dict_sort, dict_label, dict_value, dict_type, css_class, list_class, is_default, status,
  create_by, create_time, update_by, update_time, remark
) VALUES
(100011, 1, '待接单', '0', 'cl_custom_order_status', '', 'info',    'Y', '0', 'admin', NOW(), '', NULL, '待商家接单'),
(100012, 2, '制作中', '1', 'cl_custom_order_status', '', 'warning', 'N', '0', 'admin', NOW(), '', NULL, '正在制作'),
(100013, 3, '已完成', '2', 'cl_custom_order_status', '', 'success', 'N', '0', 'admin', NOW(), '', NULL, '制作完成');
