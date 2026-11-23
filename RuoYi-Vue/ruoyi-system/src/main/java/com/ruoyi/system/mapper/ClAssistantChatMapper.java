package com.ruoyi.system.mapper;

import com.ruoyi.system.domain.ClAssistantChat;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 智能助手对话记录Mapper接口
 * 
 * @author ruoyi
 * @date 2026-02-10
 */
public interface ClAssistantChatMapper 
{
    /**
     * 查询智能助手对话记录
     * 
     * @param chatId 智能助手对话记录主键
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
     * 根据用户ID查询最近的会话
     * 
     * @param userId 用户ID
     * @param limit 限制数量
     * @return 会话列表
     */
    public List<String> selectRecentSessionsByUserId(@Param("userId") Long userId, @Param("limit") int limit);

    /**
     * 根据用户ID查询最近的对话记录
     * 
     * @param userId 用户ID
     * @param limit 限制数量
     * @return 对话记录列表
     */
    public List<ClAssistantChat> selectRecentChatsByUserId(@Param("userId") Long userId, @Param("limit") int limit);

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
     * 删除智能助手对话记录
     * 
     * @param chatId 智能助手对话记录主键
     * @return 结果
     */
    public int deleteClAssistantChatByChatId(Long chatId);

    /**
     * 批量删除智能助手对话记录
     * 
     * @param chatIds 需要删除的数据主键集合
     * @return 结果
     */
    public int deleteClAssistantChatByChatIds(Long[] chatIds);

    /**
     * 删除会话的所有对话记录
     * 
     * @param sessionId 会话ID
     * @return 结果
     */
    public int deleteChatsBySessionId(String sessionId);

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
