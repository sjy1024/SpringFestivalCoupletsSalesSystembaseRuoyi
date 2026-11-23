package com.ruoyi.system.service;

import com.ruoyi.system.domain.ClUserAddress;
import java.util.List;

/**
 * 用户收货地址Service接口
 * 
 * @author ruoyi
 * @date 2026-02-10
 */
public interface IClUserAddressService 
{
    /**
     * 查询用户收货地址
     * 
     * @param addressId 地址ID
     * @return 用户收货地址
     */
    public ClUserAddress selectClUserAddressById(Long addressId);

    /**
     * 查询用户收货地址列表
     * 
     * @param clUserAddress 用户收货地址
     * @return 用户收货地址集合
     */
    public List<ClUserAddress> selectClUserAddressList(ClUserAddress clUserAddress);

    /**
     * 根据设备ID查询地址列表（小程序端使用）
     * 
     * @param deviceId 设备ID
     * @return 地址列表
     */
    public List<ClUserAddress> selectAddressListByDeviceId(String deviceId);

    /**
     * 查询用户的默认地址
     * 
     * @param deviceId 设备ID
     * @return 默认地址
     */
    public ClUserAddress selectDefaultAddressByDeviceId(String deviceId);

    /**
     * 新增用户收货地址
     * 
     * @param clUserAddress 用户收货地址
     * @return 结果
     */
    public int insertClUserAddress(ClUserAddress clUserAddress);

    /**
     * 修改用户收货地址
     * 
     * @param clUserAddress 用户收货地址
     * @return 结果
     */
    public int updateClUserAddress(ClUserAddress clUserAddress);

    /**
     * 批量删除用户收货地址
     * 
     * @param addressIds 需要删除的地址ID
     * @return 结果
     */
    public int deleteClUserAddressByIds(Long[] addressIds);

    /**
     * 删除用户收货地址信息
     * 
     * @param addressId 地址ID
     * @return 结果
     */
    public int deleteClUserAddressById(Long addressId);

    /**
     * 设置默认地址
     * 
     * @param addressId 地址ID
     * @param deviceId 设备ID
     * @return 结果
     */
    public int setDefaultAddress(Long addressId, String deviceId);
}
