package com.ruoyi.system.service;

import java.util.List;
import java.util.Map;
import com.ruoyi.system.domain.ClCart;

/**
 * 购物车Service接口
 * 
 * @author ruoyi
 * @date 2026-02-04
 */
public interface IClCartService 
{
    /**
     * 查询购物车
     * 
     * @param cartId 购物车主键
     * @return 购物车
     */
    public ClCart selectClCartByCartId(Long cartId);

    /**
     * 查询购物车列表
     * 
     * @param clCart 购物车
     * @return 购物车集合
     */
    public List<ClCart> selectClCartList(ClCart clCart);

    /**
     * 新增购物车
     * 
     * @param clCart 购物车
     * @return 结果
     */
    public int insertClCart(ClCart clCart);

    /**
     * 修改购物车
     * 
     * @param clCart 购物车
     * @return 结果
     */
    public int updateClCart(ClCart clCart);

    /**
     * 批量删除购物车
     * 
     * @param cartIds 需要删除的购物车主键集合
     * @return 结果
     */
    public int deleteClCartByCartIds(Long[] cartIds);

    /**
     * 删除购物车信息
     * 
     * @param cartId 购物车主键
     * @return 结果
     */
    public int deleteClCartByCartId(Long cartId);

    /**
     * 根据设备ID和商品ID查询购物车记录
     * 
     * @param deviceId 设备ID
     * @param goodsId 商品ID
     * @return 购物车记录
     */
    public ClCart selectCartByDeviceIdAndGoodsId(String deviceId, Long goodsId, String itemSpec);

    /**
     * 查询购物车列表（包含商品信息）
     * 
     * @param deviceId 设备ID
     * @return 购物车列表
     */
    public List<Map<String, Object>> selectCartListWithGoods(String deviceId);

    /**
     * 根据设备ID删除购物车记录
     * 
     * @param deviceId 设备ID
     * @return 结果
     */
    public int deleteCartByDeviceId(String deviceId);
}