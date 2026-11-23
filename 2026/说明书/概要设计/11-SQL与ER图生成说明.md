# SQL 与 ER 图生成说明（概要设计）

本文档供**从建表 SQL 生成 ER 图**时使用：将下方 SQL 粘贴到在线工具（如 [drawDB](https://drawdb.app/)、[dbdiagram.io](https://dbdiagram.io/)），点击生成 ER 图，再导出 PNG/SVG 插入论文或 `概要设计.md` 对应插图位置。与「图 4-5」概念模型（`07-核心ER图.puml`）对照时，注意本处为**逻辑/物理表级**关系，字段粒度更细。

更多工具对比见同目录：`图表生成网站推荐.md` 第 6 节。

---

## 1. 推荐操作步骤

1. 打开 [drawDB](https://drawdb.app/)（或 dbdiagram.io；后者常用 DBML，需略改语法）。
2. 选择 **Import / 从 SQL 导入**（或左侧「手动输入 / 粘贴 SQL」类入口）。
3. **仅复制下文「§2 业务表 DDL」**整段（不要带 `INSERT` 测试数据，以免干扰解析）。
4. 点击 **生成 ER 图**（或等价按钮），微调节点排版后 **导出图片**。
5. 在 Word 或 `概要设计.md` 的「图 4-5」说明处插入导出图，图题示例：**图 4-5 春联售卖系统核心表 ER 图（由 SQL 生成）**。

说明：若工具不支持 MySQL 的 `COMMENT` 或部分类型，可临时删掉列注释再导入；关系连线可能需手工补全外键（本项目中部分关联由应用层通过 `goods_id`、`order_id`、`device_id` 维护，工具未必全部自动识别）。

---

## 2. 业务表 DDL（供复制生成 ER 图）

以下为**仅 `CREATE TABLE`** 的合并脚本（与 `RuoYi-Vue/sql/cl_business_tables.sql` 一致，并补充收货地址表；**不含**若依系统表 `sys_*`）。末尾附带**可选**公告表 `cl_announcement`（项目中曾以注释形式保留，若不需要生成该实体可删除对应段落后再粘贴）。

```sql
CREATE TABLE cl_goods (
  goods_id          BIGINT(20)      NOT NULL AUTO_INCREMENT    COMMENT '商品ID',
  goods_name        VARCHAR(100)    NOT NULL                   COMMENT '商品名称',
  goods_type        CHAR(1)         DEFAULT '0'                COMMENT '商品类型（0普通商品 1需要材质尺寸的商品）',
  goods_price       DECIMAL(10,2)   DEFAULT 0.00               COMMENT '商品价格',
  stock             INT(11)         DEFAULT 0                  COMMENT '库存数量',
  cover_image       VARCHAR(255)    DEFAULT ''                 COMMENT '封面图片',
  images            TEXT                                       COMMENT '商品图片（多张，JSON格式）',
  description       TEXT                                       COMMENT '商品描述',
  rating            DECIMAL(3,2)    DEFAULT 0.00               COMMENT '评分（0-5分）',
  status            CHAR(1)         DEFAULT '0'                COMMENT '上架状态（0上架 1下架）',
  sort_order        INT(4)          DEFAULT 0                  COMMENT '排序',
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

CREATE TABLE cl_cart (
  cart_id           BIGINT(20)      NOT NULL AUTO_INCREMENT    COMMENT '购物车ID',
  device_id         VARCHAR(64)     NOT NULL                   COMMENT '设备ID（小程序端标识）',
  goods_id          BIGINT(20)      NOT NULL                   COMMENT '商品ID',
  quantity          INT(11)         DEFAULT 1                  COMMENT '数量',
  create_time       DATETIME                                   COMMENT '创建时间',
  update_time       DATETIME                                   COMMENT '更新时间',
  PRIMARY KEY (cart_id),
  INDEX idx_device_id (device_id),
  INDEX idx_goods_id (goods_id),
  UNIQUE KEY uk_device_goods (device_id, goods_id)
) ENGINE=INNODB AUTO_INCREMENT=1 COMMENT = '购物车表';

CREATE TABLE cl_order (
  order_id          BIGINT(20)      NOT NULL AUTO_INCREMENT    COMMENT '订单ID',
  order_no          VARCHAR(32)     NOT NULL                   COMMENT '订单号',
  device_id         VARCHAR(64)     NOT NULL                   COMMENT '设备ID（小程序端标识）',
  order_type        CHAR(1)         DEFAULT '0'                COMMENT '订单类型（0普通订单 1定制订单）',
  total_amount      DECIMAL(10,2)   DEFAULT 0.00               COMMENT '总价',
  status            CHAR(1)         DEFAULT '0'                COMMENT '订单状态（0待支付 1已支付 2制作中 3已完成 4已取消）',
  receiver_name     VARCHAR(50)     DEFAULT ''                 COMMENT '收货人',
  receiver_phone    VARCHAR(20)     DEFAULT ''                 COMMENT '收货电话',
  receiver_address  VARCHAR(200)    DEFAULT ''                 COMMENT '收货地址',
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

CREATE TABLE cl_order_item (
  item_id           BIGINT(20)      NOT NULL AUTO_INCREMENT    COMMENT '明细ID',
  order_id          BIGINT(20)      NOT NULL                   COMMENT '订单ID',
  goods_id          BIGINT(20)      NOT NULL                   COMMENT '商品ID',
  goods_name        VARCHAR(100)    DEFAULT ''                 COMMENT '商品名称（快照）',
  goods_price       DECIMAL(10,2)   DEFAULT 0.00               COMMENT '商品单价（快照）',
  quantity          INT(11)         DEFAULT 1                  COMMENT '数量',
  total_price       DECIMAL(10,2)   DEFAULT 0.00               COMMENT '小计',
  create_time       DATETIME                                   COMMENT '创建时间',
  PRIMARY KEY (item_id),
  INDEX idx_order_id (order_id),
  INDEX idx_goods_id (goods_id)
) ENGINE=INNODB AUTO_INCREMENT=1 COMMENT = '订单明细表';

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
  create_time       DATETIME                                   COMMENT '创建时间',
  update_time       DATETIME                                   COMMENT '更新时间',
  remark            VARCHAR(500)    DEFAULT NULL               COMMENT '备注',
  PRIMARY KEY (custom_id),
  INDEX idx_order_id (order_id),
  INDEX idx_status (status),
  INDEX idx_queue_no (queue_no)
) ENGINE=INNODB AUTO_INCREMENT=1 COMMENT = '定制订单表';

CREATE TABLE cl_goods_evaluation (
  eval_id           BIGINT(20)      NOT NULL AUTO_INCREMENT    COMMENT '评价ID',
  device_id         VARCHAR(64)     NOT NULL                   COMMENT '设备ID（小程序端标识）',
  goods_id          BIGINT(20)      NOT NULL                   COMMENT '商品ID',
  order_id          BIGINT(20)      DEFAULT NULL               COMMENT '订单ID（可选）',
  rating            INT(1)          DEFAULT 5                  COMMENT '评分（1-5）',
  content           TEXT                                       COMMENT '评价内容',
  images            TEXT                                       COMMENT '评价图片（JSON格式）',
  create_time       DATETIME                                   COMMENT '创建时间',
  update_time       DATETIME                                   COMMENT '更新时间',
  PRIMARY KEY (eval_id),
  INDEX idx_device_id (device_id),
  INDEX idx_goods_id (goods_id),
  INDEX idx_order_id (order_id)
) ENGINE=INNODB AUTO_INCREMENT=1 COMMENT = '商品评价表';

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

CREATE TABLE cl_ai_chat_log (
  log_id            BIGINT(20)      NOT NULL AUTO_INCREMENT    COMMENT '记录ID',
  device_id         VARCHAR(64)     NOT NULL                   COMMENT '设备ID（小程序端标识）',
  question          TEXT                                       COMMENT '用户问题',
  answer            TEXT                                       COMMENT 'AI回答',
  recommended_goods VARCHAR(500)    DEFAULT ''                 COMMENT '推荐商品ID列表（JSON格式）',
  create_time       DATETIME                                   COMMENT '创建时间',
  PRIMARY KEY (log_id),
  INDEX idx_device_id (device_id),
  INDEX idx_create_time (create_time)
) ENGINE=INNODB AUTO_INCREMENT=1 COMMENT = 'AI对话记录表';

CREATE TABLE cl_user_address (
  address_id        BIGINT(20)      NOT NULL AUTO_INCREMENT    COMMENT '地址ID',
  user_id           BIGINT(20)      DEFAULT NULL               COMMENT '用户ID（若依用户表关联）',
  device_id         VARCHAR(100)    DEFAULT ''                 COMMENT '设备ID（小程序设备标识）',
  receiver_name     VARCHAR(50)     NOT NULL                   COMMENT '收货人姓名',
  receiver_phone    VARCHAR(20)     NOT NULL                   COMMENT '收货人电话',
  province_code     VARCHAR(20)     DEFAULT ''                 COMMENT '省份编码',
  province_name     VARCHAR(50)     DEFAULT ''                 COMMENT '省份名称',
  city_code         VARCHAR(20)     DEFAULT ''                 COMMENT '城市编码',
  city_name         VARCHAR(50)     DEFAULT ''                 COMMENT '城市名称',
  district_code     VARCHAR(20)     DEFAULT ''                 COMMENT '区县编码',
  district_name     VARCHAR(50)     DEFAULT ''                 COMMENT '区县名称',
  detail_address    VARCHAR(200)    NOT NULL                   COMMENT '详细地址',
  address_tag       VARCHAR(20)     DEFAULT ''                 COMMENT '地址标签（家/公司等）',
  is_default        TINYINT(1)      DEFAULT 0                  COMMENT '是否默认地址（0否 1是）',
  latitude          VARCHAR(20)     DEFAULT ''                 COMMENT '纬度',
  longitude         VARCHAR(20)     DEFAULT ''                 COMMENT '经度',
  status            CHAR(1)         DEFAULT '0'                COMMENT '状态（0正常 1停用）',
  del_flag          CHAR(1)         DEFAULT '0'                COMMENT '删除标志（0存在 2删除）',
  create_by         VARCHAR(64)     DEFAULT ''                 COMMENT '创建者',
  create_time       DATETIME        DEFAULT CURRENT_TIMESTAMP  COMMENT '创建时间',
  update_by         VARCHAR(64)     DEFAULT ''                 COMMENT '更新者',
  update_time       DATETIME        DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  remark            VARCHAR(500)    DEFAULT NULL               COMMENT '备注',
  PRIMARY KEY (address_id),
  KEY idx_device_id (device_id),
  KEY idx_user_id (user_id)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COMMENT='用户收货地址表';

-- 可选：独立公告表（与业务脚本中注释草案一致；不需要则从粘贴内容中删除本段）
CREATE TABLE cl_announcement (
  announcement_id   BIGINT(20)      NOT NULL AUTO_INCREMENT    COMMENT '公告ID',
  title             VARCHAR(200)    NOT NULL                   COMMENT '标题',
  content           TEXT                                       COMMENT '详情',
  status            CHAR(1)         DEFAULT '0'                COMMENT '状态（0正常 1关闭）',
  create_time       DATETIME                                   COMMENT '创建时间',
  update_time       DATETIME                                   COMMENT '更新时间',
  PRIMARY KEY (announcement_id),
  INDEX idx_status (status),
  INDEX idx_create_time (create_time)
) ENGINE=INNODB AUTO_INCREMENT=1 COMMENT = '公告表';
```

---

## 3. 在 Markdown 中直接预览的 ER 图（Mermaid）

下列代码在 **GitHub、GitLab、VS Code / Cursor（内置预览）** 等支持 Mermaid 的环境可渲染为 ER 图；**Microsoft Word 一般不渲染 Mermaid**，交稿时仍建议用 §1 导出位图或矢量图。

```mermaid
erDiagram
  cl_goods ||--o| cl_goods_extend : "goods_id 唯一"
  cl_goods ||--o{ cl_cart : "goods_id"
  cl_goods ||--o{ cl_order_item : "快照引用"
  cl_goods ||--o{ cl_goods_evaluation : "被评价"
  cl_goods ||--o{ cl_goods_favorite : "被收藏"
  cl_order ||--o{ cl_order_item : "包含明细"
  cl_order ||--o| cl_custom_order : "定制扩展"
  cl_order ||--o{ cl_goods_evaluation : "order_id 可空"
  cl_goods ||--o{ cl_custom_order : "base_goods_id 可空"
```

> 说明：`cl_ai_chat_log`、`cl_user_address` 与订单/商品表之间在库内**未建外键**，由业务通过 `device_id` 等关联；若要在图中体现，可在 drawDB 中手工拉线或扩展本 Mermaid 块。

---

## 4. 与仓库脚本对应关系

| 本文 §2 内容 | 仓库源文件 |
|-------------|-----------|
| `cl_goods` … `cl_ai_chat_log` | `RuoYi-Vue/sql/cl_business_tables.sql` |
| `cl_user_address` | `RuoYi-Vue/sql/cl_address_table.sql` |
| 全库一键执行（含若依系统表） | `RuoYi-Vue/sql/all_in_one_merged.sql` |

管理端智能助手表 `cl_assistant_chat` 见 `RuoYi-Vue/sql/cl_assistant_chat_table.sql`，若 ER 范围需包含该表，可将其中 `CREATE TABLE` 追加到 §2 SQL 后再导入工具。
