-- ----------------------------
-- 小程序端 AI 对话记录（匿名设备维度，与管理端 cl_assistant_chat 分离）
-- ----------------------------
DROP TABLE IF EXISTS `cl_app_ai_chat`;
CREATE TABLE `cl_app_ai_chat` (
  `chat_id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `device_id` varchar(64) NOT NULL COMMENT '客户端设备标识（小程序本地生成并持久化）',
  `session_id` varchar(100) NOT NULL COMMENT '会话ID',
  `role` varchar(20) NOT NULL COMMENT '角色：user / assistant',
  `content` text NOT NULL COMMENT '消息内容',
  `used_llm` char(1) DEFAULT '0' COMMENT '本条助手回复是否来自大模型：0否 1是',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`chat_id`),
  KEY `idx_device_session` (`device_id`, `session_id`),
  KEY `idx_device_time` (`device_id`, `create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='小程序 AI 对话记录';
