package com.ruoyi.web.controller.cl;

import java.util.List;
import javax.servlet.http.HttpServletResponse;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.ruoyi.common.annotation.Log;
import com.ruoyi.common.core.controller.BaseController;
import com.ruoyi.common.core.domain.AjaxResult;
import com.ruoyi.common.enums.BusinessType;
import com.ruoyi.system.domain.ClCustomOrder;
import com.ruoyi.system.service.IClCustomOrderService;
import com.ruoyi.common.utils.poi.ExcelUtil;
import com.ruoyi.common.core.page.TableDataInfo;

/**
 * 定制订单Controller
 *
 * @author ruoyi
 */
@RestController
@RequestMapping("/system/customOrder")
public class ClCustomOrderController extends BaseController
{
    @Autowired
    private IClCustomOrderService clCustomOrderService;

    /**
     * 查询定制订单列表
     */
    @PreAuthorize("@ss.hasPermi('system:customOrder:list')")
    @GetMapping("/list")
    public TableDataInfo list(ClCustomOrder clCustomOrder)
    {
        startPage();
        List<ClCustomOrder> list = clCustomOrderService.selectClCustomOrderList(clCustomOrder);
        return getDataTable(list);
    }

    /**
     * 导出定制订单列表
     */
    @PreAuthorize("@ss.hasPermi('system:customOrder:export')")
    @Log(title = "定制订单", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(HttpServletResponse response, ClCustomOrder clCustomOrder)
    {
        List<ClCustomOrder> list = clCustomOrderService.selectClCustomOrderList(clCustomOrder);
        ExcelUtil<ClCustomOrder> util = new ExcelUtil<ClCustomOrder>(ClCustomOrder.class);
        util.exportExcel(response, list, "定制订单数据");
    }

    /**
     * 获取定制订单详细信息
     */
    @PreAuthorize("@ss.hasPermi('system:customOrder:query')")
    @GetMapping(value = "/{customId}")
    public AjaxResult getInfo(@PathVariable("customId") Long customId)
    {
        return success(clCustomOrderService.selectClCustomOrderByCustomId(customId));
    }

    /**
     * 修改定制订单
     */
    @PreAuthorize("@ss.hasPermi('system:customOrder:edit')")
    @Log(title = "定制订单", businessType = BusinessType.UPDATE)
    @PutMapping
    public AjaxResult edit(@RequestBody ClCustomOrder clCustomOrder)
    {
        return toAjax(clCustomOrderService.updateClCustomOrder(clCustomOrder));
    }

    /**
     * 删除定制订单
     */
    @PreAuthorize("@ss.hasPermi('system:customOrder:remove')")
    @Log(title = "定制订单", businessType = BusinessType.DELETE)
    @DeleteMapping("/{customIds}")
    public AjaxResult remove(@PathVariable Long[] customIds)
    {
        return toAjax(clCustomOrderService.deleteClCustomOrderByCustomIds(customIds));
    }
}
