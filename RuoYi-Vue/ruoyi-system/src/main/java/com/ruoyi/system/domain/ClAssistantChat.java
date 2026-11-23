package com.ruoyi.system.domain;

import com.ruoyi.common.annotation.Excel;
import com.ruoyi.common.core.domain.BaseEntity;
import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;

/**
 * 智能助手对话记录对象 cl_assistant_chat
 * 
 * @author ruoyi
 * @date 2026-02-10
 */
public class ClAssistantChat extends BaseEntity
{
    private static final long serialVersionUID = 1L;

    /** 对话ID */
    private Long chatId;

    /** 会话ID */
    @Excel(name = "会话ID")
    private String sessionId;

    /** 用户ID */
    @Excel(name = "用户ID")
    private Long userId;

    /** 用户名 */
    @Excel(name = "用户名")
    private String userName;

    /** 角色：user/assistant */
    @Excel(name = "角色")
    private String role;

    /** 消息内容 */
    @Excel(name = "消息内容")
    private String content;

    /** 问题类型：order/goods/inventory/data/general */
    @Excel(name = "问题类型")
    private String questionType;

    /** 是否有用：0-无用，1-有用 */
    @Excel(name = "是否有用")
    private String isHelpful;

    /** 响应时间（毫秒） */
    @Excel(name = "响应时间")
    private Long responseTime;

    public void setChatId(Long chatId) 
    {
        this.chatId = chatId;
    }

    public Long getChatId() 
    {
        return chatId;
    }

    public void setSessionId(String sessionId) 
    {
        this.sessionId = sessionId;
    }

    public String getSessionId() 
    {
        return sessionId;
    }

    public void setUserId(Long userId) 
    {
        this.userId = userId;
    }

    public Long getUserId() 
    {
        return userId;
    }

    public void setUserName(String userName) 
    {
        this.userName = userName;
    }

    public String getUserName() 
    {
        return userName;
    }

    public void setRole(String role) 
    {
        this.role = role;
    }

    public String getRole() 
    {
        return role;
    }

    public void setContent(String content) 
    {
        this.content = content;
    }

    public String getContent() 
    {
        return content;
    }

    public void setQuestionType(String questionType) 
    {
        this.questionType = questionType;
    }

    public String getQuestionType() 
    {
        return questionType;
    }

    public void setIsHelpful(String isHelpful) 
    {
        this.isHelpful = isHelpful;
    }

    public String getIsHelpful() 
    {
        return isHelpful;
    }

    public void setResponseTime(Long responseTime) 
    {
        this.responseTime = responseTime;
    }

    public Long getResponseTime() 
    {
        return responseTime;
    }

    @Override
    public String toString() {
        return new ToStringBuilder(this,ToStringStyle.MULTI_LINE_STYLE)
            .append("chatId", getChatId())
            .append("sessionId", getSessionId())
            .append("userId", getUserId())
            .append("userName", getUserName())
            .append("role", getRole())
            .append("content", getContent())
            .append("questionType", getQuestionType())
            .append("isHelpful", getIsHelpful())
            .append("responseTime", getResponseTime())
            .append("createTime", getCreateTime())
            .toString();
    }
}
