package com.ruoyi.common.utils;

/**
 * 类型安全转换工具类
 * 用于安全地将Object转换为基本类型，避免ClassCastException
 * 
 * @author ruoyi
 */
public class TypeSafeConverter {
    
    /**
     * 安全地将Object转换为Integer
     * @param obj 待转换对象
     * @param defaultValue 默认值（转换失败时返回）
     * @return Integer值
     */
    public static Integer toInteger(Object obj, Integer defaultValue) {
        if (obj == null) {
            return defaultValue;
        }
        
        if (obj instanceof Integer) {
            return (Integer) obj;
        } else if (obj instanceof Double) {
            return ((Double) obj).intValue();
        } else if (obj instanceof Float) {
            return ((Float) obj).intValue();
        } else if (obj instanceof Long) {
            return ((Long) obj).intValue();
        } else if (obj instanceof String) {
            try {
                return Integer.parseInt((String) obj);
            } catch (NumberFormatException e) {
                return defaultValue;
            }
        }
        
        return defaultValue;
    }
    
    /**
     * 安全地将Object转换为Double
     * @param obj 待转换对象
     * @param defaultValue 默认值（转换失败时返回）
     * @return Double值
     */
    public static Double toDouble(Object obj, Double defaultValue) {
        if (obj == null) {
            return defaultValue;
        }
        
        if (obj instanceof Double) {
            return (Double) obj;
        } else if (obj instanceof Integer) {
            return ((Integer) obj).doubleValue();
        } else if (obj instanceof Float) {
            return ((Float) obj).doubleValue();
        } else if (obj instanceof Long) {
            return ((Long) obj).doubleValue();
        } else if (obj instanceof String) {
            try {
                return Double.parseDouble((String) obj);
            } catch (NumberFormatException e) {
                return defaultValue;
            }
        }
        
        return defaultValue;
    }
    
    /**
     * 安全地将Object转换为Long
     * @param obj 待转换对象
     * @param defaultValue 默认值（转换失败时返回）
     * @return Long值
     */
    public static Long toLong(Object obj, Long defaultValue) {
        if (obj == null) {
            return defaultValue;
        }
        
        if (obj instanceof Long) {
            return (Long) obj;
        } else if (obj instanceof Integer) {
            return ((Integer) obj).longValue();
        } else if (obj instanceof Double) {
            return ((Double) obj).longValue();
        } else if (obj instanceof Float) {
            return ((Float) obj).longValue();
        } else if (obj instanceof String) {
            try {
                return Long.parseLong((String) obj);
            } catch (NumberFormatException e) {
                return defaultValue;
            }
        }
        
        return defaultValue;
    }
}
