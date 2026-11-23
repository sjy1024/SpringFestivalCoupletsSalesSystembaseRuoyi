package com.ruoyi.system.domain;

import com.ruoyi.common.core.domain.BaseEntity;
import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;

/**
 * 小程序 AI 对话记录 cl_app_ai_chat
 */
public class ClAppAiChat extends BaseEntity {
    private static final long serialVersionUID = 1L;

    private Long chatId;
    private String deviceId;
    private String sessionId;
    private String role;
    private String content;
    /** 0/1 助手消息是否走大模型 */
    private String usedLlm;

    public Long getChatId() {
        return chatId;
    }

    public void setChatId(Long chatId) {
        this.chatId = chatId;
    }

    public String getDeviceId() {
        return deviceId;
    }

    public void setDeviceId(String deviceId) {
        this.deviceId = deviceId;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getUsedLlm() {
        return usedLlm;
    }

    public void setUsedLlm(String usedLlm) {
        this.usedLlm = usedLlm;
    }

    @Override
    public String toString() {
        return new ToStringBuilder(this, ToStringStyle.MULTI_LINE_STYLE)
            .append("chatId", getChatId())
            .append("deviceId", getDeviceId())
            .append("sessionId", getSessionId())
            .append("role", getRole())
            .append("content", getContent())
            .append("usedLlm", getUsedLlm())
            .append("createTime", getCreateTime())
            .toString();
    }
}
