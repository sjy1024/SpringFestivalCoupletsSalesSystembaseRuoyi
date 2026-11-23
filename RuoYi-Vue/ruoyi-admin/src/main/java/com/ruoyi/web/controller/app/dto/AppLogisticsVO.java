package com.ruoyi.web.controller.app.dto;

import lombok.Data;

/**
 * 物流信息VO
 * 
 * @author ruoyi
 * @date 2026-01-29
 */
@Data
public class AppLogisticsVO
{
    /**
     * 物流单号
     */
    private String logisticsNo;

    /**
     * 物流公司名称
     */
    private String logisticsCompanyName;

    /**
     * 物流公司电话
     */
    private String logisticsCompanyTel;

    /**
     * 收货人
     */
    private String receiverName;

    /**
     * 收货电话
     */
    private String receiverPhone;

    /**
     * 收货省
     */
    private String receiverProvince;

    /**
     * 收货市
     */
    private String receiverCity;

    /**
     * 收货县/区
     */
    private String receiverCountry;

    /**
     * 收货街道
     */
    private String receiverArea;

    /**
     * 收货详细地址
     */
    private String receiverAddress;
}
