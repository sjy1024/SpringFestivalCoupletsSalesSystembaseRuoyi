-- =============================================================================
-- 春联商城 - 后台导航菜单恢复脚本
-- =============================================================================
-- 原因：ry_20250522.sql / all_in_one_merged.sql 会 DROP 并重建 sys_menu，
--       只含若依默认菜单；商品/订单菜单是代码生成器写入库的，重跑基础库后会丢失。
--
-- 用法：在「已有业务表 cl_*」的库上执行本脚本即可，勿再整库重跑 ry_20250522.sql。
-- 执行后：退出后台重新登录（或清浏览器缓存），侧边栏应出现「春联商城」。
-- =============================================================================

-- 清理本脚本使用的 menu_id 段（2000~2099），可重复执行
DELETE FROM sys_role_menu WHERE menu_id >= 2000 AND menu_id < 2100;
DELETE FROM sys_menu WHERE menu_id >= 2000 AND menu_id < 2100;

-- ----------------------------
-- 一级目录：春联商城
-- ----------------------------
INSERT INTO sys_menu VALUES
(2000, '春联商城', 0, 5, 'mall', NULL, '', '', 1, 0, 'M', '0', '0', '', 'shopping', 'admin', sysdate(), '', NULL, '春联售卖业务');

-- ----------------------------
-- 二级菜单
-- ----------------------------
INSERT INTO sys_menu VALUES
(2001, '商品管理', 2000, 1, 'goods', 'system/goods/index', '', '', 1, 0, 'C', '0', '0', 'system:goods:list', 'goods', 'admin', sysdate(), '', NULL, '商品管理'),
(2002, '订单管理', 2000, 2, 'order', 'system/order/index', '', '', 1, 0, 'C', '0', '0', 'system:order:list', 'shopping', 'admin', sysdate(), '', NULL, '订单管理'),
(2003, '定制订单管理', 2000, 3, 'customOrder', 'system/customOrder/index', '', '', 1, 0, 'C', '0', '0', 'system:customOrder:list', 'edit', 'admin', sysdate(), '', NULL, '定制订单管理');

-- 说明：数据统计(/statistics) 在前端 router 中配置为侧边栏菜单；数据大屏(/dashboard) 从首页快捷入口进入。

-- ----------------------------
-- 商品管理 - 按钮权限（与 ClGoodsController / goods/index.vue 一致）
-- ----------------------------
INSERT INTO sys_menu VALUES
(2011, '商品查询', 2001, 1, '', '', '', '', 1, 0, 'F', '0', '0', 'system:goods:query',  '#', 'admin', sysdate(), '', NULL, ''),
(2012, '商品新增', 2001, 2, '', '', '', '', 1, 0, 'F', '0', '0', 'system:goods:add',    '#', 'admin', sysdate(), '', NULL, ''),
(2013, '商品修改', 2001, 3, '', '', '', '', 1, 0, 'F', '0', '0', 'system:goods:edit',   '#', 'admin', sysdate(), '', NULL, ''),
(2014, '商品删除', 2001, 4, '', '', '', '', 1, 0, 'F', '0', '0', 'system:goods:remove', '#', 'admin', sysdate(), '', NULL, ''),
(2015, '商品导出', 2001, 5, '', '', '', '', 1, 0, 'F', '0', '0', 'system:goods:export', '#', 'admin', sysdate(), '', NULL, '');

-- ----------------------------
-- 订单管理 - 按钮权限（与 ClOrderController / order/index.vue 一致）
-- ----------------------------
INSERT INTO sys_menu VALUES
(2021, '订单查询', 2002, 1, '', '', '', '', 1, 0, 'F', '0', '0', 'system:order:query',  '#', 'admin', sysdate(), '', NULL, ''),
(2022, '订单新增', 2002, 2, '', '', '', '', 1, 0, 'F', '0', '0', 'system:order:add',    '#', 'admin', sysdate(), '', NULL, ''),
(2023, '订单修改', 2002, 3, '', '', '', '', 1, 0, 'F', '0', '0', 'system:order:edit',   '#', 'admin', sysdate(), '', NULL, ''),
(2024, '订单删除', 2002, 4, '', '', '', '', 1, 0, 'F', '0', '0', 'system:order:remove', '#', 'admin', sysdate(), '', NULL, ''),
(2025, '订单导出', 2002, 5, '', '', '', '', 1, 0, 'F', '0', '0', 'system:order:export', '#', 'admin', sysdate(), '', NULL, '');

-- ----------------------------
-- 定制订单管理 - 按钮权限（与 ClCustomOrderController / customOrder/index.vue 一致）
-- ----------------------------
INSERT INTO sys_menu VALUES
(2031, '定制订单查询', 2003, 1, '', '', '', '', 1, 0, 'F', '0', '0', 'system:customOrder:query',  '#', 'admin', sysdate(), '', NULL, ''),
(2032, '定制订单修改', 2003, 2, '', '', '', '', 1, 0, 'F', '0', '0', 'system:customOrder:edit',   '#', 'admin', sysdate(), '', NULL, ''),
(2033, '定制订单删除', 2003, 3, '', '', '', '', 1, 0, 'F', '0', '0', 'system:customOrder:remove', '#', 'admin', sysdate(), '', NULL, ''),
(2034, '定制订单导出', 2003, 4, '', '', '', '', 1, 0, 'F', '0', '0', 'system:customOrder:export', '#', 'admin', sysdate(), '', NULL, '');

-- ----------------------------
-- 为「普通角色」role_id=2 授权（admin 账号拥有 *:*:*，可不依赖 role_menu）
-- 若你库中普通角色不是 2，请改 WHERE 中的 role_id
-- ----------------------------
INSERT INTO sys_role_menu (role_id, menu_id)
SELECT 2, m.menu_id
FROM sys_menu m
WHERE m.menu_id >= 2000 AND m.menu_id < 2100
  AND NOT EXISTS (
    SELECT 1 FROM sys_role_menu rm WHERE rm.role_id = 2 AND rm.menu_id = m.menu_id
  );

-- ----------------------------
-- 定制订单状态字典（与 customOrder/index.vue dicts 一致）
-- ----------------------------
DELETE FROM sys_dict_data WHERE dict_type = 'cl_custom_order_status';
DELETE FROM sys_dict_type WHERE dict_type = 'cl_custom_order_status';

INSERT INTO sys_dict_type VALUES
(10001, '定制订单状态', 'cl_custom_order_status', '0', 'admin', sysdate(), '', NULL, '定制订单制作进度');

INSERT INTO sys_dict_data VALUES
(100011, 1, '待接单', '0', 'cl_custom_order_status', '', 'info',    'Y', '0', 'admin', sysdate(), '', NULL, '待商家接单'),
(100012, 2, '制作中', '1', 'cl_custom_order_status', '', 'warning', 'N', '0', 'admin', sysdate(), '', NULL, '正在制作'),
(100013, 3, '已完成', '2', 'cl_custom_order_status', '', 'success', 'N', '0', 'admin', sysdate(), '', NULL, '制作完成');
