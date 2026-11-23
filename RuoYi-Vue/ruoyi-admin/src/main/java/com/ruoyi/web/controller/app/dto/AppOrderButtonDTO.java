package com.ruoyi.web.controller.app.dto;

import lombok.Data;

/**
 * 订单按钮DTO
 * 用于订单状态流转按钮
 * 
 * @author ruoyi
 * @date 2026-01-29
 */
@Data
public class AppOrderButtonDTO
{
    /**
     * 按钮ID
     */
    private String id;

    /**
     * 按钮文本
     */
    private String text;

    /**
     * 按钮类型
     */
    private String type;

    /**
     * 按钮样式
     */
    private String style;

    /**
     * 按钮操作
     */
    private String action;

    /**
     * 按钮参数
     */
    private Object params;

    /**
     * 是否显示
     */
    private Boolean visible;

    /**
     * 是否禁用
     */
    private Boolean disabled;
}
