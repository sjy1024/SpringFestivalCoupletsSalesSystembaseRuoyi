package com.ruoyi.system.utils;

/**
 * 订单号生成工具类
 * 
 * @author ruoyi
 * @date 2026-02-05
 */
public class OrderNoGenerator {
    
    /**
     * 生成订单号
     * 格式：大写字母 + 三位数字（001-999）
     * 
     * @param maxOrderNo 当前最大订单号
     * @return 新的订单号
     */
    public static String generateOrderNo(String maxOrderNo) {
        if (maxOrderNo == null || maxOrderNo.isEmpty()) {
            // 如果没有订单，从 A001 开始
            return "A001";
        }
        
        // 解析当前最大订单号
        if (maxOrderNo.length() < 4) {
            // 如果格式不正确，从 A001 开始
            return "A001";
        }
        
        char letter = maxOrderNo.charAt(0);
        String numberPart = maxOrderNo.substring(1);
        
        try {
            int number = Integer.parseInt(numberPart);
            
            // 如果数字部分小于999，直接加1
            if (number < 999) {
                return letter + String.format("%03d", number + 1);
            } else {
                // 如果数字部分已经是999，字母进位
                if (letter < 'Z') {
                    return (char)(letter + 1) + "001";
                } else {
                    // 如果已经到了Z999，重新从A001开始（理论上不会发生）
                    return "A001";
                }
            }
        } catch (NumberFormatException e) {
            // 如果解析失败，从 A001 开始
            return "A001";
        }
    }
    
    /**
     * 验证订单号格式是否正确
     * 
     * @param orderNo 订单号
     * @return 是否正确
     */
    public static boolean isValidOrderNo(String orderNo) {
        if (orderNo == null || orderNo.length() != 4) {
            return false;
        }
        
        char letter = orderNo.charAt(0);
        String numberPart = orderNo.substring(1);
        
        // 检查字母是否为大写A-Z
        if (letter < 'A' || letter > 'Z') {
            return false;
        }
        
        // 检查数字部分是否为001-999
        try {
            int number = Integer.parseInt(numberPart);
            return number >= 1 && number <= 999;
        } catch (NumberFormatException e) {
            return false;
        }
    }
}