package com.ruoyi.web.controller.cl;

import java.util.List;
import java.util.Date;
import java.util.Map;
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
import com.ruoyi.system.domain.ClOrder;
import com.ruoyi.system.service.IClOrderService;
import com.ruoyi.common.utils.poi.ExcelUtil;
import com.ruoyi.common.core.page.TableDataInfo;

/**
 * 订单Controller
 * 
 * @author ruoyi
 * @date 2026-01-26
 */
@RestController
@RequestMapping("/system/order")
public class ClOrderController extends BaseController
{
    @Autowired
    private IClOrderService clOrderService;

    /**
     * 查询订单列表
     */
    @PreAuthorize("@ss.hasPermi('system:order:list')")
    @GetMapping("/list")
    public TableDataInfo list(ClOrder clOrder)
    {
        startPage();
        List<ClOrder> list = clOrderService.selectClOrderList(clOrder);
        return getDataTable(list);
    }

    /**
     * 导出订单列表
     */
    @PreAuthorize("@ss.hasPermi('system:order:export')")
    @Log(title = "订单", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(HttpServletResponse response, ClOrder clOrder)
    {
        List<ClOrder> list = clOrderService.selectClOrderList(clOrder);
        ExcelUtil<ClOrder> util = new ExcelUtil<ClOrder>(ClOrder.class);
        util.exportExcel(response, list, "订单数据");
    }

    /**
     * 获取订单详细信息
     */
    @PreAuthorize("@ss.hasPermi('system:order:query')")
    @GetMapping(value = "/{orderId}")
    public AjaxResult getInfo(@PathVariable("orderId") Long orderId)
    {
        return success(clOrderService.selectClOrderByOrderId(orderId));
    }

    /**
     * 新增订单
     */
    @PreAuthorize("@ss.hasPermi('system:order:add')")
    @Log(title = "订单", businessType = BusinessType.INSERT)
    @PostMapping
    public AjaxResult add(@RequestBody ClOrder clOrder)
    {
        return toAjax(clOrderService.insertClOrder(clOrder));
    }

    /**
     * 修改订单
     */
    @PreAuthorize("@ss.hasPermi('system:order:edit')")
    @Log(title = "订单", businessType = BusinessType.UPDATE)
    @PutMapping
    public AjaxResult edit(@RequestBody ClOrder clOrder)
    {
        return toAjax(clOrderService.updateClOrder(clOrder));
    }

    /**
     * 审核用户取消申请
     */
    @PreAuthorize("@ss.hasPermi('system:order:edit')")
    @Log(title = "订单取消审核", businessType = BusinessType.UPDATE)
    @PutMapping("/reviewCancel")
    public AjaxResult reviewCancel(@RequestBody Map<String, Object> params)
    {
        Long orderId = Long.parseLong(params.get("orderId").toString());
        String action = params.get("action").toString();
        String reviewRemark = params.getOrDefault("reviewRemark", "").toString().trim();

        ClOrder order = clOrderService.selectClOrderByOrderId(orderId);
        if (order == null) {
            return error("订单不存在");
        }
        if (!"1".equals(order.getCancelStatus())) {
            return error("该订单没有待审核的取消申请");
        }

        if ("approve".equals(action)) {
            order.setStatus("4");
            order.setCancelStatus("2");
            order.setRemark(appendRemark(order.getRemark(), "[商家同意取消]"));
        } else if ("reject".equals(action)) {
            order.setCancelStatus("3");
            String rejectLine = "[商家拒绝取消]";
            if (!reviewRemark.isEmpty()) {
                rejectLine += " " + reviewRemark;
            }
            order.setRemark(appendRemark(order.getRemark(), rejectLine));
        } else {
            return error("无效审核操作");
        }
        order.setUpdateTime(new Date());
        order.setUpdateBy(getUsername());
        return toAjax(clOrderService.updateClOrder(order));
    }

    private String appendRemark(String original, String line) {
        if (line == null || line.isEmpty()) {
            return original;
        }
        if (original == null || original.isEmpty()) {
            return line;
        }
        return original + "\n" + line;
    }

    /**
     * 删除订单
     */
    @PreAuthorize("@ss.hasPermi('system:order:remove')")
    @Log(title = "订单", businessType = BusinessType.DELETE)
	@DeleteMapping("/{orderIds}")
    public AjaxResult remove(@PathVariable Long[] orderIds)
    {
        return toAjax(clOrderService.deleteClOrderByOrderIds(orderIds));
    }
}
