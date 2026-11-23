package com.ruoyi.system.utils;

import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONArray;
import com.alibaba.fastjson2.JSONObject;
import com.ruoyi.common.utils.StringUtils;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

/**
 * 商品规格（尺寸/联纸）解析与计价，与后台 cl_goods.spec_options 格式一致。
 */
public final class GoodsSpecHelper {

    private GoodsSpecHelper() {
    }

    public static boolean isSpecGoods(String goodsType) {
        return "1".equals(goodsType);
    }

    public static JSONObject parseSpecOptions(String specOptions) {
        if (StringUtils.isEmpty(specOptions)) {
            return new JSONObject();
        }
        try {
            return JSON.parseObject(specOptions);
        } catch (Exception e) {
            return new JSONObject();
        }
    }

    /**
     * 校验并解析所选规格，返回规格快照 JSON 与单价。
     */
    public static Map<String, Object> resolveSelection(String goodsType, String specOptions,
                                                       Integer sizeId, Integer materialId) {
        if (!isSpecGoods(goodsType)) {
            return null;
        }
        if (sizeId == null || materialId == null) {
            throw new IllegalArgumentException("请选择尺寸和联纸");
        }

        JSONObject root = parseSpecOptions(specOptions);
        JSONArray sizes = root.getJSONArray("sizes");
        JSONArray materials = root.getJSONArray("materials");
        if (sizes == null || sizes.isEmpty()) {
            throw new IllegalArgumentException("商品未配置尺寸规格");
        }
        if (materials == null || materials.isEmpty()) {
            throw new IllegalArgumentException("商品未配置联纸规格");
        }

        JSONObject sizeObj = findById(sizes, sizeId);
        if (sizeObj == null) {
            throw new IllegalArgumentException("所选尺寸不可用");
        }
        JSONObject materialObj = findById(materials, materialId);
        if (materialObj == null) {
            throw new IllegalArgumentException("所选联纸不可用");
        }

        BigDecimal basePrice = sizeObj.getBigDecimal("price");
        if (basePrice == null) {
            basePrice = BigDecimal.ZERO;
        }
        BigDecimal extraPrice = materialObj.getBigDecimal("extraPrice");
        if (extraPrice == null) {
            extraPrice = BigDecimal.ZERO;
        }
        BigDecimal unitPrice = basePrice.add(extraPrice);

        Map<String, Object> snapshot = new HashMap<>();
        snapshot.put("sizeId", sizeId);
        snapshot.put("sizeName", sizeObj.getString("name"));
        snapshot.put("materialId", materialId);
        snapshot.put("materialName", materialObj.getString("name"));
        snapshot.put("unitPrice", unitPrice);

        Map<String, Object> result = new HashMap<>();
        result.put("itemSpec", JSON.toJSONString(snapshot));
        result.put("unitPrice", unitPrice);
        return result;
    }

    public static BigDecimal extractUnitPrice(String itemSpec) {
        if (StringUtils.isEmpty(itemSpec)) {
            return null;
        }
        try {
            JSONObject obj = JSON.parseObject(itemSpec);
            return obj.getBigDecimal("unitPrice");
        } catch (Exception e) {
            return null;
        }
    }

    public static String normalizeItemSpec(String itemSpec) {
        return itemSpec == null ? "" : itemSpec;
    }

    public static String formatSpecText(String itemSpec) {
        if (StringUtils.isEmpty(itemSpec)) {
            return "";
        }
        try {
            JSONObject obj = JSON.parseObject(itemSpec);
            String sizeName = obj.getString("sizeName");
            String materialName = obj.getString("materialName");
            if (sizeName != null && materialName != null) {
                return sizeName + " / " + materialName;
            }
            return sizeName != null ? sizeName : (materialName != null ? materialName : "");
        } catch (Exception e) {
            return "";
        }
    }

    private static JSONObject findById(JSONArray array, Integer id) {
        if (array == null || id == null) {
            return null;
        }
        for (int i = 0; i < array.size(); i++) {
            JSONObject obj = array.getJSONObject(i);
            if (obj != null && id.equals(obj.getInteger("id"))) {
                return obj;
            }
        }
        return null;
    }
}
