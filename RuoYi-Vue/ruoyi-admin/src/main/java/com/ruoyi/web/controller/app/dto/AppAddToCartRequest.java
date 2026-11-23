package com.ruoyi.web.controller.app.dto;

import lombok.Data;

/**
 * 小程序添加到购物车请求DTO
 * 
 * @author ruoyi
 * @date 2026-02-04
 */
@Data
public class AppAddToCartRequest {
    /**
     * 商品ID
     */
    private Long goodsId;

    /**
     * 购买数量
     */
    private Integer quantity;

    /**
     * 设备ID
     */
    private String deviceId;

    /**
     * 尺寸ID（规格商品）
     */
    private Integer sizeId;

    /**
     * 联纸ID（规格商品）
     */
    private Integer materialId;
}