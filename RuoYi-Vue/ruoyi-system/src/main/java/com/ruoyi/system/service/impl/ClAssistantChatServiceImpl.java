package com.ruoyi.system.service.impl;

import com.ruoyi.common.utils.DateUtils;
import com.ruoyi.system.domain.ClAssistantChat;
import com.ruoyi.system.mapper.ClAssistantChatMapper;
import com.ruoyi.system.service.IClAssistantChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 智能助手对话记录Service业务层处理
 * 
 * @author ruoyi
 * @date 2026-02-10
 */
@Service
public class ClAssistantChatServiceImpl implements IClAssistantChatService 
{
    @Autowired
    private ClAssistantChatMapper clAssistantChatMapper;

    /**
     * 查询智能助手对话记录
     * 
     * @param chatId 对话ID
     * @return 智能助手对话记录
     */
    @Override
    public ClAssistantChat selectClAssistantChatByChatId(Long chatId)
    {
        return clAssistantChatMapper.selectClAssistantChatByChatId(chatId);
    }

    /**
     * 查询智能助手对话记录列表
     * 
     * @param clAssistantChat 智能助手对话记录
     * @return 智能助手对话记录
     */
    @Override
    public List<ClAssistantChat> selectClAssistantChatList(ClAssistantChat clAssistantChat)
    {
        return clAssistantChatMapper.selectClAssistantChatList(clAssistantChat);
    }

    /**
     * 根据会话ID查询对话记录
     * 
     * @param sessionId 会话ID
     * @return 对话记录列表
     */
    @Override
    public List<ClAssistantChat> selectChatsBySessionId(String sessionId)
    {
        return clAssistantChatMapper.selectChatsBySessionId(sessionId);
    }

    /**
     * 查询用户的最近对话记录
     * 
     * @param userId 用户ID
     * @param limit 限制数量
     * @return 对话记录列表
     */
    @Override
    public List<ClAssistantChat> selectRecentChatsByUserId(Long userId, int limit)
    {
        return clAssistantChatMapper.selectRecentChatsByUserId(userId, limit);
    }

    /**
     * 新增智能助手对话记录
     * 
     * @param clAssistantChat 智能助手对话记录
     * @return 结果
     */
    @Override
    public int insertClAssistantChat(ClAssistantChat clAssistantChat)
    {
        clAssistantChat.setCreateTime(DateUtils.getNowDate());
        return clAssistantChatMapper.insertClAssistantChat(clAssistantChat);
    }

    /**
     * 修改智能助手对话记录
     * 
     * @param clAssistantChat 智能助手对话记录
     * @return 结果
     */
    @Override
    public int updateClAssistantChat(ClAssistantChat clAssistantChat)
    {
        return clAssistantChatMapper.updateClAssistantChat(clAssistantChat);
    }

    /**
     * 批量删除智能助手对话记录
     * 
     * @param chatIds 需要删除的对话ID
     * @return 结果
     */
    @Override
    public int deleteClAssistantChatByChatIds(Long[] chatIds)
    {
        return clAssistantChatMapper.deleteClAssistantChatByChatIds(chatIds);
    }

    /**
     * 删除智能助手对话记录信息
     * 
     * @param chatId 对话ID
     * @return 结果
     */
    @Override
    public int deleteClAssistantChatByChatId(Long chatId)
    {
        return clAssistantChatMapper.deleteClAssistantChatByChatId(chatId);
    }

    /**
     * 删除指定会话的所有对话记录
     * 
     * @param sessionId 会话ID
     * @return 结果
     */
    @Override
    public int deleteClAssistantChatBySessionId(String sessionId)
    {
        return clAssistantChatMapper.deleteClAssistantChatBySessionId(sessionId);
    }

    /**
     * 删除指定用户的所有对话记录
     * 
     * @param userId 用户ID
     * @return 结果
     */
    @Override
    public int deleteAllChatsByUserId(Long userId)
    {
        return clAssistantChatMapper.deleteAllChatsByUserId(userId);
    }
}
