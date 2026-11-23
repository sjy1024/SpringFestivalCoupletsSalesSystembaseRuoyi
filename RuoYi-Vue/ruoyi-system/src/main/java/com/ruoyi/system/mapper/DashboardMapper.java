package com.ruoyi.system.mapper;

import java.util.List;
import java.util.Map;

/**
 * 数据大屏Mapper接口
 * 
 * @author ruoyi
 */
public interface DashboardMapper 
{
    /**
     * 获取今日订单数
     * 
     * @return 订单数
     */
    public int getTodayOrderCount();

    /**
     * 获取今日销售额
     * 
     * @return 销售额
     */
    public String getTodaySales();

    /**
     * 获取商品总数
     * 
     * @return 商品总数
     */
    public int getTotalGoodsCount();

    /**
     * 获取订单总数
     * 
     * @return 订单总数
     */
    public int getTotalOrderCount();

    /**
     * 获取待处理订单数（待支付/已支付/制作中）
     * 
     * @return 待处理订单数
     */
    public int getPendingOrderCount();

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
     * 获取首页热门商品详情
     * 
     * @return 商品列表
     */
    public List<Map<String, Object>> getHotGoodsForHome();

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
}
