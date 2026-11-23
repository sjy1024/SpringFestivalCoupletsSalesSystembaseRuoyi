package com.ruoyi.system.service.impl;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.ruoyi.common.core.domain.entity.SysUser;
import com.ruoyi.system.mapper.DashboardMapper;
import com.ruoyi.system.service.IDashboardService;

/**
 * 数据大屏Service业务层处理
 * 
 * @author ruoyi
 */
@Service
public class DashboardServiceImpl implements IDashboardService 
{
    @Autowired
    private DashboardMapper dashboardMapper;

    /**
     * 获取统计数据
     * 
     * @return 统计数据列表
     */
    @Override
    public List<Map<String, Object>> getStats()
    {
        List<Map<String, Object>> stats = new ArrayList<>();
        
        // 今日订单数
        Map<String, Object> orderStat = new HashMap<>();
        orderStat.put("label", "今日订单");
        orderStat.put("value", dashboardMapper.getTodayOrderCount());
        orderStat.put("icon", "el-icon-shopping-cart-2");
        orderStat.put("color", "#dc2626");
        stats.add(orderStat);
        
        // 今日销售额
        Map<String, Object> salesStat = new HashMap<>();
        salesStat.put("label", "今日销售");
        salesStat.put("value", "¥" + dashboardMapper.getTodaySales());
        salesStat.put("icon", "el-icon-coin");
        salesStat.put("color", "#eab308");
        stats.add(salesStat);
        
        // 商品总数
        Map<String, Object> goodsStat = new HashMap<>();
        goodsStat.put("label", "商品总数");
        goodsStat.put("value", dashboardMapper.getTotalGoodsCount());
        goodsStat.put("icon", "el-icon-goods");
        goodsStat.put("color", "#ef4444");
        stats.add(goodsStat);
        
        return stats;
    }

    /**
     * 获取最近订单
     * 
     * @return 订单列表
     */
    @Override
    public List<Map<String, Object>> getRecentOrders()
    {
        return dashboardMapper.getRecentOrders();
    }

    /**
     * 获取库存预警
     * 
     * @return 库存预警列表
     */
    @Override
    public List<Map<String, Object>> getStockAlerts()
    {
        return dashboardMapper.getStockAlerts();
    }

    /**
     * 获取近7天销售数据
     * 
     * @return 销售数据列表
     */
    @Override
    public List<Map<String, Object>> getWeeklySales()
    {
        return dashboardMapper.getWeeklySales();
    }

    /**
     * 获取订单状态分布
     * 
     * @return 状态分布列表
     */
    @Override
    public List<Map<String, Object>> getOrderStatusDistribution()
    {
        return dashboardMapper.getOrderStatusDistribution();
    }

    /**
     * 获取热门商品排行
     * 
     * @return 商品排行列表
     */
    @Override
    public List<Map<String, Object>> getHotGoodsRanking()
    {
        return dashboardMapper.getHotGoodsRanking();
    }

    /**
     * 获取定制订单统计
     * 
     * @return 定制订单统计
     */
    @Override
    public Map<String, Object> getCustomOrderStats()
    {
        return dashboardMapper.getCustomOrderStats();
    }

    /**
     * 获取AI对话统计
     * 
     * @return AI对话统计
     */
    @Override
    public Map<String, Object> getAIChatStats()
    {
        return dashboardMapper.getAIChatStats();
    }

    @Override
    public Map<String, Object> getHomeOverview()
    {
        Map<String, Object> overview = new HashMap<>();
        overview.put("totalGoods", dashboardMapper.getTotalGoodsCount());
        overview.put("totalOrders", dashboardMapper.getTotalOrderCount());
        overview.put("todaySales", dashboardMapper.getTodaySales());
        overview.put("pendingOrders", dashboardMapper.getPendingOrderCount());
        return overview;
    }

    @Override
    public List<Map<String, Object>> getHotGoodsForHome()
    {
        return dashboardMapper.getHotGoodsForHome();
    }
}
