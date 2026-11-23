package com.ruoyi.web.controller.app.dto;

import lombok.Data;

import java.util.List;

/**
 * 物流节点VO
 * 用于返回物流轨迹信息
 * 
 * @author ruoyi
 * @date 2026-01-29
 */
@Data
public class AppLogisticsNodeVO
{
    /**
     * 节点标题
     */
    private String title;

    /**
     * 节点代码
     */
    private String code;

    /**
     * 子节点
     */
    private List<AppLogisticsSubNodeVO> nodes;
}
