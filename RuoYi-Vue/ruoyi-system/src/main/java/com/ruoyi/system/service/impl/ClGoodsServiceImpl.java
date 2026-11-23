package com.ruoyi.system.service.impl;

import com.ruoyi.common.utils.DateUtils;
import com.ruoyi.system.domain.ClGoods;
import com.ruoyi.system.mapper.ClGoodsMapper;
import com.ruoyi.system.service.IClGoodsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 商品Service业务层处理
 * 
 * @author ruoyi
 * @date 2026-01-26
 */
@Service
public class ClGoodsServiceImpl implements IClGoodsService 
{
    @Autowired
    private ClGoodsMapper clGoodsMapper;

    /**
     * 查询商品
     * 
     * @param goodsId 商品主键
     * @return 商品
     */
    @Override
    public ClGoods selectClGoodsByGoodsId(Long goodsId)
    {
        return clGoodsMapper.selectClGoodsByGoodsId(goodsId);
    }

    /**
     * 查询商品列表
     * 
     * @param clGoods 商品
     * @return 商品
     */
    @Override
    public List<ClGoods> selectClGoodsList(ClGoods clGoods)
    {
        return clGoodsMapper.selectClGoodsList(clGoods);
    }

    /**
     * 新增商品
     * 
     * @param clGoods 商品
     * @return 结果
     */
    @Override
    public int insertClGoods(ClGoods clGoods)
    {
        clGoods.setCreateTime(DateUtils.getNowDate());
        return clGoodsMapper.insertClGoods(clGoods);
    }

    /**
     * 修改商品
     * 
     * @param clGoods 商品
     * @return 结果
     */
    @Override
    public int updateClGoods(ClGoods clGoods)
    {
        clGoods.setUpdateTime(DateUtils.getNowDate());
        return clGoodsMapper.updateClGoods(clGoods);
    }

    /**
     * 批量删除商品
     * 
     * @param goodsIds 需要删除的商品主键
     * @return 结果
     */
    @Override
    public int deleteClGoodsByGoodsIds(Long[] goodsIds)
    {
        return clGoodsMapper.deleteClGoodsByGoodsIds(goodsIds);
    }

    /**
     * 删除商品信息
     * 
     * @param goodsId 商品主键
     * @return 结果
     */
    @Override
    public int deleteClGoodsByGoodsId(Long goodsId)
    {
        return clGoodsMapper.deleteClGoodsByGoodsId(goodsId);
    }
}
