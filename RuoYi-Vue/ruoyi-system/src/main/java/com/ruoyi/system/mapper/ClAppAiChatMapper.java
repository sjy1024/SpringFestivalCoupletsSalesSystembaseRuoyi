package com.ruoyi.system.mapper;

import com.ruoyi.system.domain.ClAppAiChat;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 小程序 AI 对话 Mapper
 */
public interface ClAppAiChatMapper {

    int insertClAppAiChat(ClAppAiChat row);

    List<ClAppAiChat> selectByDeviceAndSession(@Param("deviceId") String deviceId, @Param("sessionId") String sessionId);

    List<ClAppAiChat> selectRecentByDevice(@Param("deviceId") String deviceId, @Param("limit") int limit);

    int deleteByDeviceId(@Param("deviceId") String deviceId);

    int deleteByDeviceAndSession(@Param("deviceId") String deviceId, @Param("sessionId") String sessionId);
}
