package com.ruoyi.web.controller.system;

import java.util.HashMap;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.ruoyi.common.core.controller.BaseController;
import com.ruoyi.common.core.domain.AjaxResult;
import com.ruoyi.system.service.IDashboardService;

/**
 * 数据大屏Controller
 * 
 * @author ruoyi
 */
@RestController
@RequestMapping("/system/dashboard")
public class DashboardController extends BaseController
{
    @Autowired
    private IDashboardService dashboardService;

    /**
     * 获取大屏数据
     */
    @GetMapping("/data")
    public AjaxResult getData()
    {
        Map<String, Object> data = new HashMap<>();
        
        // 获取统计数据
        data.put("stats", dashboardService.getStats());
        
        // 获取最近订单
        data.put("orders", dashboardService.getRecentOrders());
        
        // 获取库存预警
        data.put("alerts", dashboardService.getStockAlerts());
        
        // 获取图表数据
        data.put("weeklySales", dashboardService.getWeeklySales());
        data.put("orderStatusDistribution", dashboardService.getOrderStatusDistribution());
        data.put("hotGoodsRanking", dashboardService.getHotGoodsRanking());
        data.put("customOrderStats", dashboardService.getCustomOrderStats());
        data.put("aiChatStats", dashboardService.getAIChatStats());
        data.put("homeOverview", dashboardService.getHomeOverview());
        data.put("hotGoodsForHome", dashboardService.getHotGoodsForHome());
        
        return AjaxResult.success(data);
    }
}
