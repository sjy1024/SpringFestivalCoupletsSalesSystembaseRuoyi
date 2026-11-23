package com.ruoyi.web.controller.app;

import com.ruoyi.common.annotation.Anonymous;
import com.ruoyi.common.core.controller.BaseController;
import com.ruoyi.common.core.domain.AjaxResult;
import com.ruoyi.system.domain.ClCart;
import com.ruoyi.system.domain.ClGoods;
import com.ruoyi.system.service.IClCartService;
import com.ruoyi.system.service.IClGoodsService;
import com.ruoyi.system.utils.GoodsSpecHelper;
import com.ruoyi.web.controller.app.dto.AppAddToCartRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 小程序端 - 购物车接口（C端）
 * 
 * @author ruoyi
 * @date 2026-02-04
 */
@Anonymous
@RestController
@RequestMapping("/api/app/cart")
public class AppCartController extends BaseController {

    @Autowired
    private IClCartService clCartService;

    @Autowired
    private IClGoodsService clGoodsService;

    /**
     * 添加商品到购物车
     * 
     * @param request 添加到购物车请求
     * @return 结果
     */
    @PostMapping("/add")
    public AjaxResult addToCart(@RequestBody AppAddToCartRequest request,
                                @RequestHeader(value = "X-Device-ID", required = false) String headerDeviceId) {
        try {
            String dev = AppClientDeviceCheck.resolveDeviceId(request.getDeviceId(), headerDeviceId);
            if (AppClientDeviceCheck.isBlank(dev)) {
                return AjaxResult.error("设备ID不能为空");
            }
            request.setDeviceId(dev);
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

            String itemSpec = "";
            if (GoodsSpecHelper.isSpecGoods(goods.getGoodsType())) {
                try {
                    Map<String, Object> resolved = GoodsSpecHelper.resolveSelection(
                        goods.getGoodsType(), goods.getSpecOptions(),
                        request.getSizeId(), request.getMaterialId());
                    itemSpec = (String) resolved.get("itemSpec");
                } catch (IllegalArgumentException e) {
                    return AjaxResult.error(e.getMessage());
                }
            }

            // 3. 检查购物车中是否已存在该商品（同规格）
            ClCart existingCart = clCartService.selectCartByDeviceIdAndGoodsId(
                request.getDeviceId(), request.getGoodsId(), itemSpec);

            if (existingCart != null) {
                // 如果已存在，更新数量
                int newQuantity = existingCart.getQuantity() + request.getQuantity();
                if (newQuantity > goods.getStock()) {
                    return AjaxResult.error("库存不足");
                }
                existingCart.setQuantity(newQuantity);
                existingCart.setUpdateTime(new Date());
                clCartService.updateClCart(existingCart);
            } else {
                // 如果不存在，新增购物车记录
                ClCart cart = new ClCart();
                cart.setDeviceId(request.getDeviceId());
                cart.setGoodsId(request.getGoodsId());
                cart.setQuantity(request.getQuantity());
                cart.setItemSpec(itemSpec);
                cart.setCreateTime(new Date());
                cart.setUpdateTime(new Date());
                clCartService.insertClCart(cart);
            }

            return success("添加成功");
        } catch (Exception e) {
            logger.error("添加到购物车失败", e);
            return AjaxResult.error("添加到购物车失败");
        }
    }

    /**
     * 获取购物车列表
     * 
     * @param deviceId 设备ID
     * @return 购物车列表
     */
    @GetMapping("/list")
    public AjaxResult list(@RequestParam String deviceId,
                           @RequestHeader(value = "X-Device-ID", required = false) String headerDeviceId) {
        String dev = AppClientDeviceCheck.resolveDeviceId(deviceId, headerDeviceId);
        if (AppClientDeviceCheck.isBlank(dev)) {
            return error("设备ID不能为空");
        }
        List<Map<String, Object>> cartList = clCartService.selectCartListWithGoods(dev);
        for (Map<String, Object> row : cartList) {
            Object specObj = row.get("itemSpec");
            String itemSpec = specObj == null ? "" : specObj.toString();
            BigDecimal specPrice = GoodsSpecHelper.extractUnitPrice(itemSpec);
            if (specPrice != null) {
                row.put("goodsPrice", specPrice);
            }
            row.put("specText", formatSpecText(itemSpec));
        }
        return success(cartList);
    }

    private String formatSpecText(String itemSpec) {
        if (itemSpec == null || itemSpec.isEmpty()) {
            return "";
        }
        try {
            com.alibaba.fastjson2.JSONObject obj = com.alibaba.fastjson2.JSON.parseObject(itemSpec);
            String sizeName = obj.getString("sizeName");
            String materialName = obj.getString("materialName");
            if (sizeName != null && materialName != null) {
                return sizeName + " / " + materialName;
            }
            return sizeName != null ? sizeName : materialName;
        } catch (Exception e) {
            return "";
        }
    }

    /**
     * 更新购物车商品数量
     * 
     * @param data 更新数据
     * @return 结果
     */
    @PutMapping("/update")
    public AjaxResult updateQuantity(@RequestBody Map<String, Object> data,
                                     @RequestHeader(value = "X-Device-ID", required = false) String headerDeviceId) {
        try {
            Long cartId = Long.parseLong(data.get("cartId").toString());
            Integer quantity = Integer.parseInt(data.get("quantity").toString());
            String deviceId = AppClientDeviceCheck.deviceIdFromBody(data, headerDeviceId);
            if (AppClientDeviceCheck.isBlank(deviceId)) {
                return AjaxResult.error("设备ID不能为空");
            }

            ClCart cart = clCartService.selectClCartByCartId(cartId);
            if (cart == null) {
                return AjaxResult.error("购物车记录不存在");
            }
            if (!AppClientDeviceCheck.cartBelongs(cart, deviceId)) {
                return AjaxResult.error("无权操作该购物车记录");
            }

            // 验证库存
            ClGoods goods = clGoodsService.selectClGoodsByGoodsId(cart.getGoodsId());
            if (goods == null || quantity > goods.getStock()) {
                return AjaxResult.error("库存不足");
            }

            cart.setQuantity(quantity);
            cart.setUpdateTime(new Date());
            clCartService.updateClCart(cart);

            return success("更新成功");
        } catch (Exception e) {
            logger.error("更新购物车失败", e);
            return AjaxResult.error("更新购物车失败");
        }
    }

    /**
     * 删除购物车商品
     * 
     * @param cartId 购物车ID
     * @return 结果
     */
    @DeleteMapping("/{cartId}")
    public AjaxResult remove(@PathVariable Long cartId,
                             @RequestParam("deviceId") String deviceId,
                             @RequestHeader(value = "X-Device-ID", required = false) String headerDeviceId) {
        try {
            String dev = AppClientDeviceCheck.resolveDeviceId(deviceId, headerDeviceId);
            if (AppClientDeviceCheck.isBlank(dev)) {
                return AjaxResult.error("设备ID不能为空");
            }
            ClCart cart = clCartService.selectClCartByCartId(cartId);
            if (cart == null) {
                return AjaxResult.error("购物车记录不存在");
            }
            if (!AppClientDeviceCheck.cartBelongs(cart, dev)) {
                return AjaxResult.error("无权删除该购物车记录");
            }
            clCartService.deleteClCartByCartId(cartId);
            return success("删除成功");
        } catch (Exception e) {
            logger.error("删除购物车商品失败", e);
            return AjaxResult.error("删除失败");
        }
    }

    /**
     * 批量删除购物车商品
     * 
     * @param data 删除数据
     * @return 结果
     */
    @DeleteMapping("/batchDelete")
    public AjaxResult batchRemove(@RequestBody Map<String, Object> data,
                                  @RequestHeader(value = "X-Device-ID", required = false) String headerDeviceId) {
        try {
            String deviceId = AppClientDeviceCheck.deviceIdFromBody(data, headerDeviceId);
            if (AppClientDeviceCheck.isBlank(deviceId)) {
                return AjaxResult.error("设备ID不能为空");
            }
            @SuppressWarnings("unchecked")
            List<?> rawIds = (List<?>) data.get("cartIds");
            if (rawIds == null || rawIds.isEmpty()) {
                return AjaxResult.error("cartIds 不能为空");
            }
            List<Long> cartIds = new java.util.ArrayList<>();
            for (Object o : rawIds) {
                if (o == null) {
                    continue;
                }
                cartIds.add(Long.valueOf(String.valueOf(o)));
            }
            if (cartIds.isEmpty()) {
                return AjaxResult.error("cartIds 不能为空");
            }

            for (Long cartId : cartIds) {
                ClCart cart = clCartService.selectClCartByCartId(cartId);
                if (cart == null || !AppClientDeviceCheck.cartBelongs(cart, deviceId)) {
                    return AjaxResult.error("存在无权删除的购物车记录");
                }
            }
            for (Long cartId : cartIds) {
                clCartService.deleteClCartByCartId(cartId);
            }

            return success("批量删除成功");
        } catch (Exception e) {
            logger.error("批量删除购物车商品失败", e);
            return AjaxResult.error("批量删除失败");
        }
    }

    /**
     * 清空购物车
     * 
     * @param data 清空数据
     * @return 结果
     */
    @DeleteMapping("/clear")
    public AjaxResult clear(@RequestBody Map<String, Object> data,
                            @RequestHeader(value = "X-Device-ID", required = false) String headerDeviceId) {
        try {
            Object raw = data.get("deviceId");
            String deviceId = AppClientDeviceCheck.resolveDeviceId(
                raw == null ? null : String.valueOf(raw), headerDeviceId);
            if (AppClientDeviceCheck.isBlank(deviceId)) {
                return AjaxResult.error("设备ID不能为空");
            }
            clCartService.deleteCartByDeviceId(deviceId);
            return success("清空成功");
        } catch (Exception e) {
            logger.error("清空购物车失败", e);
            return AjaxResult.error("清空失败");
        }
    }
}