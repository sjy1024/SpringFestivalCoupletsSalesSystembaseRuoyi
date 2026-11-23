package com.ruoyi.system.service.impl;

import java.util.List;
import com.ruoyi.common.utils.DateUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.ruoyi.system.mapper.ClOrderMapper;
import com.ruoyi.system.mapper.ClOrderItemMapper;
import com.ruoyi.system.domain.ClOrder;
import com.ruoyi.system.domain.ClOrderItem;
import com.ruoyi.system.domain.ClCustomOrder;
import com.ruoyi.system.service.IClOrderService;
import com.ruoyi.system.service.IClCustomOrderService;

/**
 * 订单Service业务层处理
 * 
 * @author ruoyi
 * @date 2026-01-26
 */
@Service
public class ClOrderServiceImpl implements IClOrderService 
{
    @Autowired
    private ClOrderMapper clOrderMapper;

    @Autowired
    private ClOrderItemMapper clOrderItemMapper;

    @Autowired
    private IClCustomOrderService clCustomOrderService;

    /**
     * 查询订单
     * 
     * @param orderId 订单主键
     * @return 订单
     */
    @Override
    public ClOrder selectClOrderByOrderId(Long orderId)
    {
        ClOrder order = clOrderMapper.selectClOrderByOrderId(orderId);
        if (order != null) {
            List<ClOrderItem> orderItems = clOrderItemMapper.selectClOrderItemByOrderId(orderId);
            order.setOrderItems(orderItems);

            ClCustomOrder customQuery = new ClCustomOrder();
            customQuery.setOrderId(orderId);
            List<ClCustomOrder> customOrders = clCustomOrderService.selectClCustomOrderList(customQuery);
            order.setCustomOrders(customOrders);
        }
        return order;
    }

    /**
     * 查询订单列表
     * 
     * @param clOrder 订单
     * @return 订单
     */
    @Override
    public List<ClOrder> selectClOrderList(ClOrder clOrder)
    {
        return clOrderMapper.selectClOrderList(clOrder);
    }

    /**
     * 新增订单
     * 
     * @param clOrder 订单
     * @return 结果
     */
    @Override
    public int insertClOrder(ClOrder clOrder)
    {
        clOrder.setCreateTime(DateUtils.getNowDate());
        return clOrderMapper.insertClOrder(clOrder);
    }

    /**
     * 修改订单
     * 
     * @param clOrder 订单
     * @return 结果
     */
    @Override
    public int updateClOrder(ClOrder clOrder)
    {
        clOrder.setUpdateTime(DateUtils.getNowDate());
        return clOrderMapper.updateClOrder(clOrder);
    }

    /**
     * 批量删除订单
     * 
     * @param orderIds 需要删除的订单主键
     * @return 结果
     */
    @Override
    public int deleteClOrderByOrderIds(Long[] orderIds)
    {
        return clOrderMapper.deleteClOrderByOrderIds(orderIds);
    }

    /**
     * 删除订单信息
     * 
     * @param orderId 订单主键
     * @return 结果
     */
    @Override
    public int deleteClOrderByOrderId(Long orderId)
    {
        return clOrderMapper.deleteClOrderByOrderId(orderId);
    }

    /**
     * 根据订单ID查询订单商品列表
     * 
     * @param orderId 订单主键
     * @return 订单商品列表
     */
    @Override
    public List<ClOrderItem> selectClOrderItemByOrderId(Long orderId)
    {
        return clOrderItemMapper.selectClOrderItemByOrderId(orderId);
    }

    /**
     * 新增订单商品
     * 
     * @param clOrderItem 订单商品
     * @return 结果
     */
    @Override
    public int insertClOrderItem(ClOrderItem clOrderItem)
    {
        return clOrderItemMapper.insertClOrderItem(clOrderItem);
    }

    /**
     * 批量新增订单商品
     * 
     * @param clOrderItems 订单商品列表
     * @return 结果
     */
    @Override
    public int insertClOrderItems(List<ClOrderItem> clOrderItems)
    {
        int result = 0;
        for (ClOrderItem item : clOrderItems) {
            result += clOrderItemMapper.insertClOrderItem(item);
        }
        return result;
    }

    /**
     * 根据订单ID删除订单商品
     * 
     * @param orderId 订单主键
     * @return 结果
     */
    @Override
    public int deleteClOrderItemByOrderId(Long orderId)
    {
        return clOrderItemMapper.deleteClOrderItemByOrderIds(new Long[]{orderId});
    }

    /**
     * 获取今天的订单数量
     * 
     * @return 今天的订单数量
     */
    @Override
    public int getTodayOrderCount()
    {
        return clOrderMapper.getTodayOrderCount();
    }

    /**
     * 获取最大订单号（用于生成新订单号）
     * 
     * @return 最大订单号
     */
    @Override
    public String getMaxOrderNo()
    {
        return clOrderMapper.getMaxOrderNo();
    }
}
