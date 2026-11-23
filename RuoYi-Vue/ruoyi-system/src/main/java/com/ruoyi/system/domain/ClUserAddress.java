package com.ruoyi.system.domain;

import com.ruoyi.common.annotation.Excel;
import com.ruoyi.common.core.domain.BaseEntity;
import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;

/**
 * 用户收货地址对象 cl_user_address
 * 
 * @author ruoyi
 * @date 2026-02-10
 */
public class ClUserAddress extends BaseEntity
{
    private static final long serialVersionUID = 1L;

    /** 地址ID */
    private Long addressId;

    /** 用户ID */
    private Long userId;

    /** 设备ID */
    @Excel(name = "设备ID")
    private String deviceId;

    /** 收货人姓名 */
    @Excel(name = "收货人姓名")
    private String receiverName;

    /** 收货人电话 */
    @Excel(name = "收货人电话")
    private String receiverPhone;

    /** 省份编码 */
    private String provinceCode;

    /** 省份名称 */
    @Excel(name = "省份")
    private String provinceName;

    /** 城市编码 */
    private String cityCode;

    /** 城市名称 */
    @Excel(name = "城市")
    private String cityName;

    /** 区县编码 */
    private String districtCode;

    /** 区县名称 */
    @Excel(name = "区县")
    private String districtName;

    /** 详细地址 */
    @Excel(name = "详细地址")
    private String detailAddress;

    /** 地址标签 */
    @Excel(name = "地址标签")
    private String addressTag;

    /** 是否默认地址 */
    @Excel(name = "是否默认", readConverterExp = "0=否,1=是")
    private Integer isDefault;

    /** 纬度 */
    private String latitude;

    /** 经度 */
    private String longitude;

    /** 状态 */
    @Excel(name = "状态", readConverterExp = "0=正常,1=停用")
    private String status;

    /** 删除标志 */
    private String delFlag;

    public void setAddressId(Long addressId) 
    {
        this.addressId = addressId;
    }

    public Long getAddressId() 
    {
        return addressId;
    }

    public void setUserId(Long userId) 
    {
        this.userId = userId;
    }

    public Long getUserId() 
    {
        return userId;
    }

    public void setDeviceId(String deviceId) 
    {
        this.deviceId = deviceId;
    }

    public String getDeviceId() 
    {
        return deviceId;
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

    public void setProvinceCode(String provinceCode) 
    {
        this.provinceCode = provinceCode;
    }

    public String getProvinceCode() 
    {
        return provinceCode;
    }

    public void setProvinceName(String provinceName) 
    {
        this.provinceName = provinceName;
    }

    public String getProvinceName() 
    {
        return provinceName;
    }

    public void setCityCode(String cityCode) 
    {
        this.cityCode = cityCode;
    }

    public String getCityCode() 
    {
        return cityCode;
    }

    public void setCityName(String cityName) 
    {
        this.cityName = cityName;
    }

    public String getCityName() 
    {
        return cityName;
    }

    public void setDistrictCode(String districtCode) 
    {
        this.districtCode = districtCode;
    }

    public String getDistrictCode() 
    {
        return districtCode;
    }

    public void setDistrictName(String districtName) 
    {
        this.districtName = districtName;
    }

    public String getDistrictName() 
    {
        return districtName;
    }

    public void setDetailAddress(String detailAddress) 
    {
        this.detailAddress = detailAddress;
    }

    public String getDetailAddress() 
    {
        return detailAddress;
    }

    public void setAddressTag(String addressTag) 
    {
        this.addressTag = addressTag;
    }

    public String getAddressTag() 
    {
        return addressTag;
    }

    public void setIsDefault(Integer isDefault) 
    {
        this.isDefault = isDefault;
    }

    public Integer getIsDefault() 
    {
        return isDefault;
    }

    public void setLatitude(String latitude) 
    {
        this.latitude = latitude;
    }

    public String getLatitude() 
    {
        return latitude;
    }

    public void setLongitude(String longitude) 
    {
        this.longitude = longitude;
    }

    public String getLongitude() 
    {
        return longitude;
    }

    public void setStatus(String status) 
    {
        this.status = status;
    }

    public String getStatus() 
    {
        return status;
    }

    public void setDelFlag(String delFlag) 
    {
        this.delFlag = delFlag;
    }

    public String getDelFlag() 
    {
        return delFlag;
    }

    @Override
    public String toString() {
        return new ToStringBuilder(this,ToStringStyle.MULTI_LINE_STYLE)
            .append("addressId", getAddressId())
            .append("userId", getUserId())
            .append("deviceId", getDeviceId())
            .append("receiverName", getReceiverName())
            .append("receiverPhone", getReceiverPhone())
            .append("provinceCode", getProvinceCode())
            .append("provinceName", getProvinceName())
            .append("cityCode", getCityCode())
            .append("cityName", getCityName())
            .append("districtCode", getDistrictCode())
            .append("districtName", getDistrictName())
            .append("detailAddress", getDetailAddress())
            .append("addressTag", getAddressTag())
            .append("isDefault", getIsDefault())
            .append("latitude", getLatitude())
            .append("longitude", getLongitude())
            .append("status", getStatus())
            .append("delFlag", getDelFlag())
            .append("createBy", getCreateBy())
            .append("createTime", getCreateTime())
            .append("updateBy", getUpdateBy())
            .append("updateTime", getUpdateTime())
            .append("remark", getRemark())
            .toString();
    }
}
