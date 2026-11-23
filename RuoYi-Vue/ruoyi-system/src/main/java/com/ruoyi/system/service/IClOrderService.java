package com.ruoyi.system.service;

import java.util.List;
import com.ruoyi.system.domain.ClOrder;
import com.ruoyi.system.domain.ClOrderItem;

/**
 * 订单Service接口
 * 
 * @author ruoyi
 * @date 2026-01-26
 */
public interface IClOrderService 
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
     * 批量删除订单
     * 
     * @param orderIds 需要删除的订单主键集合
     * @return 结果
     */
    public int deleteClOrderByOrderIds(Long[] orderIds);

    /**
     * 删除订单信息
     * 
     * @param orderId 订单主键
     * @return 结果
     */
    public int deleteClOrderByOrderId(Long orderId);

    /**
     * 根据订单ID查询订单商品列表
     * 
     * 供给小程序端使用
     * @param orderId 订单主键
     * @return 订单商品列表
     */
    public List<ClOrderItem> selectClOrderItemByOrderId(Long orderId);

    /**
     * 新增订单商品
     * 
     * @param clOrderItem 订单商品
     * @return 结果
     */
    public int insertClOrderItem(ClOrderItem clOrderItem);

    /**
     * 批量新增订单商品
     * 
     * @param clOrderItems 订单商品列表
     * @return 结果
     */
    public int insertClOrderItems(List<ClOrderItem> clOrderItems);

    /**
     * 根据订单ID删除订单商品
     * 
     * @param orderId 订单主键
     * @return 结果
     */
    public int deleteClOrderItemByOrderId(Long orderId);

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
