package com.ruoyi.web.controller.app.dto;

import lombok.Data;

/**
 * 物流子节点VO
 * 用于返回物流轨迹的子节点信息
 * 
 * @author ruoyi
 * @date 2026-01-29
 */
@Data
public class AppLogisticsSubNodeVO
{
    /**
     * 子节点状态
     */
    private String status;

    /**
     * 子节点时间戳
     */
    private Long timestamp;

    /**
     * 子节点描述
     */
    private String desc;

    /**
     * 子节点地点
     */
    private String location;

    /**
     * 子节点操作人
     */
    private String operator;
}
