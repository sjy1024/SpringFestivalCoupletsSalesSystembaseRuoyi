-- ============================================
-- 春联小程序 - 收货地址表
-- ============================================

DROP TABLE IF EXISTS cl_user_address;

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

-- 插入测试数据
INSERT INTO cl_user_address (device_id, receiver_name, receiver_phone, province_code, province_name, city_code, city_name, district_code, district_name, detail_address, address_tag, is_default, create_time)
VALUES 
('device_test_001', '张三', '13800138000', '110000', '北京市', '110100', '北京市', '110101', '东城区', '王府井大街1号', '家', 1, NOW()),
('device_test_001', '张三', '13800138000', '110000', '北京市', '110100', '北京市', '110105', '朝阳区', '建国门外大街8号', '公司', 0, NOW()),
('device_test_002', '李四', '13900139000', '310000', '上海市', '310100', '上海市', '310101', '黄浦区', '南京东路100号', '家', 1, NOW());
