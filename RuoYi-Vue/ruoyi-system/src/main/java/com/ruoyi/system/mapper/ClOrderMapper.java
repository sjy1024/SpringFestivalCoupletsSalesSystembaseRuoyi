package com.ruoyi.system.mapper;

import java.util.List;
import com.ruoyi.system.domain.ClOrder;

/**
 * 订单Mapper接口
 * 
 * @author ruoyi
 * @date 2026-01-26
 */
public interface ClOrderMapper 
{
    /**
     * 查询订单
     * 
     * @param orderId 订单主键
     * @return 订单
     */
    public ClOrder selectClOrderByOrderId(Long orderId);

    /**
     * 查询订单列表
     * 
     * @param clOrder 订单
     * @return 订单集合
     */
    public List<ClOrder> selectClOrderList(ClOrder clOrder);

    /**
     * 新增订单
     * 
     * @param clOrder 订单
     * @return 结果
     */
    public int insertClOrder(ClOrder clOrder);

    /**
     * 修改订单
     * 
     * @param clOrder 订单
     * @return 结果
     */
    public int updateClOrder(ClOrder clOrder);

    /**
     * 删除订单
     * 
     * @param orderId 订单主键
     * @return 结果
     */
    public int deleteClOrderByOrderId(Long orderId);

    /**
     * 批量删除订单
     * 
     * @param orderIds 需要删除的数据主键集合
     * @return 结果
     */
    public int deleteClOrderByOrderIds(Long[] orderIds);

    /**
     * 获取今天的订单数量
     * 
     * @return 今天的订单数量
     */
    public int getTodayOrderCount();

    /**
     * 获取最大订单号（用于生成新订单号）
     * 
     * @return 最大订单号
     */
    public String getMaxOrderNo();
}
