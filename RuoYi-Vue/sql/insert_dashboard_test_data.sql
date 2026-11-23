-- ============================================
-- 数据大屏测试数据
-- 用于快速插入测试数据以验证大屏功能
-- ============================================

-- 清空现有测试数据（可选，谨慎使用）
-- DELETE FROM cl_order_item;
-- DELETE FROM cl_order;
-- DELETE FROM cl_goods;

-- ============================================
-- 1. 插入商品数据
-- ============================================
INSERT INTO cl_goods (goods_name, goods_type, goods_price, stock, cover_image, description, rating, status, sort_order, create_by, create_time) 
VALUES 
('传统春联-福字', '0', 15.00, 100, '/profile/upload/demo/goods1.jpg', '传统福字春联，寓意吉祥如意', 4.5, '0', 1, 'admin', NOW()),
('传统春联-财源广进', '0', 18.00, 80, '/profile/upload/demo/goods2.jpg', '财源广进春联，寓意财运亨通', 4.8, '0', 2, 'admin', NOW()),
('传统春联-恭喜发财', '0', 20.00, 5, '/profile/upload/demo/goods3.jpg', '恭喜发财春联，适合商家使用（库存预警）', 5.0, '0', 3, 'admin', NOW()),
('定制春联-现场制作', '1', 25.00, 999, '/profile/upload/demo/goods4.jpg', '可定制内容的春联，现场制作', 5.0, '0', 4, 'admin', NOW()),
('高档春联-宣纸版', '0', 35.00, 8, '/profile/upload/demo/goods5.jpg', '高档宣纸春联，质感十足（库存预警）', 4.9, '0', 5, 'admin', NOW()),
('对联套装-门神', '0', 28.00, 3, '/profile/upload/demo/goods6.jpg', '门神对联套装（库存预警）', 4.7, '0', 6, 'admin', NOW()),
('窗花套装', '0', 12.00, 150, '/profile/upload/demo/goods7.jpg', '精美窗花套装', 4.6, '0', 7, 'admin', NOW()),
('福字贴纸', '0', 8.00, 200, '/profile/upload/demo/goods8.jpg', '福字贴纸，多种规格', 4.4, '0', 8, 'admin', NOW());

-- ============================================
-- 2. 插入今日订单数据（用于统计今日订单和销售额）
-- ============================================
INSERT INTO cl_order (order_no, device_id, order_type, total_amount, status, receiver_name, receiver_phone, receiver_address, create_by, create_time)
VALUES 
-- 今日订单（已支付）
('CL20260209001', 'device_001', '0', 88.00, '1', '张三', '13800138000', '北京市朝阳区建国路1号', 'admin', NOW()),
('CL20260209002', 'device_002', '0', 128.00, '1', '李四', '13800138001', '上海市浦东新区世纪大道100号', 'admin', NOW()),
('CL20260209003', 'device_003', '0', 66.00, '0', '王五', '13800138002', '广州市天河区天河路200号', 'admin', NOW()),
('CL20260209004', 'device_004', '1', 188.00, '2', '赵六', '13800138003', '深圳市南山区科技园300号', 'admin', NOW()),
('CL20260209005', 'device_005', '0', 99.00, '1', '钱七', '13800138004', '杭州市西湖区文三路400号', 'admin', NOW()),
('CL20260209006', 'device_006', '0', 156.00, '1', '孙八', '13800138005', '成都市武侯区天府大道500号', 'admin', NOW()),
('CL20260209007', 'device_007', '0', 45.00, '3', '周九', '13800138006', '武汉市洪山区珞喻路600号', 'admin', NOW()),
('CL20260209008', 'device_008', '0', 78.00, '1', '吴十', '13800138007', '南京市玄武区中山路700号', 'admin', NOW()),
('CL20260209009', 'device_009', '0', 234.00, '2', '郑十一', '13800138008', '西安市雁塔区小寨路800号', 'admin', NOW()),
('CL20260209010', 'device_010', '0', 112.00, '1', '王十二', '13800138009', '重庆市渝中区解放碑900号', 'admin', NOW());

-- ============================================
-- 3. 插入订单明细数据（可选）
-- ============================================
-- 为订单1添加明细
INSERT INTO cl_order_item (order_id, goods_id, goods_name, goods_price, quantity, total_price, create_time)
SELECT 
    o.order_id,
    1,
    '传统春联-福字',
    15.00,
    2,
    30.00,
    NOW()
FROM cl_order o WHERE o.order_no = 'CL20260209001';

INSERT INTO cl_order_item (order_id, goods_id, goods_name, goods_price, quantity, total_price, create_time)
SELECT 
    o.order_id,
    2,
    '传统春联-财源广进',
    18.00,
    1,
    18.00,
    NOW()
FROM cl_order o WHERE o.order_no = 'CL20260209001';

-- 为订单2添加明细
INSERT INTO cl_order_item (order_id, goods_id, goods_name, goods_price, quantity, total_price, create_time)
SELECT 
    o.order_id,
    5,
    '高档春联-宣纸版',
    35.00,
    2,
    70.00,
    NOW()
FROM cl_order o WHERE o.order_no = 'CL20260209002';

-- ============================================
-- 4. 验证数据
-- ============================================
-- 查看商品数据
SELECT '商品数据' as '表名', COUNT(*) as '记录数' FROM cl_goods
UNION ALL
SELECT '订单数据', COUNT(*) FROM cl_order
UNION ALL
SELECT '订单明细', COUNT(*) FROM cl_order_item;

-- 查看今日订单统计
SELECT 
    '今日订单数' as '统计项',
    COUNT(*) as '数值'
FROM cl_order 
WHERE DATE(create_time) = CURDATE();

-- 查看今日销售额
SELECT 
    '今日销售额' as '统计项',
    CONCAT('¥', IFNULL(SUM(total_amount), 0)) as '数值'
FROM cl_order 
WHERE DATE(create_time) = CURDATE() 
AND status IN ('1', '2', '3');

-- 查看库存预警
SELECT 
    '库存预警' as '统计项',
    COUNT(*) as '数值'
FROM cl_goods 
WHERE stock < 10 
AND status = '0';

-- 查看最近订单
SELECT 
    order_no as '订单号',
    total_amount as '金额',
    CASE status
        WHEN '0' THEN '待支付'
        WHEN '1' THEN '已支付'
        WHEN '2' THEN '制作中'
        WHEN '3' THEN '已完成'
        WHEN '4' THEN '已取消'
        ELSE '未知'
    END as '状态',
    create_time as '创建时间'
FROM cl_order 
ORDER BY create_time DESC 
LIMIT 5;

-- 查看库存预警商品
SELECT 
    goods_name as '商品名称',
    stock as '库存',
    goods_price as '价格'
FROM cl_goods 
WHERE stock < 10 
AND status = '0'
ORDER BY stock ASC;

-- ============================================
-- 完成提示
-- ============================================
SELECT '✅ 测试数据插入完成！' as '提示';
SELECT '📊 现在可以测试数据大屏了' as '下一步';
SELECT '🚀 重启后端服务，刷新前端页面' as '操作';
