package com.ruoyi.web.controller.app.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;

/**
 * 支付信息VO
 * 
 * @author ruoyi
 * @date 2026-01-29
 */
@Data
public class AppPaymentVO
{
    /**
     * 支付金额
     */
    private BigDecimal payAmount;

    /**
     * 支付方式
     */
    private String payType;

    /**
     * 支付时间
     */
    private Date payTime;

    /**
     * 支付状态
     */
    private String payStatus;

    /**
     * 支付订单号
     */
    private String payOrderNo;

    /**
     * 支付成功时间
     */
    private Date paySuccessTime;

    /**
     * 支付失败原因
     */
    private String payFailReason;
}
