package com.ruoyi.system.service.impl;

import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.ruoyi.system.mapper.ClCartMapper;
import com.ruoyi.system.domain.ClCart;
import com.ruoyi.system.service.IClCartService;

/**
 * 购物车Service业务层处理
 * 
 * @author ruoyi
 * @date 2026-02-04
 */
@Service
public class ClCartServiceImpl implements IClCartService 
{
    @Autowired
    private ClCartMapper clCartMapper;

    /**
     * 查询购物车
     * 
     * @param cartId 购物车主键
     * @return 购物车
     */
    @Override
    public ClCart selectClCartByCartId(Long cartId)
    {
        return clCartMapper.selectClCartByCartId(cartId);
    }

    /**
     * 查询购物车列表
     * 
     * @param clCart 购物车
     * @return 购物车
     */
    @Override
    public List<ClCart> selectClCartList(ClCart clCart)
    {
        return clCartMapper.selectClCartList(clCart);
    }

    /**
     * 新增购物车
     * 
     * @param clCart 购物车
     * @return 结果
     */
    @Override
    public int insertClCart(ClCart clCart)
    {
        return clCartMapper.insertClCart(clCart);
    }

    /**
     * 修改购物车
     * 
     * @param clCart 购物车
     * @return 结果
     */
    @Override
    public int updateClCart(ClCart clCart)
    {
        return clCartMapper.updateClCart(clCart);
    }

    /**
     * 批量删除购物车
     * 
     * @param cartIds 需要删除的购物车主键
     * @return 结果
     */
    @Override
    public int deleteClCartByCartIds(Long[] cartIds)
    {
        return clCartMapper.deleteClCartByCartIds(cartIds);
    }

    /**
     * 删除购物车信息
     * 
     * @param cartId 购物车主键
     * @return 结果
     */
    @Override
    public int deleteClCartByCartId(Long cartId)
    {
        return clCartMapper.deleteClCartByCartId(cartId);
    }

    /**
     * 根据设备ID和商品ID查询购物车记录
     * 
     * @param deviceId 设备ID
     * @param goodsId 商品ID
     * @return 购物车记录
     */
    @Override
    public ClCart selectCartByDeviceIdAndGoodsId(String deviceId, Long goodsId, String itemSpec)
    {
        return clCartMapper.selectCartByDeviceIdAndGoodsId(deviceId, goodsId, itemSpec);
    }

    /**
     * 查询购物车列表（包含商品信息）
     * 
     * @param deviceId 设备ID
     * @return 购物车列表
     */
    @Override
    public List<Map<String, Object>> selectCartListWithGoods(String deviceId)
    {
        return clCartMapper.selectCartListWithGoods(deviceId);
    }

    /**
     * 根据设备ID删除购物车记录
     * 
     * @param deviceId 设备ID
     * @return 结果
     */
    @Override
    public int deleteCartByDeviceId(String deviceId)
    {
        return clCartMapper.deleteCartByDeviceId(deviceId);
    }
}