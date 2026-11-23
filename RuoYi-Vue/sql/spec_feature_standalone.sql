-- ============================================================
-- 商品规格功能 - 独立可执行脚本（可重复执行，不会重复加列）
-- 用途：小程序商品详情尺寸/联纸 与 后台 cl_goods.spec_options 联动
--
-- 使用方式（任选其一）：
--   1. Navicat / DBeaver：选中 ry-vue 库，打开本文件，执行全部
--   2. 命令行：
--        mysql -u root -p ry-vue < spec_feature_standalone.sql
--   3. MySQL 客户端内：
--        USE ry-vue;
--        SOURCE D:/Project2JY/Demo/RuoYi-Vue/sql/spec_feature_standalone.sql;
--
-- 说明：脚本基于当前连接的数据库（DATABASE()），请先 USE 到正确库
-- ============================================================

SET NAMES utf8mb4;
SET @db := DATABASE();

SELECT CONCAT('>>> 当前数据库: ', @db) AS info;

-- ------------------------------------------------------------
-- 1. cl_goods.spec_options（后台商品规格模板）
-- ------------------------------------------------------------
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'cl_goods' AND COLUMN_NAME = 'spec_options'
);
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE cl_goods ADD COLUMN spec_options TEXT DEFAULT NULL COMMENT ''规格选项JSON(尺寸/联纸)'' AFTER description',
  'SELECT ''[跳过] cl_goods.spec_options 已存在'' AS msg'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ------------------------------------------------------------
-- 2. cl_cart.item_spec（购物车规格快照）
-- ------------------------------------------------------------
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'cl_cart' AND COLUMN_NAME = 'item_spec'
);
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE cl_cart ADD COLUMN item_spec VARCHAR(500) NOT NULL DEFAULT '''' COMMENT ''规格快照JSON'' AFTER quantity',
  'SELECT ''[跳过] cl_cart.item_spec 已存在'' AS msg'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 旧索引 uk_device_goods → 新索引 uk_device_goods_spec（同商品不同规格可并存）
SET @idx_exists := (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'cl_cart' AND INDEX_NAME = 'uk_device_goods'
);
SET @sql := IF(@idx_exists > 0,
  'ALTER TABLE cl_cart DROP INDEX uk_device_goods',
  'SELECT ''[跳过] uk_device_goods 不存在'' AS msg'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists := (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'cl_cart' AND INDEX_NAME = 'uk_device_goods_spec'
);
SET @sql := IF(@idx_exists = 0,
  'ALTER TABLE cl_cart ADD UNIQUE KEY uk_device_goods_spec (device_id, goods_id, item_spec(191))',
  'SELECT ''[跳过] uk_device_goods_spec 已存在'' AS msg'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ------------------------------------------------------------
-- 3. cl_order_item.item_spec（订单明细规格快照）
-- ------------------------------------------------------------
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'cl_order_item' AND COLUMN_NAME = 'item_spec'
);
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE cl_order_item ADD COLUMN item_spec VARCHAR(500) DEFAULT NULL COMMENT ''规格快照JSON'' AFTER total_price',
  'SELECT ''[跳过] cl_order_item.item_spec 已存在'' AS msg'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ------------------------------------------------------------
-- 4. 执行结果校验
-- ------------------------------------------------------------
SELECT 'cl_goods.spec_options' AS item,
       IF(COUNT(*) > 0, 'OK', 'MISSING') AS status
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'cl_goods' AND COLUMN_NAME = 'spec_options'

UNION ALL

SELECT 'cl_cart.item_spec',
       IF(COUNT(*) > 0, 'OK', 'MISSING')
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'cl_cart' AND COLUMN_NAME = 'item_spec'

UNION ALL

SELECT 'cl_cart.uk_device_goods_spec',
       IF(COUNT(*) > 0, 'OK', 'MISSING')
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'cl_cart' AND INDEX_NAME = 'uk_device_goods_spec'

UNION ALL

SELECT 'cl_order_item.item_spec',
       IF(COUNT(*) > 0, 'OK', 'MISSING')
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'cl_order_item' AND COLUMN_NAME = 'item_spec';

SELECT '>>> 规格功能 SQL 执行完毕，请重启后端服务' AS done;
