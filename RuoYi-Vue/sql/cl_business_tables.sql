-- ============================================
-- 春联售卖系统 - 业务表结构设计
-- 基于ER图 + 16天开发计划 + 若依框架规范
-- ============================================

-- ----------------------------
-- 1、商品表（物品表）- 主表
-- 支持两种类型：普通商品 + 需要材质尺寸的商品
-- ----------------------------
DROP TABLE IF EXISTS cl_goods;
CREATE TABLE cl_goods (
  goods_id          BIGINT(20)      NOT NULL AUTO_INCREMENT    COMMENT '商品ID',
  goods_name        VARCHAR(100)    NOT NULL                   COMMENT '商品名称',
  goods_type        CHAR(1)         DEFAULT '0'                COMMENT '商品类型（0普通商品 1需要材质尺寸的商品）',
  goods_price       DECIMAL(10,2)   DEFAULT 0.00               COMMENT '商品价格',
  stock             INT(11)         DEFAULT 0                  COMMENT '库存数量',
  cover_image       VARCHAR(255)    DEFAULT ''                 COMMENT '封面图片',
  images            TEXT                                       COMMENT '商品图片（多张，JSON格式）',
  description       TEXT                                       COMMENT '商品描述',
  spec_options      TEXT                                       COMMENT '规格选项JSON(尺寸/联纸)',
  rating            DECIMAL(3,2)    DEFAULT 0.00               COMMENT '评分（0-5分）',
  status            CHAR(1)         DEFAULT '0'                COMMENT '上架状态（0上架 1下架）',
  sort_order        INT(4)          DEFAULT 0                  COMMENT '排序',
  -- 若依标准字段
  create_by         VARCHAR(64)     DEFAULT ''                 COMMENT '创建者',
  create_time       DATETIME                                   COMMENT '创建时间',
  update_by         VARCHAR(64)     DEFAULT ''                 COMMENT '更新者',
  update_time       DATETIME                                   COMMENT '更新时间',
  remark            VARCHAR(500)    DEFAULT NULL               COMMENT '备注',
  PRIMARY KEY (goods_id),
  INDEX idx_type (goods_type),
  INDEX idx_status (status),
  INDEX idx_create_time (create_time)
) ENGINE=INNODB AUTO_INCREMENT=1 COMMENT = '商品表';

-- ----------------------------
-- 2、商品扩展表（需要材质尺寸的商品）
-- 对应ER图中的"其他需要材质尺寸的"子表
-- ----------------------------
DROP TABLE IF EXISTS cl_goods_extend;
CREATE TABLE cl_goods_extend (
  extend_id         BIGINT(20)      NOT NULL AUTO_INCREMENT    COMMENT '扩展ID',
  goods_id          BIGINT(20)      NOT NULL                   COMMENT '商品ID',
  material          VARCHAR(50)     DEFAULT ''                 COMMENT '材质',
  length            DECIMAL(10,2)   DEFAULT NULL               COMMENT '长度(cm)',
  width             DECIMAL(10,2)   DEFAULT NULL               COMMENT '宽度(cm)',
  size              VARCHAR(50)     DEFAULT ''                 COMMENT '尺寸（如：大号/中号/小号）',
  create_time       DATETIME                                   COMMENT '创建时间',
  update_time       DATETIME                                   COMMENT '更新时间',
  PRIMARY KEY (extend_id),
  UNIQUE KEY uk_goods_id (goods_id),
  INDEX idx_goods_id (goods_id)
) ENGINE=INNODB AUTO_INCREMENT=1 COMMENT = '商品扩展表（材质尺寸）';

-- ----------------------------
-- 3、购物车表
-- 对应ER图中的购物车
-- ----------------------------
DROP TABLE IF EXISTS cl_cart;
CREATE TABLE cl_cart (
  cart_id           BIGINT(20)      NOT NULL AUTO_INCREMENT    COMMENT '购物车ID',
  device_id         VARCHAR(64)     NOT NULL                   COMMENT '设备ID（小程序端标识）',
  goods_id          BIGINT(20)      NOT NULL                   COMMENT '商品ID',
  quantity          INT(11)         DEFAULT 1                  COMMENT '数量',
  item_spec         VARCHAR(500)    NOT NULL DEFAULT ''        COMMENT '规格快照JSON',
  -- 若依标准字段
  create_time       DATETIME                                   COMMENT '创建时间',
  update_time       DATETIME                                   COMMENT '更新时间',
  PRIMARY KEY (cart_id),
  INDEX idx_device_id (device_id),
  INDEX idx_goods_id (goods_id),
  UNIQUE KEY uk_device_goods_spec (device_id, goods_id, item_spec(191))
) ENGINE=INNODB AUTO_INCREMENT=1 COMMENT = '购物车表';

-- ----------------------------
-- 4、订单表
-- 对应ER图中的订单
-- ----------------------------
DROP TABLE IF EXISTS cl_order;
CREATE TABLE cl_order (
  order_id          BIGINT(20)      NOT NULL AUTO_INCREMENT    COMMENT '订单ID',
  order_no          VARCHAR(32)     NOT NULL                   COMMENT '订单号',
  device_id         VARCHAR(64)     NOT NULL                   COMMENT '设备ID（小程序端标识）',
  order_type        CHAR(1)         DEFAULT '0'                COMMENT '订单类型（0普通订单 1定制订单）',
  total_amount      DECIMAL(10,2)   DEFAULT 0.00               COMMENT '总价',
  status            CHAR(1)         DEFAULT '0'                COMMENT '订单状态（0待支付 1已支付 2制作中 3已完成 4已取消）',
  cancel_status     CHAR(1)         DEFAULT '0'                COMMENT '取消审核状态(0无 1待审核 2已同意 3已拒绝)',
  cancel_reason     VARCHAR(500)    DEFAULT NULL               COMMENT '用户取消申请原因',
  receiver_name     VARCHAR(50)     DEFAULT ''                 COMMENT '收货人',
  receiver_phone    VARCHAR(20)     DEFAULT ''                 COMMENT '收货电话',
  receiver_address  VARCHAR(200)    DEFAULT ''                 COMMENT '收货地址',
  -- 若依标准字段
  create_by         VARCHAR(64)     DEFAULT ''                 COMMENT '创建者',
  create_time       DATETIME                                   COMMENT '创建时间',
  update_by         VARCHAR(64)     DEFAULT ''                 COMMENT '更新者',
  update_time       DATETIME                                   COMMENT '更新时间',
  remark            VARCHAR(500)    DEFAULT NULL               COMMENT '备注',
  PRIMARY KEY (order_id),
  UNIQUE KEY uk_order_no (order_no),
  INDEX idx_device_id (device_id),
  INDEX idx_status (status),
  INDEX idx_create_time (create_time)
) ENGINE=INNODB AUTO_INCREMENT=1 COMMENT = '订单表';

-- ----------------------------
-- 5、订单明细表
-- 订单和商品的关联表
-- ----------------------------
DROP TABLE IF EXISTS cl_order_item;
CREATE TABLE cl_order_item (
  item_id           BIGINT(20)      NOT NULL AUTO_INCREMENT    COMMENT '明细ID',
  order_id          BIGINT(20)      NOT NULL                   COMMENT '订单ID',
  goods_id          BIGINT(20)      NOT NULL                   COMMENT '商品ID',
  goods_name        VARCHAR(100)    DEFAULT ''                 COMMENT '商品名称（快照）',
  goods_price       DECIMAL(10,2)   DEFAULT 0.00               COMMENT '商品单价（快照）',
  quantity          INT(11)         DEFAULT 1                  COMMENT '数量',
  total_price       DECIMAL(10,2)   DEFAULT 0.00               COMMENT '小计',
  item_spec         VARCHAR(500)    DEFAULT NULL               COMMENT '规格快照JSON',
  create_time       DATETIME                                   COMMENT '创建时间',
  PRIMARY KEY (item_id),
  INDEX idx_order_id (order_id),
  INDEX idx_goods_id (goods_id)
) ENGINE=INNODB AUTO_INCREMENT=1 COMMENT = '订单明细表';

-- ----------------------------
-- 6、定制订单表
-- 对应开发计划中的定制功能
-- ----------------------------
DROP TABLE IF EXISTS cl_custom_order;
CREATE TABLE cl_custom_order (
  custom_id         BIGINT(20)      NOT NULL AUTO_INCREMENT    COMMENT '定制ID',
  order_id          BIGINT(20)      NOT NULL                   COMMENT '关联订单ID',
  base_goods_id     BIGINT(20)      DEFAULT NULL               COMMENT '基础商品ID（可选）',
  custom_content    TEXT                                       COMMENT '定制内容（对联内容）',
  custom_spec       VARCHAR(200)    DEFAULT ''                 COMMENT '定制规格（材质、尺寸等，JSON格式）',
  queue_no          INT(11)         DEFAULT 0                  COMMENT '排队号',
  queue_position    INT(11)         DEFAULT 0                  COMMENT '排队位置（前面还有多少人）',
  estimated_time    INT(11)         DEFAULT 0                  COMMENT '预计完成时间（分钟）',
  status            CHAR(1)         DEFAULT '0'                COMMENT '状态（0待接单 1制作中 2已完成）',
  -- 若依标准字段
  create_time       DATETIME                                   COMMENT '创建时间',
  update_time       DATETIME                                   COMMENT '更新时间',
  remark            VARCHAR(500)    DEFAULT NULL               COMMENT '备注',
  PRIMARY KEY (custom_id),
  INDEX idx_order_id (order_id),
  INDEX idx_status (status),
  INDEX idx_queue_no (queue_no)
) ENGINE=INNODB AUTO_INCREMENT=1 COMMENT = '定制订单表';

-- ----------------------------
-- 7、商品评价表
-- 对应ER图中的"评价、收藏"关系
-- ----------------------------
DROP TABLE IF EXISTS cl_goods_evaluation;
CREATE TABLE cl_goods_evaluation (
  eval_id           BIGINT(20)      NOT NULL AUTO_INCREMENT    COMMENT '评价ID',
  device_id         VARCHAR(64)     NOT NULL                   COMMENT '设备ID（小程序端标识）',
  goods_id          BIGINT(20)      NOT NULL                   COMMENT '商品ID',
  order_id          BIGINT(20)      DEFAULT NULL               COMMENT '订单ID（可选）',
  rating            INT(1)          DEFAULT 5                  COMMENT '评分（1-5）',
  content           TEXT                                       COMMENT '评价内容',
  images            TEXT                                       COMMENT '评价图片（JSON格式）',
  -- 若依标准字段
  create_time       DATETIME                                   COMMENT '创建时间',
  update_time       DATETIME                                   COMMENT '更新时间',
  PRIMARY KEY (eval_id),
  INDEX idx_device_id (device_id),
  INDEX idx_goods_id (goods_id),
  INDEX idx_order_id (order_id)
) ENGINE=INNODB AUTO_INCREMENT=1 COMMENT = '商品评价表';

-- ----------------------------
-- 8、商品收藏表
-- 对应ER图中的"评价、收藏"关系
-- ----------------------------
DROP TABLE IF EXISTS cl_goods_favorite;
CREATE TABLE cl_goods_favorite (
  favorite_id       BIGINT(20)      NOT NULL AUTO_INCREMENT    COMMENT '收藏ID',
  device_id         VARCHAR(64)     NOT NULL                   COMMENT '设备ID（小程序端标识）',
  goods_id          BIGINT(20)      NOT NULL                   COMMENT '商品ID',
  create_time       DATETIME                                   COMMENT '创建时间',
  PRIMARY KEY (favorite_id),
  UNIQUE KEY uk_device_goods (device_id, goods_id),
  INDEX idx_device_id (device_id),
  INDEX idx_goods_id (goods_id)
) ENGINE=INNODB AUTO_INCREMENT=1 COMMENT = '商品收藏表';

-- ----------------------------
-- 9、AI对话记录表
-- 对应开发计划中的AI聊天功能
-- ----------------------------
DROP TABLE IF EXISTS cl_ai_chat_log;
CREATE TABLE cl_ai_chat_log (
  log_id            BIGINT(20)      NOT NULL AUTO_INCREMENT    COMMENT '记录ID',
  device_id         VARCHAR(64)     NOT NULL                   COMMENT '设备ID（小程序端标识）',
  question          TEXT                                       COMMENT '用户问题',
  answer            TEXT                                       COMMENT 'AI回答',
  recommended_goods VARCHAR(500)    DEFAULT ''                 COMMENT '推荐商品ID列表（JSON格式）',
  -- 若依标准字段
  create_time       DATETIME                                   COMMENT '创建时间',
  PRIMARY KEY (log_id),
  INDEX idx_device_id (device_id),
  INDEX idx_create_time (create_time)
) ENGINE=INNODB AUTO_INCREMENT=1 COMMENT = 'AI对话记录表';

-- ----------------------------
-- 10、公告表（可选，若依已有sys_notice，可直接使用）
-- 如果要用独立的公告表，可以用这个
-- ----------------------------
-- DROP TABLE IF EXISTS cl_announcement;
-- CREATE TABLE cl_announcement (
--   announcement_id  BIGINT(20)      NOT NULL AUTO_INCREMENT    COMMENT '公告ID',
--   title            VARCHAR(200)    NOT NULL                   COMMENT '标题',
--   content          TEXT                                       COMMENT '详情',
--   status           CHAR(1)         DEFAULT '0'                COMMENT '状态（0正常 1关闭）',
--   create_time      DATETIME                                   COMMENT '时间',
--   update_time      DATETIME                                   COMMENT '更新时间',
--   PRIMARY KEY (announcement_id),
--   INDEX idx_status (status),
--   INDEX idx_create_time (create_time)
-- ) ENGINE=INNODB AUTO_INCREMENT=1 COMMENT = '公告表';

-- ============================================
-- 初始化示例数据（可选）
-- ============================================

-- 商品示例数据
INSERT INTO cl_goods VALUES(1, '传统春联-福字', '0', 15.00, 100, '', '', '传统福字春联，寓意吉祥如意', 4.5, '0', 1, 'admin', SYSDATE(), '', NULL, NULL);
INSERT INTO cl_goods VALUES(2, '传统春联-财源广进', '0', 18.00, 80, '', '', '财源广进春联，寓意财运亨通', 4.8, '0', 2, 'admin', SYSDATE(), '', NULL, NULL);
INSERT INTO cl_goods VALUES(3, '定制春联-现场制作', '1', 25.00, 999, '', '', '可定制内容的春联，现场制作', 5.0, '0', 3, 'admin', SYSDATE(), '', NULL, NULL);

-- 定制商品扩展数据
INSERT INTO cl_goods_extend VALUES(1, 3, '宣纸', 30.00, 20.00, '大号', SYSDATE(), NULL);

