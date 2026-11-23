package com.ruoyi.system.domain;

import com.ruoyi.common.annotation.Excel;
import com.ruoyi.common.core.domain.BaseEntity;
import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;

import java.math.BigDecimal;

/**
 * 商品对象 cl_goods
 * 
 * @author ruoyi
 * @date 2026-01-26
 */
public class ClGoods extends BaseEntity
{
    private static final long serialVersionUID = 1L;

    /** 商品ID */
    private Long goodsId;

    /** 商品名称 */
    @Excel(name = "商品名称")
    private String goodsName;

    /** 商品类型（0普通商品 1需要材质尺寸的商品） */
    @Excel(name = "商品类型", readConverterExp = "0=普通商品,1=需要材质尺寸的商品")
    private String goodsType;

    /** 商品价格 */
    @Excel(name = "商品价格")
    private BigDecimal goodsPrice;

    /** 库存数量 */
    @Excel(name = "库存数量")
    private Long stock;

    /** 封面图片 */
    @Excel(name = "封面图片")
    private String coverImage;

    /** 商品图片（多张，JSON格式） */
    @Excel(name = "商品图片", readConverterExp = "多=张，JSON格式")
    private String images;

    /** 商品描述 */
    @Excel(name = "商品描述")
    private String description;

    /** 规格选项 JSON（尺寸/联纸，goods_type=1 时使用） */
    private String specOptions;

    /** 评分（0-5分） */
    @Excel(name = "评分", readConverterExp = "0=-5分")
    private BigDecimal rating;

    /** 上架状态（0上架 1下架） */
    @Excel(name = "上架状态", readConverterExp = "0=上架,1=下架")
    private String status;

    /** 排序 */
    @Excel(name = "排序")
    private Long sortOrder;

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

    public void setGoodsType(String goodsType) 
    {
        this.goodsType = goodsType;
    }

    public String getGoodsType() 
    {
        return goodsType;
    }

    public void setGoodsPrice(BigDecimal goodsPrice) 
    {
        this.goodsPrice = goodsPrice;
    }

    public BigDecimal getGoodsPrice() 
    {
        return goodsPrice;
    }

    public void setStock(Long stock) 
    {
        this.stock = stock;
    }

    public Long getStock() 
    {
        return stock;
    }

    public void setCoverImage(String coverImage) 
    {
        this.coverImage = coverImage;
    }

    public String getCoverImage() 
    {
        return coverImage;
    }

    public void setImages(String images) 
    {
        this.images = images;
    }

    public String getImages() 
    {
        return images;
    }

    public void setDescription(String description) 
    {
        this.description = description;
    }

    public String getDescription() 
    {
        return description;
    }

    public void setSpecOptions(String specOptions)
    {
        this.specOptions = specOptions;
    }

    public String getSpecOptions()
    {
        return specOptions;
    }

    public void setRating(BigDecimal rating) 
    {
        this.rating = rating;
    }

    public BigDecimal getRating() 
    {
        return rating;
    }

    public void setStatus(String status) 
    {
        this.status = status;
    }

    public String getStatus() 
    {
        return status;
    }

    public void setSortOrder(Long sortOrder) 
    {
        this.sortOrder = sortOrder;
    }

    public Long getSortOrder() 
    {
        return sortOrder;
    }

    @Override
    public String toString() {
        return new ToStringBuilder(this,ToStringStyle.MULTI_LINE_STYLE)
            .append("goodsId", getGoodsId())
            .append("goodsName", getGoodsName())
            .append("goodsType", getGoodsType())
            .append("goodsPrice", getGoodsPrice())
            .append("stock", getStock())
            .append("coverImage", getCoverImage())
            .append("images", getImages())
            .append("description", getDescription())
            .append("specOptions", getSpecOptions())
            .append("rating", getRating())
            .append("status", getStatus())
            .append("sortOrder", getSortOrder())
            .append("createBy", getCreateBy())
            .append("createTime", getCreateTime())
            .append("updateBy", getUpdateBy())
            .append("updateTime", getUpdateTime())
            .append("remark", getRemark())
            .toString();
    }
}
