package com.ruoyi.system.service.impl;

import java.util.List;
import com.ruoyi.common.utils.DateUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.ruoyi.system.mapper.ClCustomOrderMapper;
import com.ruoyi.system.domain.ClCustomOrder;
import com.ruoyi.system.domain.ClOrder;
import com.ruoyi.system.service.IClCustomOrderService;
import com.ruoyi.system.service.IClOrderService;

/**
 * 定制订单Service业务层处理
 * 
 * @author ruoyi
 * @date 2026-02-21
 */
@Service
public class ClCustomOrderServiceImpl implements IClCustomOrderService 
{
    @Autowired
    private ClCustomOrderMapper clCustomOrderMapper;

    @Autowired
    private IClOrderService clOrderService;

    @Override
    public ClCustomOrder selectClCustomOrderByCustomId(Long customId)
    {
        return clCustomOrderMapper.selectClCustomOrderByCustomId(customId);
    }

    @Override
    public ClCustomOrder selectClCustomOrderByCustomIdAndDeviceId(Long customId, String deviceId)
    {
        return clCustomOrderMapper.selectClCustomOrderByCustomIdAndDeviceId(customId, deviceId);
    }

    @Override
    public List<ClCustomOrder> selectClCustomOrderList(ClCustomOrder clCustomOrder)
    {
        return clCustomOrderMapper.selectClCustomOrderList(clCustomOrder);
    }

    @Override
    public List<ClCustomOrder> selectClCustomOrderListByDeviceId(String deviceId)
    {
        return clCustomOrderMapper.selectClCustomOrderListByDeviceId(deviceId);
    }

    @Override
    public int insertClCustomOrder(ClCustomOrder clCustomOrder)
    {
        clCustomOrder.setCreateTime(DateUtils.getNowDate());
        return clCustomOrderMapper.insertClCustomOrder(clCustomOrder);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public int updateClCustomOrder(ClCustomOrder clCustomOrder)
    {
        ClCustomOrder existing = null;
        if (clCustomOrder.getCustomId() != null)
        {
            existing = clCustomOrderMapper.selectClCustomOrderByCustomId(clCustomOrder.getCustomId());
        }
        clCustomOrder.setUpdateTime(DateUtils.getNowDate());
        int rows = clCustomOrderMapper.updateClCustomOrder(clCustomOrder);
        if (rows > 0 && existing != null && clCustomOrder.getStatus() != null
                && !clCustomOrder.getStatus().equals(existing.getStatus()))
        {
            ClCustomOrder latest = clCustomOrderMapper.selectClCustomOrderByCustomId(clCustomOrder.getCustomId());
            syncLinkedOrderStatus(latest);
        }
        return rows;
    }

    /**
     * 定制进度变更时同步关联主订单状态：
     * 定制待接单/制作中/已完成(0/1/2) → 订单待支付/已支付/制作中/已完成(0/1/2/3) 中的制作中(2)、已完成(3)
     */
    private void syncLinkedOrderStatus(ClCustomOrder customOrder)
    {
        if (customOrder == null || customOrder.getOrderId() == null || customOrder.getStatus() == null)
        {
            return;
        }
        String targetOrderStatus = null;
        if ("1".equals(customOrder.getStatus()))
        {
            targetOrderStatus = "2";
        }
        else if ("2".equals(customOrder.getStatus()))
        {
            targetOrderStatus = "3";
        }
        else
        {
            return;
        }

        ClOrder order = clOrderService.selectClOrderByOrderId(customOrder.getOrderId());
        if (order == null || "4".equals(order.getStatus()))
        {
            return;
        }
        if (!shouldUpgradeOrderStatus(order.getStatus(), targetOrderStatus))
        {
            return;
        }
        order.setStatus(targetOrderStatus);
        order.setUpdateTime(DateUtils.getNowDate());
        clOrderService.updateClOrder(order);
    }

    private boolean shouldUpgradeOrderStatus(String current, String target)
    {
        if (current == null || target == null || current.equals(target))
        {
            return false;
        }
        try
        {
            return Integer.parseInt(target) > Integer.parseInt(current);
        }
        catch (NumberFormatException e)
        {
            return false;
        }
    }

    @Override
    public int deleteClCustomOrderByCustomId(Long customId)
    {
        return clCustomOrderMapper.deleteClCustomOrderByCustomId(customId);
    }

    @Override
    public int deleteClCustomOrderByCustomIds(Long[] customIds)
    {
        return clCustomOrderMapper.deleteClCustomOrderByCustomIds(customIds);
    }


    @Override
    public synchronized Long generateQueueNo(String status)
    {
        // 使用数据库查询最大排队号，避免并发问题
        Long maxQueueNo = clCustomOrderMapper.selectMaxQueueNoByStatus(status);
        return maxQueueNo + 1;
    }

}
