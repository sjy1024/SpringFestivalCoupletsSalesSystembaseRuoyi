-- 订单取消商家审核字段（可重复执行）
-- cancel_status: 0无申请 1待商家审核 2已同意 3已拒绝

SET @db := DATABASE();

SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'cl_order' AND COLUMN_NAME = 'cancel_status'
);
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE cl_order ADD COLUMN cancel_status CHAR(1) DEFAULT ''0'' COMMENT ''取消审核状态(0无 1待审核 2已同意 3已拒绝)'' AFTER status',
  'SELECT ''cancel_status already exists'' AS msg'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'cl_order' AND COLUMN_NAME = 'cancel_reason'
);
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE cl_order ADD COLUMN cancel_reason VARCHAR(500) DEFAULT NULL COMMENT ''用户取消申请原因'' AFTER cancel_status',
  'SELECT ''cancel_reason already exists'' AS msg'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

UPDATE cl_order SET cancel_status = '0' WHERE cancel_status IS NULL;
