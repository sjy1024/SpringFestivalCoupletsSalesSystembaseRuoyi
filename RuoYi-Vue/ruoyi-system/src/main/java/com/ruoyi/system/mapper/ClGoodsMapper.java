package com.ruoyi.system.mapper;

import com.ruoyi.system.domain.ClGoods;

import java.util.List;

/**
 * 商品Mapper接口
 * 
 * @author ruoyi
 * @date 2026-01-26
 */
public interface ClGoodsMapper 
{
    /**
     * 查询商品
     * 
     * @param goodsId 商品主键
     * @return 商品
     */
    public ClGoods selectClGoodsByGoodsId(Long goodsId);

    /**
     * 查询商品列表
     * 
     * @param clGoods 商品
     * @return 商品集合
     */
    public List<ClGoods> selectClGoodsList(ClGoods clGoods);

    /**
     * 新增商品
     * 
     * @param clGoods 商品
     * @return 结果
     */
    public int insertClGoods(ClGoods clGoods);

    /**
     * 修改商品
     * 
     * @param clGoods 商品
     * @return 结果
     */
    public int updateClGoods(ClGoods clGoods);

    /**
     * 删除商品
     * 
     * @param goodsId 商品主键
     * @return 结果
     */
    public int deleteClGoodsByGoodsId(Long goodsId);

    /**
     * 批量删除商品
     * 
     * @param goodsIds 需要删除的数据主键集合
     * @return 结果
     */
    public int deleteClGoodsByGoodsIds(Long[] goodsIds);
}
