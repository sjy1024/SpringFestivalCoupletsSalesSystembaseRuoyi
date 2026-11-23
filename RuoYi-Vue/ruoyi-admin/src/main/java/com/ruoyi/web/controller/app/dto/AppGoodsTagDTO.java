package com.ruoyi.web.controller.app.dto;

import lombok.Data;

/**
 * 小程序商品标签DTO
 * 用于返回给小程序端的商品标签数据
 * 
 * @author ruoyi
 * @date 2026-01-29
 */
@Data
public class AppGoodsTagDTO {
    /**
     * 标签ID
     */
    private Long id;

    /**
     * 标签名称
     */
    private String name;

    /**
     * 标签颜色
     */
    private String color;

    /**
     * 标签类型
     */
    private String type;
}