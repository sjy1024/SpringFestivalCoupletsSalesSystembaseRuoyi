-- ----------------------------
-- 智能助手对话记录表
-- ----------------------------
DROP TABLE IF EXISTS `cl_assistant_chat`;
CREATE TABLE `cl_assistant_chat` (
  `chat_id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '对话ID',
  `session_id` varchar(100) NOT NULL COMMENT '会话ID（用于关联同一次对话）',
  `user_id` bigint(20) NOT NULL COMMENT '用户ID',
  `user_name` varchar(50) DEFAULT NULL COMMENT '用户名',
  `role` varchar(20) NOT NULL COMMENT '角色：user-用户，assistant-AI助手',
  `content` text NOT NULL COMMENT '消息内容',
  `question_type` varchar(50) DEFAULT NULL COMMENT '问题类型：order-订单，goods-商品，inventory-库存，data-数据分析，general-通用',
  `is_helpful` char(1) DEFAULT NULL COMMENT '是否有用：0-无用，1-有用',
  `response_time` bigint(20) DEFAULT NULL COMMENT '响应时间（毫秒）',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`chat_id`),
  KEY `idx_session_id` (`session_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COMMENT='智能助手对话记录表';

-- ----------------------------
-- 示例数据（可选）
-- ----------------------------
-- INSERT INTO `cl_assistant_chat` VALUES 
-- (1, 'session-001', 1, 'admin', 'user', '今天的订单情况怎么样？', 'order', '1', NULL, NOW()),
-- (2, 'session-001', 1, 'admin', 'assistant', '今日订单统计：共5单，总金额328元...', 'order', '1', 2500, NOW());
