# 小程序定制功能 Bug 修复和优化方案

## 发现的问题

### 1. 数据类型转换问题 ⚠️
**位置**: `calculatePrice` 方法
**问题**: 使用了自定义的 `TypeSafeConverter`，但可能存在空指针或类型转换异常
**影响**: 价格计算可能失败

### 2. 缺少用户ID关联 ❌
**位置**: `submitCustomPlan` 和 `saveCustomPlan` 方法
**问题**: 没有设置 `userId`，无法追踪是哪个用户的定制订单
**影响**: 无法查询用户的定制历史

### 3. 排队号生成可能并发问题 ⚠️
**位置**: `submitCustomPlan` 方法中的 `generateQueueNo`
**问题**: 如果并发提交，可能产生重复排队号
**影响**: 排队系统混乱

### 4. 缺少订单状态验证 ❌
**位置**: `submitCustomPlan` 方法
**问题**: 没有验证关联的订单是否存在且状态正确
**影响**: 可能关联到不存在或已取消的订单

### 5. 价格计算逻辑不完整 ⚠️
**位置**: `calculatePrice` 方法
**问题**: 
- 没有考虑数量
- 没有考虑定制类型的价格差异
- 联纸价格逻辑不清晰
**影响**: 价格计算不准确

### 6. 缺少数据库事务 ❌
**位置**: `saveCustomPlan` 方法
**问题**: 没有 `@Transactional` 注解
**影响**: 数据不一致风险

### 7. 错误处理不完善 ⚠️
**问题**: 异常信息直接返回给前端，可能泄露敏感信息
**影响**: 安全风险

### 8. 缺少参数校验 ❌
**问题**: 
- 没有校验 `type`, `size`, `paper` 等参数的有效性
- 没有校验价格是否被篡改
**影响**: 数据安全问题

### 9. 排队位置计算错误 ⚠️
**位置**: `submitCustomPlan` 方法
```java
customOrder.setQueuePosition(queueNo - 1);
```
**问题**: 应该查询当前状态为"待接单"的订单数量
**影响**: 排队位置不准确

### 10. 缺少定制内容解析 ❌
**问题**: 保存的是纯文本，前端需要重新解析
**影响**: 数据结构不合理

## 修复方案

### 修复1: 改进数据类型转换
```java
// 使用更安全的转换方式
Integer sizeId = null;
try {
    Object sizeObj = data.get("size");
    if (sizeObj != null) {
        if (sizeObj instanceof Integer) {
            sizeId = (Integer) sizeObj;
        } else {
            sizeId = Integer.parseInt(sizeObj.toString());
        }
    }
} catch (NumberFormatException e) {
    return error("尺寸参数格式错误");
}

if (sizeId == null) {
    return error("请选择尺寸");
}
```

### 修复2: 添加用户ID关联
```java
// 在 submitCustomPlan 和 saveCustomPlan 中添加
Long userId = null;
try {
    userId = SecurityUtils.getUserId();
} catch (Exception e) {
    return error("请先登录");
}
customOrder.setUserId(userId);
```

### 修复3: 优化排队号生成
在 Service 层使用数据库锁：
```java
// IClCustomOrderService.java
@Transactional(isolation = Isolation.SERIALIZABLE)
Long generateQueueNo(String status);
```

### 修复4: 添加订单验证
```java
if (data.get("orderId") != null) {
    Long orderId = Long.parseLong(data.get("orderId").toString());
    ClOrder order = orderService.selectClOrderByOrderId(orderId);
    
    if (order == null) {
        return error("关联的订单不存在");
    }
    if (!"1".equals(order.getStatus())) {
        return error("订单状态不正确，无法提交定制");
    }
    
    customOrder.setOrderId(orderId);
}
```

### 修复5: 完善价格计算
```java
@PostMapping("/calculate-price")
public AjaxResult calculatePrice(@RequestBody Map<String, Object> data) {
    try {
        // 1. 参数验证
        Integer typeId = parseInteger(data.get("type"), "定制类型");
        Integer sizeId = parseInteger(data.get("size"), "尺寸");
        Integer paperId = parseInteger(data.get("paper"), "联纸");
        Integer quantity = parseInteger(data.get("quantity"), "数量", 1);
        
        // 2. 基础价格（根据类型）
        double basePrice = getBasePriceByType(typeId);
        
        // 3. 尺寸加价
        double sizePrice = getSizePriceAdjustment(sizeId);
        
        // 4. 联纸加价
        double paperPrice = getPaperPriceAdjustment(paperId);
        
        // 5. 计算总价
        double unitPrice = basePrice + sizePrice + paperPrice;
        double totalPrice = unitPrice * quantity;
        
        Map<String, Object> result = new HashMap<>();
        result.put("unitPrice", unitPrice);
        result.put("totalPrice", totalPrice);
        result.put("quantity", quantity);
        result.put("currency", "¥");
        
        return success(result);
    } catch (IllegalArgumentException e) {
        return error(e.getMessage());
    } catch (Exception e) {
        logger.error("计算定制价格异常", e);
        return error("计算价格失败，请重试");
    }
}

// 辅助方法
private Integer parseInteger(Object value, String fieldName) {
    return parseInteger(value, fieldName, null);
}

private Integer parseInteger(Object value, String fieldName, Integer defaultValue) {
    if (value == null) {
        if (defaultValue != null) {
            return defaultValue;
        }
        throw new IllegalArgumentException(fieldName + "不能为空");
    }
    
    try {
        if (value instanceof Integer) {
            return (Integer) value;
        }
        return Integer.parseInt(value.toString());
    } catch (NumberFormatException e) {
        throw new IllegalArgumentException(fieldName + "格式错误");
    }
}
```

### 修复6: 添加事务注解
```java
@Transactional(rollbackFor = Exception.class)
@PostMapping("/save")
public AjaxResult saveCustomPlan(@RequestBody Map<String, Object> data) {
    // ... 方法体
}
```

### 修复7: 改进错误处理
```java
} catch (IllegalArgumentException e) {
    // 业务异常，可以返回给前端
    return error(e.getMessage());
} catch (Exception e) {
    // 系统异常，记录日志但不暴露细节
    logger.error("提交定制方案异常", e);
    return error("系统繁忙，请稍后重试");
}
```

### 修复8: 添加价格校验
```java
// 重新计算价格并验证
Map<String, Object> priceData = new HashMap<>();
priceData.put("type", data.get("type"));
priceData.put("size", data.get("size"));
priceData.put("paper", data.get("paper"));
priceData.put("quantity", data.get("quantity"));

AjaxResult priceResult = calculatePrice(priceData);
if (priceResult.get("code").equals(500)) {
    return error("价格计算失败");
}

Map<String, Object> calculatedPrice = (Map<String, Object>) priceResult.get("data");
Double expectedPrice = (Double) calculatedPrice.get("totalPrice");
Double submittedPrice = Double.parseDouble(data.get("price").toString());

if (Math.abs(expectedPrice - submittedPrice) > 0.01) {
    return error("价格已变动，请重新计算");
}
```

### 修复9: 正确计算排队位置
```java
// 查询当前待接单的订单数量
ClCustomOrder query = new ClCustomOrder();
query.setStatus("0");
List<ClCustomOrder> waitingOrders = clCustomOrderService.selectClCustomOrderList(query);
Long queuePosition = (long) waitingOrders.size();

customOrder.setQueuePosition(queuePosition);
```

### 修复10: 优化数据结构
```java
// 使用JSON存储定制内容
Map<String, String> content = new HashMap<>();
content.put("shanglian", shanglian);
content.put("xialian", xialian);
content.put("hengpi", hengpi);
customOrder.setCustomContent(JSON.toJSONString(content));
```

## 完整的优化后代码

我将创建一个优化后的Controller文件...
