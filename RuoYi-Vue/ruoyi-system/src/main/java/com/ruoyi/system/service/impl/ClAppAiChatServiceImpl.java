package com.ruoyi.system.service.impl;

import com.ruoyi.common.utils.DateUtils;
import com.ruoyi.system.domain.ClAppAiChat;
import com.ruoyi.system.mapper.ClAppAiChatMapper;
import com.ruoyi.system.service.IClAppAiChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class ClAppAiChatServiceImpl implements IClAppAiChatService {

    @Autowired
    private ClAppAiChatMapper clAppAiChatMapper;

    @Override
    public void insertMessage(String deviceId, String sessionId, String role, String content, boolean assistantUsedLlm) {
        ClAppAiChat row = new ClAppAiChat();
        row.setDeviceId(deviceId);
        row.setSessionId(sessionId);
        row.setRole(role);
        row.setContent(content);
        row.setUsedLlm("assistant".equals(role) && assistantUsedLlm ? "1" : "0");
        row.setCreateTime(DateUtils.getNowDate());
        clAppAiChatMapper.insertClAppAiChat(row);
    }

    @Override
    public List<ClAppAiChat> listSession(String deviceId, String sessionId) {
        return clAppAiChatMapper.selectByDeviceAndSession(deviceId, sessionId);
    }

    @Override
    public List<ClAppAiChat> listRecentChronological(String deviceId, int limit) {
        List<ClAppAiChat> rows = clAppAiChatMapper.selectRecentByDevice(deviceId, limit);
        if (rows == null || rows.isEmpty()) {
            return Collections.emptyList();
        }
        List<ClAppAiChat> copy = new ArrayList<>(rows);
        Collections.reverse(copy);
        return copy;
    }

    @Override
    public int clearDevice(String deviceId) {
        return clAppAiChatMapper.deleteByDeviceId(deviceId);
    }

    @Override
    public int clearSession(String deviceId, String sessionId) {
        return clAppAiChatMapper.deleteByDeviceAndSession(deviceId, sessionId);
    }
}
