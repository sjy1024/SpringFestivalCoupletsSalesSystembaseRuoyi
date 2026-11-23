package com.ruoyi.system.mapper;

import com.ruoyi.system.domain.ClCustomOrder;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 定制订单Mapper接口
 * 
 * @author ruoyi
 * @date 2026-02-21
 */
public interface ClCustomOrderMapper 
{
    ClCustomOrder selectClCustomOrderByCustomId(Long customId);

    ClCustomOrder selectClCustomOrderByCustomIdAndDeviceId(@Param("customId") Long customId, @Param("deviceId") String deviceId);

    List<ClCustomOrder> selectClCustomOrderListByDeviceId(@Param("deviceId") String deviceId);

    public List<ClCustomOrder> selectClCustomOrderList(ClCustomOrder clCustomOrder);
    public int insertClCustomOrder(ClCustomOrder clCustomOrder);
    public int updateClCustomOrder(ClCustomOrder clCustomOrder);
    public int deleteClCustomOrderByCustomId(Long customId);
    public int deleteClCustomOrderByCustomIds(Long[] customIds);


    /**
     * 获取最大排队号（用于生成新排队号）
     * @param status 订单状态
     * @return 最大排队号
     */
    Long selectMaxQueueNoByStatus(String status);

}