package com.ruoyi.system.domain;

import java.math.BigDecimal;
import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;
import com.ruoyi.common.annotation.Excel;
import com.ruoyi.common.core.domain.BaseEntity;

/**
 * 订单商品明细对象 cl_order_item
 *
 * @author ruoyi
 * @date 2026-01-29
 */
public class ClOrderItem extends BaseEntity
{
    private static final long serialVersionUID = 1L;

    /** 商品明细ID */
    @Excel(name = "商品明细ID")
    private Long itemId;

    /** 订单ID */
    @Excel(name = "订单ID")
    private Long orderId;

    /** 商品ID */
    @Excel(name = "商品ID")
    private Long goodsId;

    /** 商品名称 */
    @Excel(name = "商品名称")
    private String goodsName;

    /** 商品单价 */
    @Excel(name = "商品单价")
    private BigDecimal goodsPrice;

    /** 商品数量 */
    @Excel(name = "商品数量")
    private Integer quantity;

    /** 商品总价 */
    @Excel(name = "商品总价")
    private BigDecimal totalPrice;

    /** 规格快照JSON（尺寸/联纸） */
    private String itemSpec;

    public void setItemId(Long itemId)
    {
        this.itemId = itemId;
    }

    public Long getItemId()
    {
        return itemId;
    }

    public void setOrderId(Long orderId)
    {
        this.orderId = orderId;
    }

    public Long getOrderId()
    {
        return orderId;
    }

    public void setGoodsId(Long goodsId)
    {
        this.goodsId = goodsId;
    }

    public Long getGoodsId()
    {
        return goodsId;
    }

    public void setGoodsName(String goodsName)
    {
        this.goodsName = goodsName;
    }

    public String getGoodsName()
    {
        return goodsName;
    }

    public void setGoodsPrice(BigDecimal goodsPrice)
    {
        this.goodsPrice = goodsPrice;
    }

    public BigDecimal getGoodsPrice()
    {
        return goodsPrice;
    }

    public void setQuantity(Integer quantity)
    {
        this.quantity = quantity;
    }

    public Integer getQuantity()
    {
        return quantity;
    }

    public void setTotalPrice(BigDecimal totalPrice)
    {
        this.totalPrice = totalPrice;
    }

    public BigDecimal getTotalPrice()
    {
        return totalPrice;
    }

    public void setItemSpec(String itemSpec)
    {
        this.itemSpec = itemSpec;
    }

    public String getItemSpec()
    {
        return itemSpec;
    }

    @Override
    public String toString() {
        return new ToStringBuilder(this,ToStringStyle.MULTI_LINE_STYLE)
                .append("itemId", getItemId())
                .append("orderId", getOrderId())
                .append("goodsId", getGoodsId())
                .append("goodsName", getGoodsName())
                .append("goodsPrice", getGoodsPrice())
                .append("quantity", getQuantity())
                .append("totalPrice", getTotalPrice())
                .append("itemSpec", getItemSpec())
                .append("createBy", getCreateBy())
                .append("createTime", getCreateTime())
                .append("updateBy", getUpdateBy())
                .append("updateTime", getUpdateTime())
                .append("remark", getRemark())
                .toString();
    }
}