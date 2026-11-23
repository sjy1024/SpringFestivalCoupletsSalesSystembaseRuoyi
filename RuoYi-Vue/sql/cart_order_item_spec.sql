-- 购物车/订单明细增加规格快照字段（与 cl_goods.spec_options 对应）

SET @db := DATABASE();

-- cl_cart.item_spec
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'cl_cart' AND COLUMN_NAME = 'item_spec'
);
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE cl_cart ADD COLUMN item_spec VARCHAR(500) NOT NULL DEFAULT '''' COMMENT ''规格快照JSON'' AFTER quantity',
  'SELECT ''cl_cart.item_spec already exists'' AS msg'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 调整购物车唯一索引：同商品不同规格可并存
SET @idx_exists := (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'cl_cart' AND INDEX_NAME = 'uk_device_goods'
);
SET @sql := IF(@idx_exists > 0,
  'ALTER TABLE cl_cart DROP INDEX uk_device_goods',
  'SELECT ''uk_device_goods not found'' AS msg'
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
  'SELECT ''uk_device_goods_spec already exists'' AS msg'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- cl_order_item.item_spec
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'cl_order_item' AND COLUMN_NAME = 'item_spec'
);
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE cl_order_item ADD COLUMN item_spec VARCHAR(500) DEFAULT NULL COMMENT ''规格快照JSON'' AFTER total_price',
  'SELECT ''cl_order_item.item_spec already exists'' AS msg'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
