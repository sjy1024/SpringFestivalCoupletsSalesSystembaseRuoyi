package com.ruoyi.web.controller.app;

import com.ruoyi.common.annotation.Anonymous;
import com.ruoyi.common.core.controller.BaseController;
import com.ruoyi.common.core.domain.AjaxResult;
import com.ruoyi.common.utils.StringUtils;
import com.ruoyi.system.domain.ClGoods;
import com.ruoyi.system.domain.ClOrder;
import com.ruoyi.system.domain.ClOrderItem;
import com.ruoyi.system.service.IClGoodsService;
import com.ruoyi.system.service.IClOrderService;
import com.ruoyi.system.utils.GoodsSpecHelper;
import com.ruoyi.system.utils.OrderNoGenerator;
import com.ruoyi.web.controller.app.dto.AppCreateOrderRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 小程序端 - 订单接口（C端）
 * 
 * @author ruoyi
 * @date 2026-02-03
 */
@Anonymous
@RestController
@RequestMapping("/api/app/order")
public class AppOrderController extends BaseController {

    @Autowired
    private IClOrderService clOrderService;

    @Autowired
    private IClGoodsService clGoodsService;

    /**
     * 创建订单
     * 
     * @param request 创建订单请求
     * @return 订单ID
     */
    @PostMapping("/create")
    @Transactional
    public AjaxResult createOrder(@RequestBody AppCreateOrderRequest request,
                                  @RequestHeader(value = "X-Device-ID", required = false) String headerDeviceId) {
        try {
            String dev = AppClientDeviceCheck.resolveDeviceId(request.getDeviceId(), headerDeviceId);
            if (AppClientDeviceCheck.isBlank(dev)) {
                return AjaxResult.error("设备ID不能为空");
            }
            request.setDeviceId(dev);
            // 判断订单类型
            if ("multi".equals(request.getType())) {
                return createMultiGoodsOrder(request);
            } else {
                return createSingleGoodsOrder(request);
            }
        } catch (Exception e) {
            logger.error("创建订单失败", e);
            return AjaxResult.error("创建订单失败");
        }
    }

    /**
     * 创建单商品订单
     */
    private AjaxResult createSingleGoodsOrder(AppCreateOrderRequest request) {
        // 1. 验证商品存在且上架
        ClGoods goods = clGoodsService.selectClGoodsByGoodsId(request.getGoodsId());
        if (goods == null) {
            return AjaxResult.error("商品不存在");
        }
        if (!"0".equals(goods.getStatus())) {
            return AjaxResult.error("商品已下架");
        }

        // 2. 验证库存充足
        if (goods.getStock() < request.getQuantity()) {
            return AjaxResult.error("库存不足");
        }

        // 3. 生成订单号（大写字母 + 三位数字）
        String maxOrderNo = clOrderService.getMaxOrderNo();
        String orderNo = OrderNoGenerator.generateOrderNo(maxOrderNo);

        // 4. 计算单价与订单总金额
        BigDecimal unitPrice = goods.getGoodsPrice();
        String itemSpec = null;
        if (GoodsSpecHelper.isSpecGoods(goods.getGoodsType())) {
            try {
                Map<String, Object> resolved = GoodsSpecHelper.resolveSelection(
                    goods.getGoodsType(), goods.getSpecOptions(),
                    request.getSizeId(), request.getMaterialId());
                unitPrice = (BigDecimal) resolved.get("unitPrice");
                itemSpec = (String) resolved.get("itemSpec");
            } catch (IllegalArgumentException e) {
                return AjaxResult.error(e.getMessage());
            }
        }

        BigDecimal totalAmount = unitPrice.multiply(new BigDecimal(request.getQuantity()));

        // 5. 创建订单
        ClOrder order = new ClOrder();
        order.setOrderNo(orderNo);
        order.setDeviceId(request.getDeviceId());
        order.setOrderType("0");  // 普通订单（单商品）
        order.setStatus("0");     // 待支付
        order.setTotalAmount(totalAmount);
        order.setReceiverName(request.getReceiverName());
        order.setReceiverPhone(request.getReceiverPhone());
        order.setReceiverAddress(request.getReceiverAddress());
        order.setCreateTime(new Date());
        order.setUpdateTime(new Date());
        
        clOrderService.insertClOrder(order);

        // 6. 创建订单项
        ClOrderItem item = new ClOrderItem();
        item.setOrderId(order.getOrderId());
        item.setGoodsId(request.getGoodsId());
        item.setGoodsName(goods.getGoodsName());
        item.setGoodsPrice(unitPrice);
        item.setQuantity(request.getQuantity());
        item.setTotalPrice(totalAmount);
        item.setItemSpec(itemSpec);
        item.setCreateTime(new Date());
        
        clOrderService.insertClOrderItem(item);

        // 7. 扣减库存
        goods.setStock(goods.getStock() - request.getQuantity());
        clGoodsService.updateClGoods(goods);

        // 8. 返回订单ID
        Map<String, Object> result = new HashMap<>();
        result.put("orderId", order.getOrderId());
        result.put("orderNo", order.getOrderNo());
        result.put("totalAmount", order.getTotalAmount());
        
        return success(result);
    }

    /**
     * 创建多商品订单
     */
    private AjaxResult createMultiGoodsOrder(AppCreateOrderRequest request) {
        if (request.getGoodsList() == null || request.getGoodsList().isEmpty()) {
            return AjaxResult.error("商品列表不能为空");
        }

        // 1. 验证所有商品并计算总金额
        BigDecimal totalAmount = BigDecimal.ZERO;
        Map<Long, ClGoods> goodsMap = new HashMap<>();
        Map<Long, Integer> stockDeduction = new HashMap<>();

        for (AppCreateOrderRequest.OrderGoodsItem item : request.getGoodsList()) {
            ClGoods goods = clGoodsService.selectClGoodsByGoodsId(item.getGoodsId());
            if (goods == null) {
                return AjaxResult.error("商品不存在：" + item.getGoodsId());
            }
            if (!"0".equals(goods.getStatus())) {
                return AjaxResult.error("商品已下架：" + goods.getGoodsName());
            }

            int totalQty = stockDeduction.getOrDefault(item.getGoodsId(), 0) + item.getQuantity();
            if (goods.getStock() < totalQty) {
                return AjaxResult.error("库存不足：" + goods.getGoodsName());
            }
            stockDeduction.put(item.getGoodsId(), totalQty);

            BigDecimal unitPrice = goods.getGoodsPrice();
            if (GoodsSpecHelper.isSpecGoods(goods.getGoodsType())) {
                try {
                    Map<String, Object> resolved = GoodsSpecHelper.resolveSelection(
                        goods.getGoodsType(), goods.getSpecOptions(),
                        item.getSizeId(), item.getMaterialId());
                    unitPrice = (BigDecimal) resolved.get("unitPrice");
                } catch (IllegalArgumentException e) {
                    return AjaxResult.error(e.getMessage() + "：" + goods.getGoodsName());
                }
            }
            if (item.getPrice() == null || item.getPrice().compareTo(unitPrice) != 0) {
                return AjaxResult.error("商品价格异常：" + goods.getGoodsName());
            }

            goodsMap.put(item.getGoodsId(), goods);
            totalAmount = totalAmount.add(unitPrice.multiply(new BigDecimal(item.getQuantity())));
        }

        // 2. 生成订单号（大写字母 + 三位数字）
        String maxOrderNo = clOrderService.getMaxOrderNo();
        String orderNo = OrderNoGenerator.generateOrderNo(maxOrderNo);

        // 3. 创建订单
        ClOrder order = new ClOrder();
        order.setOrderNo(orderNo);
        order.setDeviceId(request.getDeviceId());
        order.setOrderType("0");  // 普通订单（多商品）
        order.setStatus("0");     // 待支付
        order.setTotalAmount(totalAmount);
        order.setReceiverName(request.getReceiverName());
        order.setReceiverPhone(request.getReceiverPhone());
        order.setReceiverAddress(request.getReceiverAddress());
        order.setCreateTime(new Date());
        order.setUpdateTime(new Date());
        
        clOrderService.insertClOrder(order);

        // 4. 创建订单项并扣减库存
        for (AppCreateOrderRequest.OrderGoodsItem item : request.getGoodsList()) {
            ClGoods goods = goodsMap.get(item.getGoodsId());

            BigDecimal unitPrice = goods.getGoodsPrice();
            String itemSpec = null;
            if (GoodsSpecHelper.isSpecGoods(goods.getGoodsType())) {
                Map<String, Object> resolved = GoodsSpecHelper.resolveSelection(
                    goods.getGoodsType(), goods.getSpecOptions(),
                    item.getSizeId(), item.getMaterialId());
                unitPrice = (BigDecimal) resolved.get("unitPrice");
                itemSpec = (String) resolved.get("itemSpec");
            }

            ClOrderItem orderItem = new ClOrderItem();
            orderItem.setOrderId(order.getOrderId());
            orderItem.setGoodsId(item.getGoodsId());
            orderItem.setGoodsName(goods.getGoodsName());
            orderItem.setGoodsPrice(unitPrice);
            orderItem.setQuantity(item.getQuantity());
            orderItem.setTotalPrice(unitPrice.multiply(new BigDecimal(item.getQuantity())));
            orderItem.setItemSpec(itemSpec);
            orderItem.setCreateTime(new Date());

            clOrderService.insertClOrderItem(orderItem);
        }

        for (Map.Entry<Long, Integer> entry : stockDeduction.entrySet()) {
            ClGoods goods = goodsMap.get(entry.getKey());
            goods.setStock(goods.getStock() - entry.getValue());
            clGoodsService.updateClGoods(goods);
        }

        // 5. 返回订单ID
        Map<String, Object> result = new HashMap<>();
        result.put("orderId", order.getOrderId());
        result.put("orderNo", order.getOrderNo());
        result.put("totalAmount", order.getTotalAmount());
        
        return success(result);
    }

    /**
     * 模拟支付
     * 
     * @param data 支付数据
     * @return 支付结果
     */
    @PostMapping("/mockPay")
    public AjaxResult mockPay(@RequestBody Map<String, Object> data,
                              @RequestHeader(value = "X-Device-ID", required = false) String headerDeviceId) {
        try {
            Long orderId = Long.parseLong(data.get("orderId").toString());
            String deviceId = AppClientDeviceCheck.deviceIdFromBody(data, headerDeviceId);
            if (AppClientDeviceCheck.isBlank(deviceId)) {
                return AjaxResult.error("设备ID不能为空");
            }

            // 查询订单
            ClOrder order = clOrderService.selectClOrderByOrderId(orderId);
            if (order == null) {
                return AjaxResult.error("订单不存在");
            }
            if (!AppClientDeviceCheck.orderBelongs(order, deviceId)) {
                return AjaxResult.error("无权操作该订单");
            }

            // 验证订单状态
            if (!"0".equals(order.getStatus())) {
                return AjaxResult.error("订单状态异常，无法支付");
            }

            // 更新订单状态为已支付
            order.setStatus("1");
            order.setUpdateTime(new Date());
            clOrderService.updateClOrder(order);

            Map<String, Object> result = new HashMap<>();
            result.put("orderId", orderId);
            result.put("status", "1");
            result.put("message", "支付成功");
            
            return success(result);
        } catch (Exception e) {
            logger.error("支付失败", e);
            return AjaxResult.error("支付失败");
        }
    }

    /**
     * 确认收货
     * 
     * @param data 订单数据
     * @return 确认收货结果
     */
    @PostMapping("/confirmReceive")
    public AjaxResult confirmReceive(@RequestBody Map<String, Object> data,
                                     @RequestHeader(value = "X-Device-ID", required = false) String headerDeviceId) {
        try {
            Long orderId = Long.parseLong(data.get("orderId").toString());
            String deviceId = AppClientDeviceCheck.deviceIdFromBody(data, headerDeviceId);
            if (AppClientDeviceCheck.isBlank(deviceId)) {
                return AjaxResult.error("设备ID不能为空");
            }

            // 查询订单
            ClOrder order = clOrderService.selectClOrderByOrderId(orderId);
            if (order == null) {
                return AjaxResult.error("订单不存在");
            }
            if (!AppClientDeviceCheck.orderBelongs(order, deviceId)) {
                return AjaxResult.error("无权操作该订单");
            }

            // 验证订单状态（已支付或制作中才能确认收货）
            // 状态定义：0待支付 1已支付 2制作中 3已完成 4已取消
            if (!"1".equals(order.getStatus()) && !"2".equals(order.getStatus())) {
                return AjaxResult.error("订单状态异常，无法确认收货。当前状态：" + getStatusName(order.getStatus()));
            }

            // 更新订单状态为已完成（确认收货）
            order.setStatus("3");
            order.setUpdateTime(new Date());
            clOrderService.updateClOrder(order);

            Map<String, Object> result = new HashMap<>();
            result.put("orderId", orderId);
            result.put("status", "3");
            result.put("message", "确认收货成功");
            
            return success(result);
        } catch (Exception e) {
            logger.error("确认收货失败", e);
            return AjaxResult.error("确认收货失败：" + e.getMessage());
        }
    }

    /**
     * 按设备ID或收货电话查询当前用户的订单列表
     * 
     * @param deviceId 设备ID
     * @param receiverPhone 收货电话
     * @param status 订单状态
     * @return 订单列表
     */
    @GetMapping("/list")
    public AjaxResult list(@RequestParam(required = false) String deviceId,
                           @RequestParam(required = false) String receiverPhone,
                           @RequestParam(required = false) String status,
                           @RequestHeader(value = "X-Device-ID", required = false) String headerDeviceId) {
        String effectiveDevice = AppClientDeviceCheck.resolveDeviceId(deviceId, headerDeviceId);
        if (AppClientDeviceCheck.isBlank(effectiveDevice) && StringUtils.isEmpty(receiverPhone)) {
            return error("请传入 deviceId（或请求头 X-Device-ID）或 receiverPhone，避免全表查询");
        }
        ClOrder query = new ClOrder();
        query.setDeviceId(StringUtils.isNotEmpty(effectiveDevice) ? effectiveDevice : null);
        query.setReceiverPhone(receiverPhone);
        query.setStatus(status);
        List<ClOrder> list = clOrderService.selectClOrderList(query);

        List<Map<String, Object>> resultList = new java.util.ArrayList<>();
        for (ClOrder order : list) {
            Map<String, Object> orderVO = new HashMap<>();
            orderVO.put("orderId", order.getOrderId());
            orderVO.put("orderNo", order.getOrderNo());
            orderVO.put("status", order.getStatus());
            orderVO.put("cancelStatus", order.getCancelStatus() != null ? order.getCancelStatus() : "0");
            orderVO.put("cancelReason", order.getCancelReason());
            orderVO.put("totalAmount", order.getTotalAmount());
            orderVO.put("receiverName", order.getReceiverName());
            orderVO.put("receiverPhone", order.getReceiverPhone());
            orderVO.put("receiverAddress", order.getReceiverAddress());
            orderVO.put("createTime", order.getCreateTime());
            orderVO.put("updateTime", order.getUpdateTime());
            orderVO.put("remark", order.getRemark());
            List<ClOrderItem> orderItems = clOrderService.selectClOrderItemByOrderId(order.getOrderId());
            orderVO.put("orderItemVOs", buildOrderItemVOs(orderItems));
            resultList.add(orderVO);
        }
        return success(resultList);
    }

    /**
     * 获取订单详情
     * 
     * @param orderId 订单ID
     * @return 订单详情
     */
    @GetMapping("/{orderId}")
    public AjaxResult getOrderDetail(@PathVariable("orderId") Long orderId,
                                     @RequestParam(value = "deviceId", required = false) String deviceId,
                                     @RequestHeader(value = "X-Device-ID", required = false) String headerDeviceId) {
        try {
            String dev = AppClientDeviceCheck.resolveDeviceId(deviceId, headerDeviceId);
            if (AppClientDeviceCheck.isBlank(dev)) {
                return AjaxResult.error("设备ID不能为空");
            }
            // 查询订单基本信息
            ClOrder order = clOrderService.selectClOrderByOrderId(orderId);
            if (order == null) {
                return AjaxResult.error("订单不存在");
            }
            if (!AppClientDeviceCheck.orderBelongs(order, dev)) {
                return AjaxResult.error("无权查看该订单");
            }

            // 查询订单项列表
            List<ClOrderItem> orderItems = clOrderService.selectClOrderItemByOrderId(orderId);
            List<Map<String, Object>> orderItemVOs = buildOrderItemVOs(orderItems);

            // 组装返回数据
            Map<String, Object> result = new HashMap<>();
            result.put("orderId", order.getOrderId());
            result.put("orderNo", order.getOrderNo());
            result.put("status", order.getStatus());
            result.put("cancelStatus", order.getCancelStatus() != null ? order.getCancelStatus() : "0");
            result.put("cancelReason", order.getCancelReason());
            result.put("cancelStatusName", getCancelStatusName(order.getCancelStatus()));
            result.put("orderStatusName", getStatusName(order.getStatus()));
            result.put("totalAmount", order.getTotalAmount());
            result.put("receiverName", order.getReceiverName());
            result.put("receiverPhone", order.getReceiverPhone());
            result.put("receiverAddress", order.getReceiverAddress());
            result.put("createTime", order.getCreateTime() != null ? order.getCreateTime().getTime() : null);
            result.put("updateTime", order.getUpdateTime() != null ? order.getUpdateTime().getTime() : null);
            result.put("remark", order.getRemark());
            
            // 订单项信息
            result.put("orderItemVOs", orderItemVOs);
            
            // 物流信息（暂时为空对象）
            Map<String, Object> logisticsVO = new HashMap<>();
            logisticsVO.put("receiverName", order.getReceiverName());
            logisticsVO.put("receiverPhone", order.getReceiverPhone());
            logisticsVO.put("receiverCity", "");
            logisticsVO.put("receiverCountry", "");
            logisticsVO.put("receiverArea", "");
            logisticsVO.put("receiverAddress", order.getReceiverAddress());
            logisticsVO.put("logisticsNo", "");
            logisticsVO.put("logisticsCompanyName", "");
            logisticsVO.put("logisticsCompanyTel", "");
            result.put("logisticsVO", logisticsVO);
            
            // 支付信息（暂时为空对象）
            Map<String, Object> paymentVO = new HashMap<>();
            paymentVO.put("paySuccessTime", "1".equals(order.getStatus()) ? order.getUpdateTime() : null);
            result.put("paymentVO", paymentVO);
            
            // 按钮信息（根据订单状态返回可操作按钮）
            result.put("buttonVOs", getOrderButtons(order.getStatus(), order.getCancelStatus()));
            
            // 商品总金额
            result.put("goodsAmountApp", order.getTotalAmount());
            result.put("paymentAmount", order.getTotalAmount());
            
            return success(result);
        } catch (Exception e) {
            logger.error("获取订单详情失败", e);
            return AjaxResult.error("获取订单详情失败");
        }
    }

    /**
     * 根据订单状态获取可操作按钮
     * 状态定义：0待支付 1已支付 2制作中 3已完成 4已取消
     */
    private List<Map<String, Object>> getOrderButtons(String status, String cancelStatus) {
        List<Map<String, Object>> buttons = new java.util.ArrayList<>();
        String cs = cancelStatus != null ? cancelStatus : "0";
        boolean cancelPending = "1".equals(cs);

        switch (status) {
            case "0": // 待支付
                buttons.add(createButton("pay", "去支付"));
                if (!cancelPending) {
                    buttons.add(createButton("cancel", "取消订单"));
                }
                break;
            case "1": // 已支付
                buttons.add(createButton("confirm", "确认收货"));
                if (!cancelPending) {
                    buttons.add(createButton("cancel", "申请取消"));
                }
                break;
            case "2": // 制作中
                buttons.add(createButton("confirm", "确认收货"));
                if (!cancelPending) {
                    buttons.add(createButton("cancel", "申请取消"));
                }
                break;
            case "3": // 已完成
                buttons.add(createButton("comment", "评价"));
                buttons.add(createButton("buyAgain", "再来一单"));
                break;
            case "4": // 已取消
                buttons.add(createButton("delete", "删除订单"));
                break;
        }

        return buttons;
    }

    /**
     * 创建按钮对象
     */
    private Map<String, Object> createButton(String type, String name) {
        Map<String, Object> button = new HashMap<>();
        button.put("type", type);
        button.put("name", name);
        return button;
    }

    /**
     * 申请取消订单（已支付/制作中需商家审核）
     */
    @PostMapping("/requestCancel")
    public AjaxResult requestCancel(@RequestBody Map<String, Object> params,
                                    @RequestHeader(value = "X-Device-ID", required = false) String headerDeviceId) {
        try {
            Long orderId = Long.parseLong(params.get("orderId").toString());
            String reason = params.getOrDefault("reason", "用户申请取消").toString().trim();
            String deviceId = AppClientDeviceCheck.deviceIdFromBody(params, headerDeviceId);
            if (AppClientDeviceCheck.isBlank(deviceId)) {
                return AjaxResult.error("设备ID不能为空");
            }

            ClOrder order = clOrderService.selectClOrderByOrderId(orderId);
            if (order == null) {
                return AjaxResult.error("订单不存在");
            }
            if (!AppClientDeviceCheck.orderBelongs(order, deviceId)) {
                return AjaxResult.error("无权操作该订单");
            }
            if (!"1".equals(order.getStatus()) && !"2".equals(order.getStatus())) {
                return AjaxResult.error("当前订单状态请使用直接取消");
            }
            if ("1".equals(order.getCancelStatus())) {
                return AjaxResult.error("取消申请审核中，请等待商家处理");
            }

            order.setCancelStatus("1");
            order.setCancelReason(reason.isEmpty() ? "用户申请取消" : reason);
            order.setUpdateTime(new Date());
            order.setRemark(appendRemark(order.getRemark(), "[用户申请取消] " + order.getCancelReason()));
            clOrderService.updateClOrder(order);

            Map<String, Object> result = new HashMap<>();
            result.put("orderId", orderId);
            result.put("cancelStatus", "1");
            result.put("cancelStatusName", getCancelStatusName("1"));
            result.put("message", "取消申请已提交，等待商家审核");
            return success(result);
        } catch (Exception e) {
            logger.error("申请取消订单失败", e);
            return AjaxResult.error("申请取消失败");
        }
    }

    /**
     * 更新订单状态
     * 
     * @param params 状态更新参数
     * @return 更新结果
     */
    @PostMapping("/updateStatus")
    public AjaxResult updateOrderStatus(@RequestBody Map<String, Object> params,
                                        @RequestHeader(value = "X-Device-ID", required = false) String headerDeviceId) {
        try {
            Long orderId = Long.parseLong(params.get("orderId").toString());
            String newStatus = params.get("status").toString();
            String remark = params.getOrDefault("remark", "").toString();
            String deviceId = AppClientDeviceCheck.deviceIdFromBody(params, headerDeviceId);
            if (AppClientDeviceCheck.isBlank(deviceId)) {
                return AjaxResult.error("设备ID不能为空");
            }

            // 查询订单
            ClOrder order = clOrderService.selectClOrderByOrderId(orderId);
            if (order == null) {
                return AjaxResult.error("订单不存在");
            }
            if (!AppClientDeviceCheck.orderBelongs(order, deviceId)) {
                return AjaxResult.error("无权操作该订单");
            }

            // 待支付 → 已支付 必须走 /mockPay（或后续真实支付回调），禁止本接口绕过支付
            if ("0".equals(order.getStatus()) && "1".equals(newStatus)) {
                return AjaxResult.error("待支付订单请通过支付接口完成支付");
            }

            // 已支付/制作中不可直接取消，须走申请取消审核
            if ("4".equals(newStatus) && ("1".equals(order.getStatus()) || "2".equals(order.getStatus()))) {
                return AjaxResult.error("已支付/制作中订单请提交取消申请，等待商家审核");
            }

            // 验证状态变更的合法性
            if (!isValidStatusTransition(order.getStatus(), newStatus)) {
                return AjaxResult.error("订单状态变更不合法");
            }

            // 更新订单状态
            order.setStatus(newStatus);
            order.setUpdateTime(new Date());
            if (!remark.isEmpty()) {
                order.setRemark(appendRemark(order.getRemark(), remark));
            }

            if ("4".equals(newStatus)) {
                order.setCancelStatus("2");
            }
            
            clOrderService.updateClOrder(order);

            Map<String, Object> result = new HashMap<>();
            result.put("orderId", orderId);
            result.put("status", newStatus);
            result.put("statusName", getStatusName(newStatus));
            result.put("message", "订单状态更新成功");
            
            return success(result);
        } catch (Exception e) {
            logger.error("更新订单状态失败", e);
            return AjaxResult.error("更新订单状态失败");
        }
    }

    /**
     * 验证订单状态变更是否合法
     * 状态定义：0待支付 1已支付 2制作中 3已完成 4已取消
     */
    private boolean isValidStatusTransition(String currentStatus, String newStatus) {
        // 定义合法的状态转换
        Map<String, String[]> validTransitions = new HashMap<>();
        validTransitions.put("0", new String[]{"4"}); // 待支付 → 仅允许取消（已支付须走 mockPay / 支付回调）
        validTransitions.put("1", new String[]{"2", "3", "4"}); // 已支付 → 制作中、已完成、已取消
        validTransitions.put("2", new String[]{"3", "4"}); // 制作中 → 已完成、已取消
        validTransitions.put("3", new String[]{}); // 已完成 → 无法变更
        validTransitions.put("4", new String[]{}); // 已取消 → 无法变更
        
        String[] allowedStatuses = validTransitions.get(currentStatus);
        if (allowedStatuses == null) {
            return false;
        }
        
        for (String allowedStatus : allowedStatuses) {
            if (allowedStatus.equals(newStatus)) {
                return true;
            }
        }
        return false;
    }

    private String getCancelStatusName(String cancelStatus) {
        if (cancelStatus == null || "0".equals(cancelStatus)) {
            return "";
        }
        Map<String, String> names = new HashMap<>();
        names.put("1", "取消审核中");
        names.put("2", "取消已通过");
        names.put("3", "取消已拒绝");
        return names.getOrDefault(cancelStatus, "");
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
     * 构建订单明细 VO（列表/详情共用）
     */
    private List<Map<String, Object>> buildOrderItemVOs(List<ClOrderItem> orderItems) {
        List<Map<String, Object>> orderItemVOs = new java.util.ArrayList<>();
        if (orderItems == null) {
            return orderItemVOs;
        }
        for (ClOrderItem item : orderItems) {
            Map<String, Object> itemVO = new HashMap<>();
            itemVO.put("itemId", item.getItemId());
            itemVO.put("id", item.getItemId());
            itemVO.put("orderId", item.getOrderId());
            itemVO.put("goodsId", item.getGoodsId());
            itemVO.put("goodsName", item.getGoodsName());
            itemVO.put("goodsPrice", item.getGoodsPrice());
            itemVO.put("actualPrice", item.getGoodsPrice());
            itemVO.put("quantity", item.getQuantity());
            itemVO.put("buyQuantity", item.getQuantity());
            itemVO.put("totalPrice", item.getTotalPrice());
            itemVO.put("itemSpec", item.getItemSpec());
            itemVO.put("specText", GoodsSpecHelper.formatSpecText(item.getItemSpec()));

            ClGoods goods = clGoodsService.selectClGoodsByGoodsId(item.getGoodsId());
            if (goods != null && goods.getCoverImage() != null) {
                itemVO.put("goodsPictureUrl", goods.getCoverImage());
                itemVO.put("thumb", goods.getCoverImage());
            } else {
                itemVO.put("goodsPictureUrl", "");
                itemVO.put("thumb", "");
            }
            orderItemVOs.add(itemVO);
        }
        return orderItemVOs;
    }

    /**
     * 获取状态名称
     * 状态定义：0待支付 1已支付 2制作中 3已完成 4已取消
     */
    private String getStatusName(String status) {
        Map<String, String> statusNames = new HashMap<>();
        statusNames.put("0", "待支付");
        statusNames.put("1", "已支付");
        statusNames.put("2", "制作中");
        statusNames.put("3", "已完成");
        statusNames.put("4", "已取消");
        return statusNames.getOrDefault(status, "未知状态");
    }
}
