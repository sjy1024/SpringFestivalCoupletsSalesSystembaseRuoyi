package com.ruoyi.system.service;

import com.ruoyi.system.domain.ClAssistantChat;
import java.util.List;

/**
 * 智能助手对话记录Service接口
 * 
 * @author ruoyi
 * @date 2026-02-10
 */
public interface IClAssistantChatService 
{
    /**
     * 查询智能助手对话记录
     * 
     * @param chatId 对话ID
     * @return 智能助手对话记录
     */
    public ClAssistantChat selectClAssistantChatByChatId(Long chatId);

    /**
     * 查询智能助手对话记录列表
     * 
     * @param clAssistantChat 智能助手对话记录
     * @return 智能助手对话记录集合
     */
    public List<ClAssistantChat> selectClAssistantChatList(ClAssistantChat clAssistantChat);

    /**
     * 根据会话ID查询对话记录
     * 
     * @param sessionId 会话ID
     * @return 对话记录列表
     */
    public List<ClAssistantChat> selectChatsBySessionId(String sessionId);

    /**
     * 查询用户的最近对话记录
     * 
     * @param userId 用户ID
     * @param limit 限制数量
     * @return 对话记录列表
     */
    public List<ClAssistantChat> selectRecentChatsByUserId(Long userId, int limit);

    /**
     * 新增智能助手对话记录
     * 
     * @param clAssistantChat 智能助手对话记录
     * @return 结果
     */
    public int insertClAssistantChat(ClAssistantChat clAssistantChat);

    /**
     * 修改智能助手对话记录
     * 
     * @param clAssistantChat 智能助手对话记录
     * @return 结果
     */
    public int updateClAssistantChat(ClAssistantChat clAssistantChat);

    /**
     * 批量删除智能助手对话记录
     * 
     * @param chatIds 需要删除的对话ID
     * @return 结果
     */
    public int deleteClAssistantChatByChatIds(Long[] chatIds);

    /**
     * 删除智能助手对话记录信息
     * 
     * @param chatId 对话ID
     * @return 结果
     */
    public int deleteClAssistantChatByChatId(Long chatId);

    /**
     * 删除指定会话的所有对话记录
     * 
     * @param sessionId 会话ID
     * @return 结果
     */
    public int deleteClAssistantChatBySessionId(String sessionId);

    /**
     * 删除指定用户的所有对话记录
     * 
     * @param userId 用户ID
     * @return 结果
     */
    public int deleteAllChatsByUserId(Long userId);
}
