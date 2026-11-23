# API对接配置说明

## 一、已完成的工作

### ✅ 1. 统一请求封装
**文件**：`services/_utils/request.js`

**功能**：
- 封装了 `wx.request`，统一处理请求
- 自动处理RuoYi标准响应格式（`{code: 200, data: {...}, msg: "success"}`）
- 自动显示loading和错误提示
- 提供了 `get`、`post`、`put`、`del` 快捷方法

**使用方法**：
```javascript
import { get, post } from '../services/_utils/request';

// GET请求
const goodsList = await get('/api/app/goods/list', { goodsName: '春联' });

// POST请求
const result = await post('/api/app/order/create', { 
  receiverName: '张三',
  receiverPhone: '13800138000'
});
```

### ✅ 2. 设备ID管理
**文件**：`utils/deviceId.js`、`app.js`

**功能**：
- 小程序启动时自动生成唯一设备ID
- 持久化存储到本地
- 所有API请求自动携带 `deviceId` 参数

**设备ID格式**：`device_时间戳_随机字符串`

### ✅ 3. 商品API对接
**文件**：
- `services/good/fetchGoodsList.js` - 商品列表
- `services/good/fetchGood.js` - 商品详情

**已改造**：
- 支持调用 `/api/app/goods/list` 获取商品列表
- 支持调用 `/api/app/goods/{id}` 获取商品详情
- 自动进行数据格式转换（后端字段 → 前端组件需要的字段）

---

## 二、配置说明

### 2.1 后端API地址配置

**文件**：`services/_utils/request.js`

**当前配置**：
```javascript
const BASE_URL = 'http://localhost:8080';
```

**修改方法**：
- **开发环境**：保持 `http://localhost:8080`（需要确保后端服务运行）
- **生产环境**：改为实际服务器地址，如 `https://your-domain.com`

**注意事项**：
- 小程序中不能直接使用 `localhost`，需要使用：
  - 本地开发：使用 `http://192.168.x.x:8080`（你的本机IP）
  - 或者使用内网穿透工具（如ngrok）
  - 生产环境：使用HTTPS域名

### 2.2 Mock数据开关

**文件**：`config/index.js`

**当前配置**：
```javascript
export const config = {
  useMock: true,  // 使用Mock数据
};
```

**切换方法**：
- 改为 `useMock: false` 即可使用真实API
- 或者保持 `true`，在具体service中手动切换

---

## 三、数据格式说明

### 3.1 后端返回格式（RuoYi标准）

```json
{
  "code": 200,
  "data": {
    // 实际数据
  },
  "msg": "操作成功"
}
```

### 3.2 商品数据格式转换

**后端字段** → **前端字段**：
- `goodsId` → `spuId`、`goodsId`
- `goodsName` → `title`
- `coverImage` → `thumb`
- `price` → `price`
- `originalPrice` → `originPrice`
- `description` → `desc`
- `images`（字符串，逗号分隔）→ `images`（数组）

---

## 四、下一步工作

### 📋 待完成的任务

1. **订单API对接**（优先级：高）
   - [ ] `services/order/orderList.js` - 订单列表
   - [ ] `services/order/orderDetail.js` - 订单详情
   - [ ] `services/order/orderCreate.js` - 创建订单（新增）

2. **页面改造**（优先级：高）
   - [ ] `pages/home/home.js` - 首页商品列表
   - [ ] `pages/goods/list/index.js` - 商品列表页
   - [ ] `pages/goods/details/index.js` - 商品详情页

3. **定制订单功能**（优先级：中）
   - [ ] 后端API开发（`AppCustomController`）
   - [ ] 前端页面开发（定制订单创建页、排队信息页）

4. **AI聊天功能**（优先级：中）
   - [ ] 后端API开发（`AppAiController`）
   - [ ] 前端页面开发（AI聊天页）

---

## 五、测试步骤

### 5.1 测试商品列表

1. 修改 `config/index.js`：`useMock: false`
2. 确保后端服务运行在 `http://localhost:8080`
3. 在小程序中打开首页或商品列表页
4. 查看控制台日志，确认请求是否成功

### 5.2 测试商品详情

1. 在商品列表页点击某个商品
2. 查看商品详情页是否正常显示
3. 检查图片、价格、描述等字段是否正确

### 5.3 常见问题

**问题1：网络请求失败**
- 检查后端服务是否运行
- 检查 `BASE_URL` 配置是否正确
- 检查小程序是否配置了合法域名（开发工具中可勾选"不校验合法域名"）

**问题2：数据格式不匹配**
- 检查 `transformGoodsList` 和 `transformGoodsDetail` 函数
- 根据实际后端返回的字段调整转换逻辑

**问题3：设备ID未生成**
- 检查 `app.js` 是否正确导入 `getDeviceId`
- 检查小程序存储权限是否正常

---

## 六、开发建议

1. **先测试基础功能**：确保商品列表和详情能正常显示
2. **逐步对接**：完成一个功能测试一个，不要一次性改太多
3. **保留Mock数据**：在开发过程中可以随时切换回Mock数据，方便调试
4. **注意数据格式**：后端返回的字段可能与模版不同，需要仔细检查

