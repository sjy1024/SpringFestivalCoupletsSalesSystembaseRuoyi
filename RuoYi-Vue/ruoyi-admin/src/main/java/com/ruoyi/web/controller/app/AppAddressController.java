package com.ruoyi.web.controller.app;

import com.ruoyi.common.core.controller.BaseController;
import com.ruoyi.common.core.domain.AjaxResult;
import com.ruoyi.system.domain.ClUserAddress;
import com.ruoyi.system.service.IClUserAddressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 小程序端 - 收货地址Controller
 * 
 * @author ruoyi
 * @date 2026-02-10
 */
@RestController
@RequestMapping("/api/app/address")
public class AppAddressController extends BaseController
{
    @Autowired
    private IClUserAddressService clUserAddressService;

    /**
     * 获取地址列表
     * 
     * @param deviceId 设备ID
     * @return 地址列表
     */
    @GetMapping("/list")
    public AjaxResult list(@RequestParam String deviceId,
                           @RequestHeader(value = "X-Device-ID", required = false) String headerDeviceId)
    {
        String dev = AppClientDeviceCheck.resolveDeviceId(deviceId, headerDeviceId);
        if (AppClientDeviceCheck.isBlank(dev))
        {
            return AjaxResult.error("设备ID不能为空");
        }
        List<ClUserAddress> list = clUserAddressService.selectAddressListByDeviceId(dev);
        return AjaxResult.success(list);
    }

    /**
     * 获取默认地址
     * 
     * @param deviceId 设备ID
     * @return 默认地址
     */
    @GetMapping("/default")
    public AjaxResult getDefault(@RequestParam String deviceId,
                                 @RequestHeader(value = "X-Device-ID", required = false) String headerDeviceId)
    {
        String dev = AppClientDeviceCheck.resolveDeviceId(deviceId, headerDeviceId);
        if (AppClientDeviceCheck.isBlank(dev))
        {
            return AjaxResult.error("设备ID不能为空");
        }
        ClUserAddress address = clUserAddressService.selectDefaultAddressByDeviceId(dev);
        return AjaxResult.success(address);
    }

    /**
     * 获取地址详情
     * 
     * @param addressId 地址ID
     * @return 地址详情
     */
    @GetMapping("/{addressId}")
    public AjaxResult getInfo(@PathVariable Long addressId,
                              @RequestParam("deviceId") String deviceId,
                              @RequestHeader(value = "X-Device-ID", required = false) String headerDeviceId)
    {
        String dev = AppClientDeviceCheck.resolveDeviceId(deviceId, headerDeviceId);
        if (AppClientDeviceCheck.isBlank(dev))
        {
            return AjaxResult.error("设备ID不能为空");
        }
        ClUserAddress address = clUserAddressService.selectClUserAddressById(addressId);
        if (address == null)
        {
            return AjaxResult.error("地址不存在");
        }
        if (!AppClientDeviceCheck.addressBelongs(address, dev))
        {
            return AjaxResult.error("无权查看该地址");
        }
        return AjaxResult.success(address);
    }

    /**
     * 新增地址
     * 
     * @param address 地址信息
     * @return 结果
     */
    @PostMapping
    public AjaxResult add(@RequestBody ClUserAddress address,
                          @RequestHeader(value = "X-Device-ID", required = false) String headerDeviceId)
    {
        String dev = AppClientDeviceCheck.resolveDeviceId(address.getDeviceId(), headerDeviceId);
        if (AppClientDeviceCheck.isBlank(dev))
        {
            return AjaxResult.error("设备ID不能为空");
        }
        address.setDeviceId(dev);

        // 验证必填字段
        if (address.getReceiverName() == null || address.getReceiverName().isEmpty())
        {
            return AjaxResult.error("收货人姓名不能为空");
        }
        if (address.getReceiverPhone() == null || address.getReceiverPhone().isEmpty())
        {
            return AjaxResult.error("收货人电话不能为空");
        }
        if (address.getDetailAddress() == null || address.getDetailAddress().isEmpty())
        {
            return AjaxResult.error("详细地址不能为空");
        }

        int result = clUserAddressService.insertClUserAddress(address);
        if (result > 0)
        {
            return AjaxResult.success("添加成功", address);
        }
        return AjaxResult.error("添加失败");
    }

    /**
     * 修改地址
     * 
     * @param address 地址信息
     * @return 结果
     */
    @PutMapping
    public AjaxResult edit(@RequestBody ClUserAddress address,
                           @RequestHeader(value = "X-Device-ID", required = false) String headerDeviceId)
    {
        // 验证地址ID
        if (address.getAddressId() == null)
        {
            return AjaxResult.error("地址ID不能为空");
        }

        String dev = AppClientDeviceCheck.resolveDeviceId(address.getDeviceId(), headerDeviceId);
        if (AppClientDeviceCheck.isBlank(dev))
        {
            return AjaxResult.error("设备ID不能为空");
        }
        address.setDeviceId(dev);

        // 验证必填字段
        if (address.getReceiverName() == null || address.getReceiverName().isEmpty())
        {
            return AjaxResult.error("收货人姓名不能为空");
        }
        if (address.getReceiverPhone() == null || address.getReceiverPhone().isEmpty())
        {
            return AjaxResult.error("收货人电话不能为空");
        }
        if (address.getDetailAddress() == null || address.getDetailAddress().isEmpty())
        {
            return AjaxResult.error("详细地址不能为空");
        }

        ClUserAddress existing = clUserAddressService.selectClUserAddressById(address.getAddressId());
        if (existing == null)
        {
            return AjaxResult.error("地址不存在");
        }
        if (!AppClientDeviceCheck.addressBelongs(existing, address.getDeviceId()))
        {
            return AjaxResult.error("无权修改该地址");
        }
        address.setDeviceId(existing.getDeviceId());

        int result = clUserAddressService.updateClUserAddress(address);
        if (result > 0)
        {
            return AjaxResult.success("修改成功");
        }
        return AjaxResult.error("修改失败");
    }

    /**
     * 删除地址
     * 
     * @param addressId 地址ID
     * @return 结果
     */
    @DeleteMapping("/{addressId}")
    public AjaxResult remove(@PathVariable Long addressId,
                             @RequestParam("deviceId") String deviceId,
                             @RequestHeader(value = "X-Device-ID", required = false) String headerDeviceId)
    {
        String dev = AppClientDeviceCheck.resolveDeviceId(deviceId, headerDeviceId);
        if (AppClientDeviceCheck.isBlank(dev))
        {
            return AjaxResult.error("设备ID不能为空");
        }
        ClUserAddress existing = clUserAddressService.selectClUserAddressById(addressId);
        if (existing == null)
        {
            return AjaxResult.error("地址不存在");
        }
        if (!AppClientDeviceCheck.addressBelongs(existing, dev))
        {
            return AjaxResult.error("无权删除该地址");
        }
        int result = clUserAddressService.deleteClUserAddressById(addressId);
        if (result > 0)
        {
            return AjaxResult.success("删除成功");
        }
        return AjaxResult.error("删除失败");
    }

    /**
     * 设置默认地址
     * 
     * @param addressId 地址ID
     * @param deviceId 设备ID
     * @return 结果
     */
    @PutMapping("/setDefault")
    public AjaxResult setDefault(@RequestParam Long addressId, @RequestParam String deviceId,
                                 @RequestHeader(value = "X-Device-ID", required = false) String headerDeviceId)
    {
        String dev = AppClientDeviceCheck.resolveDeviceId(deviceId, headerDeviceId);
        if (AppClientDeviceCheck.isBlank(dev))
        {
            return AjaxResult.error("设备ID不能为空");
        }
        int result = clUserAddressService.setDefaultAddress(addressId, dev);
        if (result > 0)
        {
            return AjaxResult.success("设置成功");
        }
        return AjaxResult.error("设置失败");
    }
}
