package com.ruoyi.system.service;

import com.ruoyi.system.domain.ClCustomOrder;
import java.util.List;

/**
 * 定制订单Service接口
 * 
 * @author ruoyi
 * @date 2026-02-21
 */
public interface IClCustomOrderService 
{
    /**
     * 查询定制订单
     * 
     * @param customId 定制ID
     * @return 定制订单
     */
    public ClCustomOrder selectClCustomOrderByCustomId(Long customId);

    /**
     * 按定制ID与设备（订单 device_id）查询，用于 C 端详情鉴权
     */
    public ClCustomOrder selectClCustomOrderByCustomIdAndDeviceId(Long customId, String deviceId);

    /**
     * 查询定制订单列表
     * 
     * @param clCustomOrder 定制订单
     * @return 定制订单集合
     */
    public List<ClCustomOrder> selectClCustomOrderList(ClCustomOrder clCustomOrder);

    /**
     * 按设备查询当前用户的定制订单列表（购物车「我的定制」）
     */
    public List<ClCustomOrder> selectClCustomOrderListByDeviceId(String deviceId);

    /**
     * 新增定制订单
     * 
     * @param clCustomOrder 定制订单
     * @return 结果
     */
    public int insertClCustomOrder(ClCustomOrder clCustomOrder);

    /**
     * 修改定制订单
     * 
     * @param clCustomOrder 定制订单
     * @return 结果
     */
    public int updateClCustomOrder(ClCustomOrder clCustomOrder);

    /**
     * 删除定制订单信息
     * 
     * @param customId 定制ID
     * @return 结果
     */
    public int deleteClCustomOrderByCustomId(Long customId);

    /**
     * 批量删除定制订单
     * 
     * @param customIds 需要删除的定制ID
     * @return 结果
     */
    public int deleteClCustomOrderByCustomIds(Long[] customIds);


    /**
     * 生成新的排队号（线程安全）
     * @param status 订单状态
     * @return 新的排队号
     */
    Long generateQueueNo(String status);

}
