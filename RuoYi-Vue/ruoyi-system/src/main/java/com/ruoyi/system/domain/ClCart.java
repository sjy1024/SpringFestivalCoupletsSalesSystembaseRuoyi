package com.ruoyi.system.domain;

import java.util.Date;
import com.fasterxml.jackson.annotation.JsonFormat;
import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;
import com.ruoyi.common.annotation.Excel;
import com.ruoyi.common.core.domain.BaseEntity;

/**
 * 购物车对象 cl_cart
 * 
 * @author ruoyi
 * @date 2026-02-04
 */
public class ClCart extends BaseEntity
{
    private static final long serialVersionUID = 1L;

    /** 购物车ID */
    private Long cartId;

    /** 设备ID */
    @Excel(name = "设备ID")
    private String deviceId;

    /** 商品ID */
    @Excel(name = "商品ID")
    private Long goodsId;

    /** 数量 */
    @Excel(name = "数量")
    private Integer quantity;

    /** 规格快照JSON（尺寸/联纸） */
    private String itemSpec;

    public void setCartId(Long cartId) 
    {
        this.cartId = cartId;
    }

    public Long getCartId() 
    {
        return cartId;
    }
    
    public void setDeviceId(String deviceId) 
    {
        this.deviceId = deviceId;
    }

    public String getDeviceId() 
    {
        return deviceId;
    }
    
    public void setGoodsId(Long goodsId) 
    {
        this.goodsId = goodsId;
    }

    public Long getGoodsId() 
    {
        return goodsId;
    }
    
    public void setQuantity(Integer quantity) 
    {
        this.quantity = quantity;
    }

    public Integer getQuantity() 
    {
        return quantity;
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
            .append("cartId", getCartId())
            .append("deviceId", getDeviceId())
            .append("goodsId", getGoodsId())
            .append("quantity", getQuantity())
            .append("itemSpec", getItemSpec())
            .append("createTime", getCreateTime())
            .append("updateTime", getUpdateTime())
            .toString();
    }
}