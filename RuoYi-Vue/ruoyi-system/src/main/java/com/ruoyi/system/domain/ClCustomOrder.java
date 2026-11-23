package com.ruoyi.system.domain;

import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;
import com.ruoyi.common.annotation.Excel;
import com.ruoyi.common.core.domain.BaseEntity;

/**
 * 定制订单对象 cl_custom_order
 * 
 * @author ruoyi
 * @date 2026-02-21
 */
public class ClCustomOrder extends BaseEntity
{
    private static final long serialVersionUID = 1L;

    /** 定制ID */
    private Long customId;

    /** 关联订单ID */
    @Excel(name = "关联订单ID")
    private Long orderId;

    /** 基础商品ID（可选） */
    @Excel(name = "基础商品ID")
    private Long baseGoodsId;

    /** 定制内容（对联内容） */
    @Excel(name = "定制内容")
    private String customContent;

    /** 定制规格（材质、尺寸等，JSON格式） */
    @Excel(name = "定制规格")
    private String customSpec;

    /** 排队号 */
    @Excel(name = "排队号")
    private Long queueNo;

    /** 排队位置（前面还有多少人） */
    @Excel(name = "排队位置")
    private Long queuePosition;

    /** 预计完成时间（分钟） */
    @Excel(name = "预计完成时间")
    private Long estimatedTime;

    /** 状态（0待接单 1制作中 2已完成） */
    @Excel(name = "状态")
    private String status;

    /** 关联订单号（查询展示用，非表字段） */
    private String orderNo;

    public void setCustomId(Long customId) 
    {
        this.customId = customId;
    }

    public Long getCustomId() 
    {
        return customId;
    }
    public void setOrderId(Long orderId) 
    {
        this.orderId = orderId;
    }

    public Long getOrderId() 
    {
        return orderId;
    }
    public void setBaseGoodsId(Long baseGoodsId) 
    {
        this.baseGoodsId = baseGoodsId;
    }

    public Long getBaseGoodsId() 
    {
        return baseGoodsId;
    }
    public void setCustomContent(String customContent) 
    {
        this.customContent = customContent;
    }

    public String getCustomContent() 
    {
        return customContent;
    }
    public void setCustomSpec(String customSpec) 
    {
        this.customSpec = customSpec;
    }

    public String getCustomSpec() 
    {
        return customSpec;
    }
    public void setQueueNo(Long queueNo) 
    {
        this.queueNo = queueNo;
    }

    public Long getQueueNo() 
    {
        return queueNo;
    }
    public void setQueuePosition(Long queuePosition) 
    {
        this.queuePosition = queuePosition;
    }

    public Long getQueuePosition() 
    {
        return queuePosition;
    }
    public void setEstimatedTime(Long estimatedTime) 
    {
        this.estimatedTime = estimatedTime;
    }

    public Long getEstimatedTime() 
    {
        return estimatedTime;
    }
    public void setStatus(String status) 
    {
        this.status = status;
    }

    public String getStatus() 
    {
        return status;
    }

    public void setOrderNo(String orderNo)
    {
        this.orderNo = orderNo;
    }

    public String getOrderNo()
    {
        return orderNo;
    }

    @Override
    public String toString() {
        return new ToStringBuilder(this,ToStringStyle.MULTI_LINE_STYLE)
            .append("customId", getCustomId())
            .append("orderId", getOrderId())
            .append("baseGoodsId", getBaseGoodsId())
            .append("customContent", getCustomContent())
            .append("customSpec", getCustomSpec())
            .append("queueNo", getQueueNo())
            .append("queuePosition", getQueuePosition())
            .append("estimatedTime", getEstimatedTime())
            .append("status", getStatus())
            .append("createTime", getCreateTime())
            .append("updateTime", getUpdateTime())
            .append("remark", getRemark())
            .toString();
    }
}