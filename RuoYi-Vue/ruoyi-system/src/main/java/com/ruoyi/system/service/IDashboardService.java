package com.ruoyi.system.service;

import java.util.List;
import java.util.Map;

/**
 * 数据大屏Service接口
 * 
 * @author ruoyi
 */
public interface IDashboardService 
{
    /**
     * 获取统计数据
     * 
     * @return 统计数据列表
     */
    public List<Map<String, Object>> getStats();

    /**
     * 获取最近订单
     * 
     * @return 订单列表
     */
    public List<Map<String, Object>> getRecentOrders();

    /**
     * 获取库存预警
     * 
     * @return 库存预警列表
     */
    public List<Map<String, Object>> getStockAlerts();

    /**
     * 获取近7天销售数据
     * 
     * @return 销售数据列表
     */
    public List<Map<String, Object>> getWeeklySales();

    /**
     * 获取订单状态分布
     * 
     * @return 状态分布列表
     */
    public List<Map<String, Object>> getOrderStatusDistribution();

    /**
     * 获取热门商品排行
     * 
     * @return 商品排行列表
     */
    public List<Map<String, Object>> getHotGoodsRanking();

    /**
     * 获取定制订单统计
     * 
     * @return 定制订单统计
     */
    public Map<String, Object> getCustomOrderStats();

    /**
     * 获取AI对话统计
     * 
     * @return AI对话统计
     */
    public Map<String, Object> getAIChatStats();

    /**
     * 获取首页概览数据
     * 
     * @return 首页概览
     */
    public Map<String, Object> getHomeOverview();

    /**
     * 获取首页热门商品
     * 
     * @return 商品列表
     */
    public List<Map<String, Object>> getHotGoodsForHome();
}
