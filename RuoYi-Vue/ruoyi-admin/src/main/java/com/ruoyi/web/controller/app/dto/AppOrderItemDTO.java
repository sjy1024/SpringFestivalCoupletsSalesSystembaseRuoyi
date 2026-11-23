package com.ruoyi.web.controller.app.dto;

import com.ruoyi.system.domain.ClOrderItem;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

/**
 * 小程序订单商品DTO
 * 用于返回给小程序端的订单商品数据
 * 
 * @author ruoyi
 * @date 2026-01-29
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class AppOrderItemDTO extends ClOrderItem
{
    /**
     * 商品规格
     */
    private List<AppGoodsSpecDTO> specifications;

    /**
     * 商品标签文本
     */
    private String tagText;

    /**
     * 限时活动价
     */
    private String tagPrice;

    /**
     * 实际价格
     */
    private String actualPrice;

    /**
     * 购买数量
     */
    private Integer buyQuantity;

    /**
     * 商品SKU ID
     */
    private Long skuId;

    /**
     * 商品SPU ID
     */
    private Long spuId;

    /**
     * 商品按钮
     */
    private List<AppOrderButtonDTO> buttonVOs;

    /**
     * 商品ID（前端使用）
     */
    private Long id;

    /**
     * 商品图片（前端使用）
     */
    private String thumb;

    /**
     * 商品标题（前端使用）
     */
    private String title;

    /**
     * 商品价格（前端使用）
     */
    private String price;

    /**
     * 商品数量（前端使用）
     */
    private Integer num;

    /**
     * 商品标题前缀标签
     */
    private List<AppGoodsTagDTO> titlePrefixTags;
}
