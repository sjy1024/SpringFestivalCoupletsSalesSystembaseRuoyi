package com.ruoyi.web.controller.app;

import com.ruoyi.common.annotation.Anonymous;
import com.ruoyi.common.core.controller.BaseController;
import com.ruoyi.common.core.domain.AjaxResult;
import com.ruoyi.system.domain.ClGoods;
import com.ruoyi.system.service.IClGoodsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 小程序端 - 商品接口（C端）
 * 
 * @author ruoyi
 * @date 2026-02-03
 */
@Anonymous
@RestController
@RequestMapping("/api/app/goods")
public class AppGoodsController extends BaseController {

    @Autowired
    private IClGoodsService clGoodsService;

    /**
     * 商品列表（仅返回上架商品）
     * 
     * @param goodsName 商品名称（可选，模糊查询）
     * @param goodsType 商品类型（可选）
     * @return 商品列表
     */
    @GetMapping("/list")
    public AjaxResult list(@RequestParam(required = false) String goodsName,
                           @RequestParam(required = false) String goodsType) {
        ClGoods query = new ClGoods();
        query.setStatus("0");  // 只查上架商品
        query.setGoodsName(goodsName);
        query.setGoodsType(goodsType);
        List<ClGoods> list = clGoodsService.selectClGoodsList(query);
        return success(list);
    }

    /**
     * 商品详情
     * 
     * @param goodsId 商品ID
     * @return 商品详情
     */
    @GetMapping("/{goodsId}")
    public AjaxResult getInfo(@PathVariable Long goodsId) {
        ClGoods goods = clGoodsService.selectClGoodsByGoodsId(goodsId);
        if (goods == null) {
            return AjaxResult.error("商品不存在");
        }
        return success(goods);
    }
}
