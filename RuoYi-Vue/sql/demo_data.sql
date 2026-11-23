-- ============================================
-- 春联售卖系统 - 演示数据
-- ============================================

-- 清空现有数据（可选）
-- DELETE FROM cl_goods;
-- DELETE FROM cl_order;
-- DELETE FROM cl_order_item;

-- 插入演示商品数据
INSERT INTO cl_goods (goods_name, goods_type, goods_price, stock, cover_image, description, rating, status, sort_order, create_by, create_time) 
VALUES 
('传统春联-福字', '0', 15.00, 100, '/profile/upload/demo/goods1.jpg', '传统福字春联，寓意吉祥如意', 4.5, '0', 1, 'admin', NOW()),
('传统春联-财源广进', '0', 18.00, 80, '/profile/upload/demo/goods2.jpg', '财源广进春联，寓意财运亨通', 4.8, '0', 2, 'admin', NOW()),
('传统春联-恭喜发财', '0', 20.00, 60, '/profile/upload/demo/goods3.jpg', '恭喜发财春联，适合商家使用', 5.0, '0', 3, 'admin', NOW()),
('定制春联-现场制作', '1', 25.00, 999, '/profile/upload/demo/goods4.jpg', '可定制内容的春联，现场制作', 5.0, '0', 4, 'admin', NOW()),
('高档春联-宣纸版', '0', 35.00, 50, '/profile/upload/demo/goods5.jpg', '高档宣纸春联，质感十足', 4.9, '0', 5, 'admin', NOW());

-- 插入演示订单数据（可选）
-- INSERT INTO cl_order (order_no, device_id, order_type, total_amount, status, receiver_name, receiver_phone, receiver_address, create_time)
-- VALUES 
-- ('CL20260203001', 'device_test_001', '0', 15.00, '1', '张三', '13800138000', '北京市朝阳区', NOW()),
-- ('CL20260203002', 'device_test_002', '0', 18.00, '0', '李四', '13800138001', '上海市浦东新区', NOW());
