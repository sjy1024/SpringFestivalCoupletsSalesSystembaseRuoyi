package com.ruoyi.web.controller.app.dto;

import com.ruoyi.system.domain.ClOrder;
import com.ruoyi.system.domain.ClOrderItem;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.util.List;

/**
 * 小程序订单详情DTO
 * 用于返回给小程序端的订单详情数据
 * 
 * @author ruoyi
 * @date 2026-01-29
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class AppOrderDetailDTO extends ClOrder
{
    /**
     * 订单商品列表
     */
    private List<AppOrderItemDTO> orderItemVOs;

    /**
     * 订单状态名称
     */
    private String orderStatusName;

    /**
     * 支付金额
     */
    private BigDecimal paymentAmount;

    /**
     * 商品总金额
     */
    private BigDecimal goodsAmountApp;

    /**
     * 订单状态流转按钮
     */
    private List<AppOrderButtonDTO> buttonVOs;

    /**
     * 物流信息
     */
    private AppLogisticsVO logisticsVO;

    /**
     * 订单评论状态
     */
    private Integer invoiceStatus;

    /**
     * 订单评论描述
     */
    private String invoiceDesc;

    /**
     * 支付信息
     */
    private AppPaymentVO paymentVO;

    /**
     * 自动取消时间
     */
    private Long autoCancelTime;

    /**
     * 订单子状态
     */
    private Integer orderSubStatus;

    /**
     * 订单状态备注
     */
    private String orderStatusRemark;

    /**
     * 物流轨迹
     */
    private List<AppLogisticsNodeVO> trajectoryVos;

    /**
     * 拼团信息
     */
    private AppGroupInfoVO groupInfoVo;

    /**
     * 店铺ID
     */
    private Long storeId;

    /**
     * 店铺名称
     */
    private String storeName;

    /**
     * 父订单号
     */
    private String parentOrderNo;

    /**
     * 运费
     */
    private BigDecimal freightFee;

    /**
     * 优惠金额
     */
    private BigDecimal discountAmount;

    /**
     * 优惠券金额
     */
    private BigDecimal couponAmount;

    /**
     * 订单创建时间（时间戳）
     */
    private Long createTimeStamp;
}
