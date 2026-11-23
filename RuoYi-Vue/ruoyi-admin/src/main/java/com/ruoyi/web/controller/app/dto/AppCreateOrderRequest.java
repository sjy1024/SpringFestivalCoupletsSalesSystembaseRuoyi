package com.ruoyi.web.controller.app.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

/**
 * 小程序创建订单请求DTO
 * 
 * @author ruoyi
 * @date 2026-02-03
 */
@Data
public class AppCreateOrderRequest {
    /**
     * 订单类型：single-单商品，multi-多商品
     */
    private String type = "single";
    
    /**
     * 商品ID（单商品时使用）
     */
    private Long goodsId;

    /**
     * 购买数量（单商品时使用）
     */
    private Integer quantity;

    /**
     * 尺寸ID（规格商品时使用）
     */
    private Integer sizeId;

    /**
     * 联纸ID（规格商品时使用）
     */
    private Integer materialId;

    /**
     * 商品列表（多商品时使用）
     */
    private List<OrderGoodsItem> goodsList;

    /**
     * 设备ID
     */
    private String deviceId;

    /**
     * 收货人
     */
    private String receiverName;

    /**
     * 收货电话
     */
    private String receiverPhone;

    /**
     * 收货地址
     */
    private String receiverAddress;

    /**
     * 订单商品项
     */
    @Data
    public static class OrderGoodsItem {
        /**
         * 商品ID
         */
        private Long goodsId;

        /**
         * 购买数量
         */
        private Integer quantity;

        /**
         * 商品价格（前端传递，后端会验证）
         */
        private BigDecimal price;

        /**
         * 尺寸ID（规格商品）
         */
        private Integer sizeId;

        /**
         * 联纸ID（规格商品）
         */
        private Integer materialId;

        /**
         * 规格快照JSON（可选，后端会重新校验）
         */
        private String itemSpec;
    }
}
