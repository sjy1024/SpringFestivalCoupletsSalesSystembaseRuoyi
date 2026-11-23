package com.ruoyi.web.controller.app;

import com.ruoyi.common.annotation.Anonymous;
import com.ruoyi.common.core.controller.BaseController;
import com.ruoyi.common.core.domain.AjaxResult;
import com.ruoyi.common.utils.TypeSafeConverter;
import com.ruoyi.system.domain.ClCustomOrder;
import com.ruoyi.system.domain.ClOrder;
import com.ruoyi.system.service.IClCustomOrderService;
import com.ruoyi.system.service.IClOrderService;
import com.ruoyi.system.utils.OrderNoGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 小程序端 - 定制服务接口
 *
 * 提供给小程序 C 端使用的定制相关接口。
 */
@Anonymous
@RestController
@RequestMapping("/api/custom")
public class AppCustomController extends BaseController {

    @Autowired
    private IClCustomOrderService clCustomOrderService;

    @Autowired
    private IClOrderService clOrderService;

    /**
     * 获取定制类型列表
     */
    @GetMapping("/types")
    public AjaxResult getCustomTypes() {
        List<Map<String, Object>> types = new ArrayList<>();
        
        // 模拟数据 - 定制类型
        Map<String, Object> type1 = new HashMap<>();
        type1.put("id", 1);
        type1.put("name", "春联");
        type1.put("image", "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20couplets%20red%20paper%20traditional%20style&image_size=square");
        types.add(type1);
        
        Map<String, Object> type2 = new HashMap<>();
        type2.put("id", 2);
        type2.put("name", "福字");
        type2.put("image", "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20fu%20character%20red%20paper%20traditional&image_size=square");
        types.add(type2);
        
        Map<String, Object> type3 = new HashMap<>();
        type3.put("id", 3);
        type3.put("name", "横批");
        type3.put("image", "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20horizontal%20couplet%20red%20paper%20traditional&image_size=square");
        types.add(type3);
        
        return success(types);
    }

    /**
     * 获取尺寸列表
     */
    @GetMapping("/sizes")
    public AjaxResult getSizeOptions() {
        List<Map<String, Object>> sizes = new ArrayList<>();
        
        // 模拟数据 - 尺寸选项
        Map<String, Object> size1 = new HashMap<>();
        size1.put("id", 1);
        size1.put("name", "1.2米");
        size1.put("price", 38);
        sizes.add(size1);
        
        Map<String, Object> size2 = new HashMap<>();
        size2.put("id", 2);
        size2.put("name", "1.5米");
        size2.put("price", 48);
        sizes.add(size2);
        
        Map<String, Object> size3 = new HashMap<>();
        size3.put("id", 3);
        size3.put("name", "1.8米");
        size3.put("price", 58);
        sizes.add(size3);
        
        Map<String, Object> size4 = new HashMap<>();
        size4.put("id", 4);
        size4.put("name", "2.1米");
        size4.put("price", 68);
        sizes.add(size4);
        
        return success(sizes);
    }

    /**
     * 计算定制价格
     * @param data 定制选项数据
     */
    @PostMapping("/calculate-price")
    public AjaxResult calculatePrice(@RequestBody Map<String, Object> data) {
        try {
            Map<String, Object> result = new HashMap<>();
            
            // 默认价格
            double basePrice = 38.0;
            
            // 根据尺寸调整价格 - 安全转换
            Integer sizeId = null;
            if (data.get("size") != null) {
                try {
                    Object sizeObj = data.get("size");
                    if (sizeObj instanceof Integer) {
                        sizeId = (Integer) sizeObj;
                    } else {
                        sizeId = Integer.parseInt(sizeObj.toString());
                    }
                } catch (NumberFormatException e) {
                    return error("尺寸参数格式错误");
                }
            }
            
            if (sizeId == null) {
                return error("请选择尺寸");
            }
            
            switch (sizeId) {
                case 1:
                    basePrice = 38.0;
                    break;
                case 2:
                    basePrice = 48.0;
                    break;
                case 3:
                    basePrice = 58.0;
                    break;
                case 4:
                    basePrice = 68.0;
                    break;
                default:
                    return error("无效的尺寸选项");
            }
            
            // 根据联纸调整价格 - 安全转换
            Integer paperId = null;
            if (data.get("paper") != null) {
                try {
                    Object paperObj = data.get("paper");
                    if (paperObj instanceof Integer) {
                        paperId = (Integer) paperObj;
                    } else {
                        paperId = Integer.parseInt(paperObj.toString());
                    }
                } catch (NumberFormatException e) {
                    return error("联纸参数格式错误");
                }
            }
            
            if (paperId != null) {
                switch (paperId) {
                    case 1:
                    case 2:
                        // 普通联纸不加价
                        break;
                    case 3:
                        basePrice += 5.0;
                        break;
                    default:
                        return error("无效的联纸选项");
                }
            }
            
            result.put("price", basePrice);
            result.put("currency", "¥");
            
            return success(result);
        } catch (Exception e) {
            logger.error("计算定制价格异常", e);
            return error("计算失败，请重试");
        }
    }

    /**
     * 提交定制方案
     * @param data 定制方案数据
     */
    @Transactional(rollbackFor = Exception.class)
    @PostMapping("/submit")
    public AjaxResult submitCustomPlan(@RequestBody Map<String, Object> data,
                                       @RequestHeader(value = "X-Device-ID", required = false) String headerDeviceId) {
        try {
            // 1. 数据验证
            String shanglian = data.get("shanglian") != null ? data.get("shanglian").toString().trim() : "";
            String xialian = data.get("xialian") != null ? data.get("xialian").toString().trim() : "";
            String hengpi = data.get("hengpi") != null ? data.get("hengpi").toString().trim() : "";
            
            if (shanglian.isEmpty()) {
                return error("上联不能为空");
            }
            if (xialian.isEmpty()) {
                return error("下联不能为空");
            }
            if (hengpi.isEmpty()) {
                return error("横批不能为空");
            }
            
            // 2. 长度验证
            if (shanglian.length() > 20) {
                return error("上联不能超过20字");
            }
            if (xialian.length() > 20) {
                return error("下联不能超过20字");
            }
            if (hengpi.length() > 8) {
                return error("横批不能超过8字");
            }

            String deviceId = AppClientDeviceCheck.deviceIdFromBody(data, headerDeviceId);
            if (AppClientDeviceCheck.isBlank(deviceId)) {
                return error("设备ID不能为空");
            }
            Long submitOrderId = resolveOrderIdForCustom(deviceId, data);
            
            // 3. 创建定制订单
            ClCustomOrder customOrder = new ClCustomOrder();
            customOrder.setOrderId(submitOrderId);
            
            // 设置定制内容
            StringBuilder customContent = new StringBuilder();
            customContent.append("上联：").append(shanglian).append("\n");
            customContent.append("下联：").append(xialian).append("\n");
            customContent.append("横批：").append(hengpi);
            customOrder.setCustomContent(customContent.toString());
            
            // 设置定制规格（JSON格式）
            Map<String, Object> spec = new HashMap<>();
            spec.put("type", data.get("type"));
            spec.put("size", data.get("size"));
            spec.put("paper", data.get("paper"));
            spec.put("price", data.get("price"));
            customOrder.setCustomSpec(com.alibaba.fastjson2.JSON.toJSONString(spec));
            
            // 设置初始状态为待接单
            customOrder.setStatus("0");
            
            // 4. 计算排队号和预计完成时间（使用数据库级别的原子操作）
            Long queueNo = clCustomOrderService.generateQueueNo("0");
            customOrder.setQueueNo(queueNo);
            
            // 计算排队位置（当前排队号-1）
            customOrder.setQueuePosition(queueNo - 1);
            
            // 预计完成时间：每个订单预计15分钟
            customOrder.setEstimatedTime(queueNo * 15);
            
            // 设置备注
            if (data.get("remark") != null) {
                String remark = data.get("remark").toString().trim();
                if (remark.length() > 100) {
                    return error("备注不能超过100字");
                }
                customOrder.setRemark(remark);
            }
            
            // 5. 保存到数据库
            int result = clCustomOrderService.insertClCustomOrder(customOrder);
            
            if (result > 0) {
                Map<String, Object> response = new HashMap<>();
                response.put("customId", customOrder.getCustomId());
                response.put("orderId", submitOrderId);
                response.put("queueNo", customOrder.getQueueNo());
                response.put("estimatedTime", customOrder.getEstimatedTime());
                ClOrder linkedOrder = clOrderService.selectClOrderByOrderId(submitOrderId);
                if (linkedOrder != null && linkedOrder.getOrderNo() != null) {
                    response.put("orderNo", linkedOrder.getOrderNo());
                }
                response.put("message", "定制方案提交成功，排队号：" + customOrder.getQueueNo());
                return success(response);
            } else {
                return error("定制方案提交失败");
            }
        } catch (NumberFormatException e) {
            logger.error("数据格式错误", e);
            return error("数据格式错误，请检查输入");
        } catch (IllegalArgumentException e) {
            return error(e.getMessage());
        } catch (Exception e) {
            logger.error("提交定制方案异常", e);
            return error("提交失败，请稍后重试");
        }
    }

    /**
     * 保存定制方案
     * @param data 定制方案数据
     */
    @Transactional(rollbackFor = Exception.class)
    @PostMapping("/save")
    public AjaxResult saveCustomPlan(@RequestBody Map<String, Object> data,
                                     @RequestHeader(value = "X-Device-ID", required = false) String headerDeviceId) {
        try {
            // 1. 数据验证
            String shanglian = data.get("shanglian") != null ? data.get("shanglian").toString().trim() : "";
            String xialian = data.get("xialian") != null ? data.get("xialian").toString().trim() : "";
            String hengpi = data.get("hengpi") != null ? data.get("hengpi").toString().trim() : "";
            
            if (shanglian.isEmpty()) {
                return error("上联不能为空");
            }
            if (xialian.isEmpty()) {
                return error("下联不能为空");
            }
            if (hengpi.isEmpty()) {
                return error("横批不能为空");
            }
            
            // 2. 长度验证
            if (shanglian.length() > 20) {
                return error("上联不能超过20字");
            }
            if (xialian.length() > 20) {
                return error("下联不能超过20字");
            }
            if (hengpi.length() > 8) {
                return error("横批不能超过8字");
            }

            String deviceId = AppClientDeviceCheck.deviceIdFromBody(data, headerDeviceId);
            if (AppClientDeviceCheck.isBlank(deviceId)) {
                return error("设备ID不能为空");
            }
            Long saveOrderId = resolveOrderIdForCustom(deviceId, data);
            
            // 3. 创建定制订单
            ClCustomOrder customOrder = new ClCustomOrder();
            customOrder.setOrderId(saveOrderId);
            
            // 设置定制内容（JSON格式，方便前端解析）
            Map<String, String> content = new HashMap<>();
            content.put("shanglian", shanglian);
            content.put("xialian", xialian);
            content.put("hengpi", hengpi);
            customOrder.setCustomContent(com.alibaba.fastjson2.JSON.toJSONString(content));
            
            // 设置定制规格
            Map<String, Object> spec = new HashMap<>();
            spec.put("type", data.get("type"));
            spec.put("size", data.get("size"));
            spec.put("paper", data.get("paper"));
            spec.put("price", data.get("price"));
            customOrder.setCustomSpec(com.alibaba.fastjson2.JSON.toJSONString(spec));
            
            // 设置初始状态为待接单
            customOrder.setStatus("0");
            
            // 设置备注
            if (data.get("remark") != null) {
                String remark = data.get("remark").toString().trim();
                if (remark.length() > 100) {
                    return error("备注不能超过100字");
                }
                customOrder.setRemark(remark);
            }
            
            // 4. 保存到数据库
            int result = clCustomOrderService.insertClCustomOrder(customOrder);
            
            if (result > 0) {
                Map<String, Object> response = new HashMap<>();
                response.put("planId", customOrder.getCustomId());
                response.put("message", "定制方案保存成功");
                return success(response);
            } else {
                return error("定制方案保存失败");
            }
        } catch (NumberFormatException e) {
            logger.error("数据格式错误", e);
            return error("数据格式错误，请检查输入");
        } catch (IllegalArgumentException e) {
            return error(e.getMessage());
        } catch (Exception e) {
            logger.error("保存定制方案异常", e);
            return error("保存失败，请稍后重试");
        }
    }
    
    /**
     * 获取定制订单详情
     * @param customId 定制ID
     */
    @GetMapping("/detail/{customId}")
    public AjaxResult getCustomDetail(@PathVariable Long customId,
                                      @RequestParam(value = "deviceId", required = false) String deviceId,
                                      @RequestHeader(value = "X-Device-ID", required = false) String headerDeviceId) {
        try {
            String dev = AppClientDeviceCheck.resolveDeviceId(deviceId, headerDeviceId);
            if (AppClientDeviceCheck.isBlank(dev)) {
                return error("设备ID不能为空");
            }
            ClCustomOrder customOrder = clCustomOrderService.selectClCustomOrderByCustomIdAndDeviceId(customId, dev);
            if (customOrder != null) {
                return success(customOrder);
            } else {
                return error("定制订单不存在或无权查看");
            }
        } catch (Exception e) {
            logger.error("获取定制订单详情异常", e);
            return error("获取定制订单详情异常：" + e.getMessage());
        }
    }
    
    /**
     * 获取当前设备的定制订单列表（购物车「我的定制」）
     */
    @GetMapping("/my")
    public AjaxResult getMyCustomList(@RequestParam(value = "deviceId", required = false) String deviceId,
                                      @RequestHeader(value = "X-Device-ID", required = false) String headerDeviceId) {
        try {
            String dev = AppClientDeviceCheck.resolveDeviceId(deviceId, headerDeviceId);
            if (AppClientDeviceCheck.isBlank(dev)) {
                return error("设备ID不能为空");
            }
            List<ClCustomOrder> list = clCustomOrderService.selectClCustomOrderListByDeviceId(dev);
            return success(list);
        } catch (Exception e) {
            logger.error("获取我的定制列表异常", e);
            return error("获取定制列表失败：" + e.getMessage());
        }
    }

    /**
     * 获取定制订单列表（按订单ID）
     * @param orderId 订单ID
     */
    @GetMapping("/list/{orderId}")
    public AjaxResult getCustomList(@PathVariable Long orderId,
                                    @RequestParam(value = "deviceId", required = false) String deviceId,
                                    @RequestHeader(value = "X-Device-ID", required = false) String headerDeviceId) {
        try {
            String dev = AppClientDeviceCheck.resolveDeviceId(deviceId, headerDeviceId);
            if (AppClientDeviceCheck.isBlank(dev)) {
                return error("设备ID不能为空");
            }
            ClOrder order = clOrderService.selectClOrderByOrderId(orderId);
            if (order == null) {
                return error("订单不存在");
            }
            if (!AppClientDeviceCheck.orderBelongs(order, dev)) {
                return error("无权查看该订单的定制列表");
            }
            ClCustomOrder queryOrder = new ClCustomOrder();
            queryOrder.setOrderId(orderId);
            List<ClCustomOrder> list = clCustomOrderService.selectClCustomOrderList(queryOrder);
            return success(list);
        } catch (Exception e) {
            logger.error("获取定制订单列表异常", e);
            return error("获取定制订单列表异常：" + e.getMessage());
        }
    }

    /**
     * 解析定制关联订单：若未传 orderId，则自动创建占位定制订单以满足 order_id NOT NULL。
     */
    private Long resolveOrderIdForCustom(String deviceId, Map<String, Object> data) {
        if (data.get("orderId") != null && !data.get("orderId").toString().trim().isEmpty()) {
            Long orderId;
            try {
                orderId = Long.parseLong(data.get("orderId").toString().trim());
            } catch (NumberFormatException e) {
                throw new IllegalArgumentException("订单ID格式错误");
            }
            ClOrder order = clOrderService.selectClOrderByOrderId(orderId);
            if (order == null) {
                throw new IllegalArgumentException("订单不存在");
            }
            if (!AppClientDeviceCheck.orderBelongs(order, deviceId)) {
                throw new IllegalArgumentException("无权操作该订单");
            }
            return orderId;
        }
        return createPlaceholderOrderForCustom(deviceId, data);
    }

    private Long createPlaceholderOrderForCustom(String deviceId, Map<String, Object> data) {
        String maxOrderNo = clOrderService.getMaxOrderNo();
        String orderNo = OrderNoGenerator.generateOrderNo(maxOrderNo);

        BigDecimal totalAmount = BigDecimal.ZERO;
        Object priceObj = data.get("price");
        if (priceObj != null) {
            try {
                totalAmount = new BigDecimal(priceObj.toString());
            } catch (NumberFormatException ignored) {
                // 使用默认 0
            }
        }

        ClOrder order = new ClOrder();
        order.setOrderNo(orderNo);
        order.setDeviceId(deviceId);
        order.setOrderType("1");
        order.setStatus("0");
        order.setTotalAmount(totalAmount);
        order.setReceiverName(optionalString(data, "receiverName", "定制用户"));
        order.setReceiverPhone(optionalString(data, "receiverPhone", "13800000000"));
        order.setReceiverAddress(optionalString(data, "receiverAddress", "待完善收货地址"));
        order.setRemark("定制Tab直接提交");
        order.setCreateTime(new Date());
        order.setUpdateTime(new Date());

        clOrderService.insertClOrder(order);
        return order.getOrderId();
    }

    private String optionalString(Map<String, Object> data, String key, String defaultValue) {
        Object val = data.get(key);
        if (val == null) {
            return defaultValue;
        }
        String text = val.toString().trim();
        return text.isEmpty() ? defaultValue : text;
    }
}