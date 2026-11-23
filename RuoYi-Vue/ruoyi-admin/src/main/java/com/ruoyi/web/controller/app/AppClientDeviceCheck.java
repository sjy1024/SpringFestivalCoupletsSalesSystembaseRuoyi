package com.ruoyi.web.controller.app;

import com.ruoyi.common.utils.StringUtils;
import com.ruoyi.system.domain.ClCart;
import com.ruoyi.system.domain.ClOrder;
import com.ruoyi.system.domain.ClUserAddress;

import java.util.Map;

/**
 * 小程序 C 端匿名接口：用 deviceId（及可选请求头 X-Device-ID）做弱身份隔离。
 */
public final class AppClientDeviceCheck {

    private AppClientDeviceCheck() {
    }

    public static String resolveDeviceId(String param, String headerDeviceId) {
        String d = StringUtils.isNotEmpty(param) ? param.trim() : null;
        if (d == null && StringUtils.isNotEmpty(headerDeviceId)) {
            d = headerDeviceId.trim();
        }
        return d;
    }

    public static String deviceIdFromBody(Map<String, Object> data, String headerDeviceId) {
        if (data == null) {
            return resolveDeviceId(null, headerDeviceId);
        }
        Object o = data.get("deviceId");
        String body = o == null ? null : String.valueOf(o).trim();
        if (body.isEmpty()) {
            body = null;
        }
        return resolveDeviceId(body, headerDeviceId);
    }

    public static boolean isBlank(String deviceId) {
        return StringUtils.isEmpty(deviceId);
    }

    public static boolean orderBelongs(ClOrder order, String deviceId) {
        if (order == null || isBlank(deviceId)) {
            return false;
        }
        return deviceId.equals(order.getDeviceId());
    }

    public static boolean cartBelongs(ClCart cart, String deviceId) {
        if (cart == null || isBlank(deviceId)) {
            return false;
        }
        return deviceId.equals(cart.getDeviceId());
    }

    public static boolean addressBelongs(ClUserAddress address, String deviceId) {
        if (address == null || isBlank(deviceId)) {
            return false;
        }
        return deviceId.equals(address.getDeviceId());
    }
}
