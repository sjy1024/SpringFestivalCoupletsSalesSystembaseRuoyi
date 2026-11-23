package com.ruoyi.web.controller.app.dto;

import lombok.Data;

/**
 * 拼团信息VO
 * 用于返回拼团相关信息
 * 
 * @author ruoyi
 * @date 2026-01-29
 */
@Data
public class AppGroupInfoVO
{
    /**
     * 拼团ID
     */
    private Long groupId;

    /**
     * 拼团名称
     */
    private String groupName;

    /**
     * 拼团状态
     */
    private String groupStatus;

    /**
     * 剩余时间（毫秒）
     */
    private Long residueTime;

    /**
     * 拼团人数
     */
    private Integer groupNum;

    /**
     * 已参团人数
     */
    private Integer joinedNum;

    /**
     * 拼团商品ID
     */
    private Long goodsId;

    /**
     * 拼团商品名称
     */
    private String goodsName;

    /**
     * 拼团商品价格
     */
    private String groupPrice;

    /**
     * 拼团商品图片
     */
    private String goodsPictureUrl;

    /**
     * 拼团二维码
     */
    private String groupQrCode;

    /**
     * 拼团链接
     */
    private String groupLink;
}
