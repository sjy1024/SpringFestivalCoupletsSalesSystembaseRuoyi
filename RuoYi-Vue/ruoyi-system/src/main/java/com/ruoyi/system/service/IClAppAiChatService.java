package com.ruoyi.system.service;

import com.ruoyi.system.domain.ClAppAiChat;

import java.util.List;

/**
 * 小程序 AI 对话记录
 */
public interface IClAppAiChatService {

    void insertMessage(String deviceId, String sessionId, String role, String content, boolean assistantUsedLlm);

    List<ClAppAiChat> listSession(String deviceId, String sessionId);

    /**
     * 跨会话按时间倒序取最近 N 条，返回时已按时间正序（适合直接渲染）
     */
    List<ClAppAiChat> listRecentChronological(String deviceId, int limit);

    int clearDevice(String deviceId);

    int clearSession(String deviceId, String sessionId);
}
