package com.ruoyi.system.mapper;

import java.util.List;
import com.ruoyi.system.domain.ClOrderItem;

/**
 * 订单商品Mapper接口
 * 
 * @author ruoyi
 * @date 2026-01-29
 */
public interface ClOrderItemMapper 
{
    /**
     * 根据订单ID查询订单商品列表
     * 
     * @param orderId 订单主键
     * @return 订单商品集合
     */
    public List<ClOrderItem> selectClOrderItemByOrderId(Long orderId);

    /**
     * 查询订单商品列表
     * 
     * @param clOrderItem 订单商品
     * @return 订单商品集合
     */
    public List<ClOrderItem> selectClOrderItemList(ClOrderItem clOrderItem);

    /**
     * 新增订单商品
     * 
     * @param clOrderItem 订单商品
     * @return 结果
     */
    public int insertClOrderItem(ClOrderItem clOrderItem);

    /**
     * 修改订单商品
     * 
     * @param clOrderItem 订单商品
     * @return 结果
     */
    public int updateClOrderItem(ClOrderItem clOrderItem);

    /**
     * 删除订单商品
     * 
     * @param itemId 订单商品主键
     * @return 结果
     */
    public int deleteClOrderItemByItemId(Long itemId);

    /**
     * 批量删除订单商品
     * 
     * @param orderIds 需要删除的订单主键集合
     * @return 结果
     */
    public int deleteClOrderItemByOrderIds(Long[] orderIds);
}