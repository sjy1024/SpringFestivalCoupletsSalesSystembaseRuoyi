package com.ruoyi.web.controller.app.dto;

import lombok.Data;

/**
 * 商品规格DTO
 * 
 * @author ruoyi
 * @date 2026-01-29
 */
@Data
public class AppGoodsSpecDTO
{
    /**
     * 规格值
     */
    private String specValue;

    /**
     * 规格名称
     */
    private String specName;

    /**
     * 规格ID
     */
    private Long specId;
}
