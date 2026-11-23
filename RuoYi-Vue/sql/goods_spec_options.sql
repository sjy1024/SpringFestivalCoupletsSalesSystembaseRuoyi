-- 商品规格选项 JSON（尺寸/联纸，goods_type=1 时使用）

SET @db := DATABASE();

SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'cl_goods' AND COLUMN_NAME = 'spec_options'
);
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE cl_goods ADD COLUMN spec_options TEXT DEFAULT NULL COMMENT ''规格选项JSON(尺寸/联纸)'' AFTER description',
  'SELECT ''spec_options already exists'' AS msg'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
