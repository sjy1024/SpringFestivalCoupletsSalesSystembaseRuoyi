package com.ruoyi.system.service.impl;

import com.ruoyi.common.utils.DateUtils;
import com.ruoyi.system.domain.ClUserAddress;
import com.ruoyi.system.mapper.ClUserAddressMapper;
import com.ruoyi.system.service.IClUserAddressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 用户收货地址Service业务层处理
 * 
 * @author ruoyi
 * @date 2026-02-10
 */
@Service
public class ClUserAddressServiceImpl implements IClUserAddressService 
{
    @Autowired
    private ClUserAddressMapper clUserAddressMapper;

    /**
     * 查询用户收货地址
     * 
     * @param addressId 地址ID
     * @return 用户收货地址
     */
    @Override
    public ClUserAddress selectClUserAddressById(Long addressId)
    {
        return clUserAddressMapper.selectClUserAddressById(addressId);
    }

    /**
     * 查询用户收货地址列表
     * 
     * @param clUserAddress 用户收货地址
     * @return 用户收货地址
     */
    @Override
    public List<ClUserAddress> selectClUserAddressList(ClUserAddress clUserAddress)
    {
        return clUserAddressMapper.selectClUserAddressList(clUserAddress);
    }

    /**
     * 根据设备ID查询地址列表
     * 
     * @param deviceId 设备ID
     * @return 地址列表
     */
    @Override
    public List<ClUserAddress> selectAddressListByDeviceId(String deviceId)
    {
        return clUserAddressMapper.selectAddressListByDeviceId(deviceId);
    }

    /**
     * 查询用户的默认地址
     * 
     * @param deviceId 设备ID
     * @return 默认地址
     */
    @Override
    public ClUserAddress selectDefaultAddressByDeviceId(String deviceId)
    {
        return clUserAddressMapper.selectDefaultAddressByDeviceId(deviceId);
    }

    /**
     * 新增用户收货地址
     * 
     * @param clUserAddress 用户收货地址
     * @return 结果
     */
    @Override
    @Transactional
    public int insertClUserAddress(ClUserAddress clUserAddress)
    {
        // 如果设置为默认地址，先取消该设备的其他默认地址
        if (clUserAddress.getIsDefault() != null && clUserAddress.getIsDefault() == 1)
        {
            clUserAddressMapper.cancelDefaultByDeviceId(clUserAddress.getDeviceId());
        }
        
        clUserAddress.setCreateTime(DateUtils.getNowDate());
        clUserAddress.setDelFlag("0");
        if (clUserAddress.getStatus() == null)
        {
            clUserAddress.setStatus("0");
        }
        return clUserAddressMapper.insertClUserAddress(clUserAddress);
    }

    /**
     * 修改用户收货地址
     * 
     * @param clUserAddress 用户收货地址
     * @return 结果
     */
    @Override
    @Transactional
    public int updateClUserAddress(ClUserAddress clUserAddress)
    {
        // 如果设置为默认地址，先取消该设备的其他默认地址
        if (clUserAddress.getIsDefault() != null && clUserAddress.getIsDefault() == 1)
        {
            clUserAddressMapper.cancelDefaultByDeviceId(clUserAddress.getDeviceId());
        }
        
        clUserAddress.setUpdateTime(DateUtils.getNowDate());
        return clUserAddressMapper.updateClUserAddress(clUserAddress);
    }

    /**
     * 批量删除用户收货地址
     * 
     * @param addressIds 需要删除的地址ID
     * @return 结果
     */
    @Override
    public int deleteClUserAddressByIds(Long[] addressIds)
    {
        return clUserAddressMapper.deleteClUserAddressByIds(addressIds);
    }

    /**
     * 删除用户收货地址信息
     * 
     * @param addressId 地址ID
     * @return 结果
     */
    @Override
    public int deleteClUserAddressById(Long addressId)
    {
        return clUserAddressMapper.deleteClUserAddressById(addressId);
    }

    /**
     * 设置默认地址
     * 
     * @param addressId 地址ID
     * @param deviceId 设备ID
     * @return 结果
     */
    @Override
    @Transactional
    public int setDefaultAddress(Long addressId, String deviceId)
    {
        // 先取消该设备的所有默认地址
        clUserAddressMapper.cancelDefaultByDeviceId(deviceId);
        
        // 设置新的默认地址
        ClUserAddress address = new ClUserAddress();
        address.setAddressId(addressId);
        address.setIsDefault(1);
        address.setUpdateTime(DateUtils.getNowDate());
        return clUserAddressMapper.updateClUserAddress(address);
    }
}
