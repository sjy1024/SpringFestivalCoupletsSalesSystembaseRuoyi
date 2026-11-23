package com.ruoyi.system.domain;

import java.math.BigDecimal;
import java.util.List;
import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;
import com.ruoyi.common.annotation.Excel;
import com.ruoyi.common.core.domain.BaseEntity;

/**
 * 订单对象 cl_order
 * 
 * @author ruoyi
 * @date 2026-01-26
 */
public class ClOrder extends BaseEntity
{
    private static final long serialVersionUID = 1L;

    /** 订单ID */
    @Excel(name = "订单ID")
    private Long orderId;

    /** 订单号 */
    @Excel(name = "订单号")
    private String orderNo;

    /** 设备ID（小程序端标识） */
    @Excel(name = "设备ID", readConverterExp = "小=程序端标识")
    private String deviceId;

    /** 订单类型（0普通订单 1定制订单） */
    @Excel(name = "订单类型", readConverterExp = "0=普通订单,1=定制订单")
    private String orderType;

    /** 总价 */
    @Excel(name = "总价")
    private BigDecimal totalAmount;

    /** 订单状态（0待支付 1已支付 2制作中 3已完成 4已取消） */
    @Excel(name = "订单状态", readConverterExp = "0=待支付,1=已支付,2=制作中,3=已完成,4=已取消")
    private String status;

    /** 取消审核状态（0无 1待商家审核 2已同意 3已拒绝） */
    @Excel(name = "取消审核", readConverterExp = "0=无,1=待审核,2=已同意,3=已拒绝")
    private String cancelStatus;

    /** 用户申请取消原因 */
    private String cancelReason;

    /** 收货人 */
    @Excel(name = "收货人")
    private String receiverName;

    /** 收货电话 */
    @Excel(name = "收货电话")
    private String receiverPhone;

    /** 收货地址 */
    private String receiverAddress;

    /** 订单明细列表 */
    private List<ClOrderItem> orderItems;

    /** 定制订单列表（对联内容等） */
    private List<ClCustomOrder> customOrders;

    public void setOrderId(Long orderId) 
    {
        this.orderId = orderId;
    }

    public Long getOrderId() 
    {
        return orderId;
    }

    public void setOrderNo(String orderNo) 
    {
        this.orderNo = orderNo;
    }

    public String getOrderNo() 
    {
        return orderNo;
    }

    public void setDeviceId(String deviceId) 
    {
        this.deviceId = deviceId;
    }

    public String getDeviceId() 
    {
        return deviceId;
    }

    public void setOrderType(String orderType) 
    {
        this.orderType = orderType;
    }

    public String getOrderType() 
    {
        return orderType;
    }

    public void setTotalAmount(BigDecimal totalAmount) 
    {
        this.totalAmount = totalAmount;
    }

    public BigDecimal getTotalAmount() 
    {
        return totalAmount;
    }

    public void setStatus(String status) 
    {
        this.status = status;
    }

    public String getStatus() 
    {
        return status;
    }

    public void setCancelStatus(String cancelStatus)
    {
        this.cancelStatus = cancelStatus;
    }

    public String getCancelStatus()
    {
        return cancelStatus;
    }

    public void setCancelReason(String cancelReason)
    {
        this.cancelReason = cancelReason;
    }

    public String getCancelReason()
    {
        return cancelReason;
    }

    public void setReceiverName(String receiverName) 
    {
        this.receiverName = receiverName;
    }

    public String getReceiverName() 
    {
        return receiverName;
    }

    public void setReceiverPhone(String receiverPhone) 
    {
        this.receiverPhone = receiverPhone;
    }

    public String getReceiverPhone() 
    {
        return receiverPhone;
    }

    public void setReceiverAddress(String receiverAddress) 
    {
        this.receiverAddress = receiverAddress;
    }

    public String getReceiverAddress() 
    {
        return receiverAddress;
    }

    public void setOrderItems(List<ClOrderItem> orderItems) 
    {
        this.orderItems = orderItems;
    }

    public List<ClOrderItem> getOrderItems() 
    {
        return orderItems;
    }

    public void setCustomOrders(List<ClCustomOrder> customOrders)
    {
        this.customOrders = customOrders;
    }

    public List<ClCustomOrder> getCustomOrders()
    {
        return customOrders;
    }

    @Override
    public String toString() {
        return new ToStringBuilder(this,ToStringStyle.MULTI_LINE_STYLE)
            .append("orderId", getOrderId())
            .append("orderNo", getOrderNo())
            .append("deviceId", getDeviceId())
            .append("orderType", getOrderType())
            .append("totalAmount", getTotalAmount())
            .append("status", getStatus())
            .append("cancelStatus", getCancelStatus())
            .append("cancelReason", getCancelReason())
            .append("receiverName", getReceiverName())
            .append("receiverPhone", getReceiverPhone())
            .append("receiverAddress", getReceiverAddress())
            .append("orderItems", getOrderItems())
            .append("customOrders", getCustomOrders())
            .append("createBy", getCreateBy())
            .append("createTime", getCreateTime())
            .append("updateBy", getUpdateBy())
            .append("updateTime", getUpdateTime())
            .append("remark", getRemark())
            .toString();
    }
}
