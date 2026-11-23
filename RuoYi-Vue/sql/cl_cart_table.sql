-- 购物车表
CREATE TABLE `cl_cart` (
  `cart_id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '购物车ID',
  `device_id` varchar(100) NOT NULL COMMENT '设备ID',
  `goods_id` bigint(20) NOT NULL COMMENT '商品ID',
  `quantity` int(11) NOT NULL DEFAULT '1' COMMENT '数量',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`cart_id`),
  UNIQUE KEY `uk_device_goods` (`device_id`, `goods_id`),
  KEY `idx_device_id` (`device_id`),
  KEY `idx_goods_id` (`goods_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='购物车表';