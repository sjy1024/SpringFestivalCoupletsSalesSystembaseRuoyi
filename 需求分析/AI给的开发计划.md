基于您的情况（15天后交付毕设、单人开发、开源AI、基本支付逻辑），我为您制定以下详细计划：

## 15天毕设系统开发计划

### 一、技术选型建议

#### 1. __框架选择：RuoYi框架__（强烈推荐）

__理由__：

- ✅ 功能最完整（用户管理、商品管理、订单管理）
- ✅ 权限系统完善
- ✅ 前后端分离，代码规范
- ✅ 社区活跃，文档齐全
- ✅ 与您的需求匹配度最高

#### 2. __开源AI服务选择__

__推荐方案__：

- __方案A：本地部署开源模型__（推荐）

  - ChatGLM-6B / ChatGLM3-6B（清华开源）
  - 部署在本地，无API调用限制
  - 适合毕设演示

- __方案B：免费API服务__

  - 文心一言免费额度
  - 讯飞星火免费额度
  - 阿里云百炼（有免费额度）

#### 3. __支付逻辑__

- __模拟支付__：前端模拟支付流程，后端记录订单状态
- __微信支付/支付宝沙箱__：如果需要真实支付，可使用沙箱环境

### 二、15天详细开发计划

#### __第1-2天：环境搭建和框架熟悉__

__目标__：搭建开发环境，熟悉RuoYi框架

__任务清单__：

1. ✅ 下载并解压RuoYi框架
2. ✅ 配置开发环境（JDK、Maven、Node.js、MySQL）
3. ✅ 导入数据库，启动项目
4. ✅ 熟悉项目结构和代码规范
5. ✅ 运行示例，理解基础功能

__交付物__：可运行的RuoYi系统

---

#### __第3-4天：数据库设计和改造__

__目标__：设计春联系统的数据库结构

__任务清单__：

1. ✅ 分析现有RuoYi数据库表结构
2. ✅ 设计春联系统数据库ER图
3. ✅ 创建数据表SQL脚本
4. ✅ 导入数据库并测试

__核心表结构__：

```sql
-- 1. 商品主表（改造sys_goods）
ALTER TABLE sys_goods ADD COLUMN type INT DEFAULT 0 COMMENT '商品类型：0-春联，1-其他';

-- 2. 春联子表
CREATE TABLE sys_spring_couplet (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  goods_id BIGINT NOT NULL COMMENT '关联主表ID',
  material VARCHAR(50) COMMENT '材质',
  length DECIMAL(10,2) COMMENT '长度(cm)',
  width DECIMAL(10,2) COMMENT '宽度(cm)',
  paper VARCHAR(50) COMMENT '纸张类型',
  create_time DATETIME COMMENT '创建时间',
  update_time DATETIME COMMENT '更新时间',
  INDEX idx_goods_id (goods_id)
) COMMENT='春联商品子表';

-- 3. 其他商品子表
CREATE TABLE sys_other_goods (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  goods_id BIGINT NOT NULL COMMENT '关联主表ID',
  material VARCHAR(50) COMMENT '材质',
  length DECIMAL(10,2) COMMENT '长度(cm)',
  width DECIMAL(10,2) COMMENT '宽度(cm)',
  paper VARCHAR(50) COMMENT '纸张类型',
  create_time DATETIME COMMENT '创建时间',
  update_time DATETIME COMMENT '更新时间',
  INDEX idx_goods_id (goods_id)
) COMMENT='其他商品子表';

-- 4. 购物车表
CREATE TABLE sys_cart (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL COMMENT '用户ID',
  goods_id BIGINT NOT NULL COMMENT '商品ID',
  quantity INT DEFAULT 1 COMMENT '数量',
  create_time DATETIME COMMENT '创建时间',
  update_time DATETIME COMMENT '更新时间',
  INDEX idx_user_id (user_id),
  INDEX idx_goods_id (goods_id)
) COMMENT='购物车';

-- 5. 订单表（改造sys_order）
ALTER TABLE sys_order ADD COLUMN status INT DEFAULT 0 COMMENT '订单状态：0-待支付，1-已付款，2-已接单，3-处理中，4-已完成';
ALTER TABLE sys_order ADD COLUMN total_amount DECIMAL(10,2) COMMENT '订单总金额';
ALTER TABLE sys_order ADD COLUMN receiver_name VARCHAR(50) COMMENT '收货人';
ALTER TABLE sys_order ADD COLUMN receiver_phone VARCHAR(20) COMMENT '收货电话';
ALTER TABLE sys_order ADD COLUMN receiver_address VARCHAR(200) COMMENT '收货地址';

-- 6. 订单详情表
CREATE TABLE sys_order_item (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_id BIGINT NOT NULL COMMENT '订单ID',
  goods_id BIGINT NOT NULL COMMENT '商品ID',
  quantity INT NOT NULL COMMENT '数量',
  price DECIMAL(10,2) NOT NULL COMMENT '单价',
  total_price DECIMAL(10,2) NOT NULL COMMENT '总价',
  create_time DATETIME COMMENT '创建时间',
  INDEX idx_order_id (order_id),
  INDEX idx_goods_id (goods_id)
) COMMENT='订单详情';

-- 7. 评价表
CREATE TABLE sys_evaluation (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL COMMENT '用户ID',
  goods_id BIGINT NOT NULL COMMENT '商品ID',
  order_id BIGINT COMMENT '订单ID',
  score INT DEFAULT 5 COMMENT '评分(1-5)',
  content TEXT COMMENT '评价内容',
  create_time DATETIME COMMENT '创建时间',
  INDEX idx_user_id (user_id),
  INDEX idx_goods_id (goods_id)
) COMMENT='商品评价';

-- 8. 收藏表
CREATE TABLE sys_favorites (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL COMMENT '用户ID',
  goods_id BIGINT NOT NULL COMMENT '商品ID',
  create_time DATETIME COMMENT '创建时间',
  UNIQUE KEY uk_user_goods (user_id, goods_id)
) COMMENT='商品收藏';

-- 9. 公告表
CREATE TABLE sys_announcement (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL COMMENT '标题',
  content TEXT COMMENT '详情',
  create_time DATETIME COMMENT '发布时间',
  update_time DATETIME COMMENT '更新时间'
) COMMENT='公告';

-- 10. AI对话记录表
CREATE TABLE sys_ai_chat (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL COMMENT '用户ID',
  question TEXT COMMENT '问题',
  answer TEXT COMMENT '回答',
  goods_ids VARCHAR(500) COMMENT '推荐商品ID列表（JSON格式）',
  create_time DATETIME COMMENT '创建时间',
  INDEX idx_user_id (user_id)
) COMMENT='AI对话记录';
```

__交付物__：完整的数据库设计文档和SQL脚本

---

#### __第5-7天：后端核心功能开发__

__目标__：实现商品管理、购物车、订单核心功能

__任务清单__：

1. __商品管理模块__（1.5天）

   - ✅ 商品CRUD接口（改造sys_goods）
   - ✅ 主表+子表关联查询（策略模式）
   - ✅ 商品分类和搜索
   - ✅ 商品上下架管理

   ```java
   // 商品类型枚举
   public enum GoodsType {
       SPRING_COUPLET(0, "春联"),
       OTHER(1, "其他商品");
       
       private final int code;
       private final String desc;
   }

   // 策略接口
   public interface GoodsStrategy {
       Object getSubGoods(Long goodsId);
       void saveSubGoods(Long goodsId, Object subGoods);
   }

   // 商品Service
   @Service
   public class GoodsServiceImpl implements GoodsService {
       
       @Autowired
       private Map<Integer, GoodsStrategy> strategyMap;
       
       @Override
       public GoodsDTO getGoodsDetail(Long goodsId) {
           Goods goods = goodsMapper.selectById(goodsId);
           GoodsDTO dto = new GoodsDTO();
           BeanUtils.copyProperties(goods, dto);
           
           // 根据type获取子表数据
           GoodsStrategy strategy = strategyMap.get(goods.getType());
           if (strategy != null) {
               Object subGoods = strategy.getSubGoods(goodsId);
               dto.setSubGoods(subGoods);
           }
           
           return dto;
       }
   }
   ```

2. __购物车模块__（1天）

   - ✅ 添加商品到购物车
   - ✅ 修改购物车商品数量
   - ✅ 删除购物车商品
   - ✅ 查询购物车列表
   - ✅ 购物车结算（生成订单）

   ```java
   @Service
   public class CartServiceImpl implements CartService {
       
       @Override
       public void addToCart(Long userId, Long goodsId, Integer quantity) {
           // 检查商品是否存在
           Goods goods = goodsMapper.selectById(goodsId);
           if (goods == null || goods.getStatus() != 1) {
               throw new BusinessException("商品不存在或已下架");
           }
           
           // 检查库存
           if (goods.getStock() < quantity) {
               throw new BusinessException("库存不足");
           }
           
           // 查询购物车中是否已有该商品
           Cart cart = cartMapper.selectByUserIdAndGoodsId(userId, goodsId);
           if (cart != null) {
               // 更新数量
               cart.setQuantity(cart.getQuantity() + quantity);
               cart.setUpdateTime(new Date());
               cartMapper.update(cart);
           } else {
               // 新增
               cart = new Cart();
               cart.setUserId(userId);
               cart.setGoodsId(goodsId);
               cart.setQuantity(quantity);
               cart.setCreateTime(new Date());
               cart.setUpdateTime(new Date());
               cartMapper.insert(cart);
           }
       }
       
       @Override
       public List<CartDTO> listCart(Long userId) {
           List<Cart> cartList = cartMapper.selectByUserId(userId);
           return cartList.stream().map(cart -> {
               CartDTO dto = new CartDTO();
               dto.setCartId(cart.getId());
               dto.setGoodsId(cart.getGoodsId());
               dto.setQuantity(cart.getQuantity());
               
               // 查询商品信息
               Goods goods = goodsMapper.selectById(cart.getGoodsId());
               dto.setGoodsName(goods.getName());
               dto.setGoodsPrice(goods.getPrice());
               dto.setGoodsImage(goods.getImage());
               
               return dto;
           }).collect(Collectors.toList());
       }
   }
   ```

3. __订单模块__（1.5天）

   - ✅ 生成订单（从购物车）
   - ✅ 订单状态管理
   - ✅ 订单查询
   - ✅ 模拟支付接口
   - ✅ 订单状态流转

   ```java
   @Service
   @Transactional
   public class OrderServiceImpl implements OrderService {
       
       @Override
       public Long createOrder(Long userId, List<Long> cartIds) {
           // 1. 查询购物车商品
           List<Cart> cartList = cartMapper.selectByIds(cartIds);
           if (cartList.isEmpty()) {
               throw new BusinessException("购物车为空");
           }
           
           // 2. 验证商品和库存
           BigDecimal totalAmount = BigDecimal.ZERO;
           List<OrderItem> orderItems = new ArrayList<>();
           
           for (Cart cart : cartList) {
               Goods goods = goodsMapper.selectById(cart.getGoodsId());
               if (goods == null || goods.getStatus() != 1) {
                   throw new BusinessException("商品不存在或已下架");
               }
               if (goods.getStock() < cart.getQuantity()) {
                   throw new BusinessException("商品库存不足");
               }
               
               // 计算总价
               BigDecimal itemTotal = goods.getPrice().multiply(new BigDecimal(cart.getQuantity()));
               totalAmount = totalAmount.add(itemTotal);
               
               // 准备订单项
               OrderItem item = new OrderItem();
               item.setGoodsId(goods.getId());
               item.setQuantity(cart.getQuantity());
               item.setPrice(goods.getPrice());
               item.setTotalPrice(itemTotal);
               orderItems.add(item);
               
               // 扣减库存
               goods.setStock(goods.getStock() - cart.getQuantity());
               goodsMapper.update(goods);
           }
           
           // 3. 创建订单
           Order order = new Order();
           order.setOrderNo(generateOrderNo());
           order.setUserId(userId);
           order.setTotalAmount(totalAmount);
           order.setStatus(0); // 待支付
           order.setCreateTime(new Date());
           order.setUpdateTime(new Date());
           orderMapper.insert(order);
           
           // 4. 创建订单详情
           for (OrderItem item : orderItems) {
               item.setOrderId(order.getId());
               orderItemMapper.insert(item);
           }
           
           // 5. 删除购物车商品
           cartMapper.deleteBatchIds(cartIds);
           
           return order.getId();
       }
       
       @Override
       public void payOrder(Long orderId) {
           Order order = orderMapper.selectById(orderId);
           if (order == null) {
               throw new BusinessException("订单不存在");
           }
           if (order.getStatus() != 0) {
               throw new BusinessException("订单状态异常");
           }
           
           // 模拟支付成功
           order.setStatus(1); // 已付款
           order.setUpdateTime(new Date());
           orderMapper.update(order);
       }
       
       @Override
       public void updateOrderStatus(Long orderId, Integer status) {
           Order order = orderMapper.selectById(orderId);
           if (order == null) {
               throw new BusinessException("订单不存在");
           }
           
           // 验证状态流转是否合法
           if (!isValidStatusTransition(order.getStatus(), status)) {
               throw new BusinessException("状态流转不合法");
           }
           
           order.setStatus(status);
           order.setUpdateTime(new Date());
           orderMapper.update(order);
       }
       
       private boolean isValidStatusTransition(Integer currentStatus, Integer newStatus) {
           // 0-待支付，1-已付款，2-已接单，3-处理中，4-已完成
           if (currentStatus == 0 && newStatus == 1) return true; // 待支付 -> 已付款
           if (currentStatus == 1 && newStatus == 2) return true; // 已付款 -> 已接单
           if (currentStatus == 2 && newStatus == 3) return true; // 已接单 -> 处理中
           if (currentStatus == 3 && newStatus == 4) return true; // 处理中 -> 已完成
           return false;
       }
   }
   ```

__交付物__：完整的后端API接口

---

#### __第8-9天：前端页面开发__

__目标__：实现用户端和管理员端页面

__任务清单__：

1. __用户端页面__（1天）

   - ✅ 首页（商品列表）
   - ✅ 商品详情页
   - ✅ 购物车页面
   - ✅ 订单列表页
   - ✅ 订单详情页
   - ✅ 个人中心页

2. __管理员端页面__（1天）

   - ✅ 商品管理页面（CRUD）
   - ✅ 订单管理页面（查询、状态更新）
   - ✅ 用户管理页面
   - ✅ 公告管理页面

__技术要点__：

- 使用Vue + Element UI
- 使用axios调用后端API
- 使用Vuex管理状态
- 使用Vue Router管理路由

__交付物__：完整的前端页面

---

#### __第10-11天：AI对话功能开发__

__目标__：实现AI对话和商品推荐

__任务清单__：

1. __AI服务集成__（0.5天）

   - ✅ 选择开源AI模型（推荐ChatGLM-6B）
   - ✅ 部署本地AI服务
   - ✅ 编写AI调用工具类

   ```java
   @Component
   public class AIService {
       
       private static final String AI_API_URL = "http://localhost:8000/api/chat";
       
       public AIResponse chat(String prompt) {
           try {
               // 调用本地AI服务
               RestTemplate restTemplate = new RestTemplate();
               Map<String, String> params = new HashMap<>();
               params.put("prompt", prompt);
               
               AIResponse response = restTemplate.postForObject(AI_API_URL, params, AIResponse.class);
               return response;
           } catch (Exception e) {
               // AI服务异常时，返回固定回复
               return AIResponse.defaultResponse();
           }
       }
   }
   ```

2. __对话接口开发__（0.5天）

   - ✅ AI对话接口
   - ✅ 商品检索接口
   - ✅ 对话记录保存

   ```java
   @RestController
   @RequestMapping("/api/ai")
   public class AIController {
       
       @Autowired
       private AIService aiService;
       
       @Autowired
       private GoodsService goodsService;
       
       @PostMapping("/chat")
       public ResponseEntity<AIChatResponse> chat(@RequestBody AIChatRequest request) {
           // 1. 调用AI服务
           AIResponse aiResponse = aiService.chat(request.getMessage());
           
           // 2. 从AI回复中提取关键词
           List<String> keywords = extractKeywords(aiResponse.getContent());
           
           // 3. 根据关键词检索商品
           List<Goods> recommendedGoods = goodsService.searchByKeywords(keywords, 5);
           
           // 4. 保存对话记录
           AIChatRecord record = new AIChatRecord();
           record.setUserId(request.getUserId());
           record.setQuestion(request.getMessage());
           record.setAnswer(aiResponse.getContent());
           record.setGoodsIds(JSON.toJSONString(recommendedGoods.stream()
               .map(Goods::getId).collect(Collectors.toList())));
           aiChatMapper.insert(record);
           
           // 5. 返回结果
           AIChatResponse response = new AIChatResponse();
           response.setAnswer(aiResponse.getContent());
           response.setRecommendedGoods(recommendedGoods);
           
           return ResponseEntity.ok(response);
       }
       
       private List<String> extractKeywords(String text) {
           // 简单的关键词提取（实际可以使用NLP库）
           List<String> keywords = new ArrayList<>();
           // 提取商品相关关键词
           if (text.contains("春联") || text.contains("对联")) {
               keywords.add("春联");
           }
           if (text.contains("纸") || text.contains("材质")) {
               keywords.add("纸");
           }
           if (text.contains("尺寸") || text.contains("大小")) {
               keywords.add("尺寸");
           }
           return keywords;
       }
   }
   ```

3. __前端AI对话界面__（1天）

   - ✅ 对话聊天界面
   - ✅ 商品推荐展示
   - ✅ 对话历史记录

   ```vue
   <template>
     <div class="ai-chat-page">
       <div class="chat-header">
         <h3>AI对联销售员</h3>
       </div>
       
       <div class="chat-window" ref="chatWindow">
         <div v-for="msg in messages" :key="msg.id" 
              :class="['message', msg.role]">
           <div class="avatar">
             <img :src="msg.role === 'user' ? userAvatar : aiAvatar" />
           </div>
           <div class="content">
             {{ msg.content }}
           </div>
           <!-- 商品推荐 -->
           <div v-if="msg.recommendedGoods && msg.recommendedGoods.length > 0" 
                class="recommended-goods">
             <div v-for="goods in msg.recommendedGoods" :key="goods.id" 
                  class="goods-item" @click="viewGoods(goods.id)">
               <img :src="goods.image" />
               <div class="goods-info">
                 <div class="goods-name">{{ goods.name }}</div>
                 <div class="goods-price">¥{{ goods.price }}</div>
               </div>
             </div>
           </div>
         </div>
       </div>
       
       <div class="input-area">
         <input v-model="inputMessage" 
                @keyup.enter="sendMessage" 
                placeholder="请输入您的问题，如：我想买春联" />
         <button @click="sendMessage" :disabled="loading">
           {{ loading ? '发送中...' : '发送' }}
         </button>
       </div>
     </div>
   </template>

   <script>
   export default {
     data() {
       return {
         messages: [],
         inputMessage: '',
         loading: false,
         userAvatar: '/images/user-avatar.png',
         aiAvatar: '/images/ai-avatar.png'
       };
     },
     
     methods: {
       async sendMessage() {
         if (!this.inputMessage.trim()) return;
         
         this.loading = true;
         
         // 添加用户消息
         this.messages.push({
           id: Date.now(),
           role: 'user',
           content: this.inputMessage
         });
         
         const question = this.inputMessage;
         this.inputMessage = '';
         
         try {
           // 调用AI接口
           const response = await this.$axios.post('/api/ai/chat', {
             userId: this.$store.state.user.id,
             message: question
           });
           
           // 添加AI回复
           this.messages.push({
             id: Date.now() + 1,
             role: 'ai',
             content: response.data.answer,
             recommendedGoods: response.data.recommendedGoods
           });
           
           // 滚动到底部
           this.$nextTick(() => {
             this.$refs.chatWindow.scrollTop = this.$refs.chatWindow.scrollHeight;
           });
         } catch (error) {
           this.$message.error('AI服务异常，请稍后重试');
         } finally {
           this.loading = false;
         }
       },
       
       viewGoods(goodsId) {
         this.$router.push(`/goods/${goodsId}`);
       }
     }
   };
   </script>
   ```

__交付物__：AI对话功能完整实现

---

#### __第12-13天：商品定制功能开发__

__目标__：实现商品定制功能

__任务清单__：

1. __后端定制逻辑__（0.5天）

   - ✅ 定制选项配置接口
   - ✅ 定制商品价格计算
   - ✅ 定制商品生成

   ```java
   @Service
   public class CustomizationServiceImpl implements CustomizationService {
       
       @Override
       public CustomizationDTO calculateCustomization(Long goodsId, Map<String, String> options) {
           Goods goods = goodsMapper.selectById(goodsId);
           BigDecimal basePrice = goods.getPrice();
           BigDecimal customizationPrice = BigDecimal.ZERO;
           
           // 根据定制选项计算价格
           if (options.containsKey("material")) {
               // 材质加价
               String material = options.get("material");
               if ("宣纸".equals(material)) {
                   customizationPrice = customizationPrice.add(new BigDecimal("10.00"));
               } else if ("普通纸".equals(material)) {
                   customizationPrice = customizationPrice.add(new BigDecimal("5.00"));
               }
           }
           
           if (options.containsKey("size")) {
               // 尺寸加价
               String size = options.get("size");
               if ("大号".equals(size)) {
                   customizationPrice = customizationPrice.add(new BigDecimal("15.00"));
               } else if ("中号".equals(size)) {
                   customizationPrice = customizationPrice.add(new BigDecimal("8.00"));
               }
           }
           
           CustomizationDTO dto = new CustomizationDTO();
           dto.setBasePrice(basePrice);
           dto.setCustomizationPrice(customizationPrice);
           dto.setTotalPrice(basePrice.add(customizationPrice));
           dto.setOptions(options);
           
           return dto;
       }
       
       @Override
       public Long createCustomizedGoods(Long userId, Long baseGoodsId, Map<String, String> options) {
           // 1. 计算定制价格
           CustomizationDTO customization = calculateCustomization(baseGoodsId, options);
           
           // 2. 创建定制商品记录
           CustomizedGoods customizedGoods = new CustomizedGoods();
           customizedGoods.setUserId(userId);
           customizedGoods.setBaseGoodsId(baseGoodsId);
           customizedGoods.setOptions(JSON.toJSONString(options));
           customizedGoods.setPrice(customization.getTotalPrice());
           customizedGoods.setCreateTime(new Date());
           customizedGoodsMapper.insert(customizedGoods);
           
           return customizedGoods.getId();
       }
   }
   ```

2. __前端定制界面__（0.5天）

   - ✅ 定制选项选择
   - ✅ 价格实时计算
   - ✅ 定制商品加入购物车

   ```vue
   <template>
     <div class="customization-page">
       <h3>商品定制</h3>
       
       <div class="customization-form">
         <!-- 材质选择 -->
         <div class="form-item">
           <label>材质：</label>
           <el-radio-group v-model="options.material">
             <el-radio label="普通纸">普通纸</el-radio>
             <el-radio label="宣纸">宣纸 (+¥10)</el-radio>
           </el-radio-group>
         </div>
         
         <!-- 尺寸选择 -->
         <div class="form-item">
           <label>尺寸：</label>
           <el-radio-group v-model="options.size">
             <el-radio label="小号">小号</el-radio>
             <el-radio label="中号">中号 (+¥8)</el-radio>
             <el-radio label="大号">大号 (+¥15)</el-radio>
           </el-radio-group>
         </div>
         
         <!-- 纸张选择 -->
         <div class="form-item">
           <label>纸张：</label>
           <el-radio-group v-model="options.paper">
             <el-radio label="普通纸">普通纸</el-radio>
             <el-radio label="洒金纸">洒金纸 (+¥5)</el-radio>
           </el-radio-group>
         </div>
         
         <!-- 价格展示 -->
         <div class="price-info">
           <div>基础价格：¥{{ basePrice }}</div>
           <div>定制费用：¥{{ customizationPrice }}</div>
           <div class="total-price">总计：¥{{ totalPrice }}</div>
         </div>
         
         <!-- 操作按钮 -->
         <div class="actions">
           <el-button type="primary" @click="addToCart">加入购物车</el-button>
           <el-button @click="buyNow">立即购买</el-button>
         </div>
       </div>
     </div>
   </template>

   <script>
   export default {
     props: ['goodsId'],
     
     data() {
       return {
         options: {
           material: '普通纸',
           size: '小号',
           paper: '普通纸'
         },
         basePrice: 0,
         customizationPrice: 0,
         totalPrice: 0
       };
     },
     
     watch: {
       options: {
         handler() {
           this.calculatePrice();
         },
         deep: true
       }
     },
     
     methods: {
       async calculatePrice() {
         try {
           const response = await this.$axios.post('/api/customization/calculate', {
             goodsId: this.goodsId,
             options: this.options
           });
           
           this.basePrice = response.data.basePrice;
           this.customizationPrice = response.data.customizationPrice;
           this.totalPrice = response.data.totalPrice;
         } catch (error) {
           console.error('计算价格失败', error);
         }
       },
       
       async addToCart() {
         try {
           await this.$axios.post('/api/customization/add-to-cart', {
             goodsId: this.goodsId,
             options: this.options,
             price: this.totalPrice
           });
           
           this.$message.success('已加入购物车');
         } catch (error) {
           this.$message.error('加入购物车失败');
         }
       },
       
       async buyNow() {
         try {
           const response = await this.$axios.post('/api/customization/buy-now', {
             goodsId: this.goodsId,
             options: this.options,
             price: this.totalPrice
           });
           
           this.$router.push(`/order/${response.data.orderId}`);
         } catch (error) {
           this.$message.error('购买失败');
         }
       }
     },
     
     mounted() {
       this.calculatePrice();
     }
   };
   </script>
   ```

__交付物__：商品定制功能完整实现

---

#### __第14天：系统集成和测试__

__目标__：整合所有功能，进行全面测试

__任务清单__：

1. __功能测试__（0.5天）

   - ✅ 用户注册登录测试
   - ✅ 商品浏览搜索测试
   - ✅ 购物车功能测试
   - ✅ 订单流程测试
   - ✅ AI对话测试
   - ✅ 商品定制测试
   - ✅ 管理员功能测试

2. __Bug修复__（0.5天）

   - ✅ 修复测试中发现的问题
   - ✅ 优化代码和性能

3. __文档编写__（0.5天）

   - ✅ 系统使用说明
   - ✅ API接口文档
   - ✅ 数据库设计文档
   - ✅ 部署说明

__交付物__：测试报告、文档

---

#### __第15天：部署和演示准备__

__目标__：部署系统，准备演示材料

__任务清单__：

1. __系统部署__（0.5天）

   - ✅ 部署后端Spring Boot应用
   - ✅ 部署前端Vue应用
   - ✅ 配置数据库
   - ✅ 配置AI服务（本地部署ChatGLM-6B）

2. __演示准备__（0.5天）

   - ✅ 准备演示数据
   - ✅ 编写演示脚本
   - ✅ 录制演示视频（可选）
   - ✅ 准备答辩PPT

__部署方案__：

```bash
# 后端部署
cd backend
mvn clean package
java -jar target/springcouplets-1.0.0.jar

# 前端部署
cd frontend
npm run build
# 将dist目录部署到Nginx或Tomcat

# AI服务部署（ChatGLM-6B）
# 下载ChatGLM-6B模型
git clone https://github.com/THUDM/ChatGLM-6B
cd ChatGLM-6B
pip install -r requirements.txt
python web_demo.py --model-path THUDM/chatglm-6b --server-port 8000
```

__交付物__：可运行的完整系统

---

### 三、关键技术实现

#### 1. __主表+子表架构实现__

```java
// 策略模式实现
@Component
public class GoodsStrategyFactory {
    
    @Autowired
    private SpringCoupletStrategy springCoupletStrategy;
    
    @Autowired
    private OtherGoodsStrategy otherGoodsStrategy;
    
    public GoodsStrategy getStrategy(Integer type) {
        if (type == 0) {
            return springCoupletStrategy;
        } else if (type == 1) {
            return otherGoodsStrategy;
        }
        return null;
    }
}

// 使用示例
@Service
public class GoodsServiceImpl implements GoodsService {
    
    @Autowired
    private GoodsStrategyFactory strategyFactory;
    
    @Override
    public GoodsDTO getGoodsDetail(Long goodsId) {
        Goods goods = goodsMapper.selectById(goodsId);
        GoodsDTO dto = new GoodsDTO();
        BeanUtils.copyProperties(goods, dto);
        
        // 根据type获取子表数据
        GoodsStrategy strategy = strategyFactory.getStrategy(goods.getType());
        if (strategy != null) {
            Object subGoods = strategy.getSubGoods(goodsId);
            dto.setSubGoods(subGoods);
        }
        
        return dto;
    }
}
```

#### 2. __订单状态流转实现__

```java
// 状态机模式
public enum OrderStatus {
    PENDING_PAYMENT(0, "待支付"),
    PAID(1, "已付款"),
    RECEIVED(2, "已接单"),
    PROCESSING(3, "处理中"),
    COMPLETED(4, "已完成");
    
    private final int code;
    private final String desc;
}

// 状态流转验证
public class OrderStatusTransition {
    
    private static final Map<Integer, Set<Integer>> TRANSITIONS = new HashMap<>();
    
    static {
        // 定义合法的状态流转
        TRANSITIONS.put(0, Set.of(1)); // 待支付 -> 已付款
        TRANSITIONS.put(1, Set.of(2)); // 已付款 -> 已接单
        TRANSITIONS.put(2, Set.of(3)); // 已接单 -> 处理中
        TRANSITIONS.put(3, Set.of(4)); // 处理中 -> 已完成
    }
    
    public static boolean isValidTransition(Integer current, Integer next) {
        Set<Integer> allowed = TRANSITIONS.get(current);
        return allowed != null && allowed.contains(next);
    }
}
```

#### 3. __AI对话实现（简化版）__

```java
// 如果无法部署本地AI，使用模拟AI回复
@Service
public class MockAIService implements AIService {
    
    private static final Map<String, String> RESPONSE_PATTERNS = new HashMap<>();
    
    static {
        RESPONSE_PATTERNS.put("春联", "我为您推荐几款春联：\n1. 传统春联 - 红色宣纸，金粉印刷\n2. 创意春联 - 个性化定制\n3. 商用春联 - 企业专用");
        RESPONSE_PATTERNS.put("对联", "对联有多种规格：\n1. 普通纸 - 经济实惠\n2. 宣纸 - 高端大气\n3. 洒金纸 - 喜庆吉祥");
        RESPONSE_PATTERNS.put("纸", "我们提供多种纸张：\n普通纸、宣纸、洒金纸，您可以根据需求选择。");
        RESPONSE_PATTERNS.put("尺寸", "尺寸规格：\n小号(30cm)、中号(50cm)、大号(80cm)，支持定制。");
    }
    
    @Override
    public AIResponse chat(String prompt) {
        // 简单的关键词匹配
        for (Map.Entry<String, String> entry : RESPONSE_PATTERNS.entrySet()) {
            if (prompt.contains(entry.getKey())) {
                return AIResponse.success(entry.getValue());
            }
        }
        
        // 默认回复
        return AIResponse.success("您好！我是AI对联销售员，可以为您推荐春联、对联等商品。请问您有什么需求？");
    }
}
```

---

### 四、风险和应对策略

#### 风险1：时间紧张

__应对__：

- 优先实现核心功能（用户、商品、购物车、订单）
- AI功能使用模拟回复，后期再接入真实AI
- 商品定制功能简化实现

#### 风险2：单人开发压力大

__应对__：

- 使用成熟框架，减少重复工作
- 参考现有项目代码结构
- 合理安排时间，避免熬夜

#### 风险3：AI服务不稳定

__应对__：

- 准备备用方案（模拟AI回复）
- 本地部署开源模型（ChatGLM-6B）
- 使用免费API服务

#### 风险4：毕设答辩要求高

__应对__：

- 准备详细的文档
- 录制演示视频
- 准备答辩PPT
- 突出AI和定制功能亮点

---

### 五、每日工作时间安排

假设每天工作8小时：

- __第1-2天__：8小时/天（环境搭建）
- __第3-4天__：8小时/天（数据库设计）
- __第5-7天__：10小时/天（后端开发，适当加班）
- __第8-9天__：10小时/天（前端开发）
- __第10-11天__：10小时/天（AI功能）
- __第12-13天__：8小时/天（定制功能）
- __第14天__：10小时/天（测试和Bug修复）
- __第15天__：8小时/天（部署和演示准备）

__总计__：约120小时（15天 × 8小时）

---

### 六、需要准备的资源

#### 1. __开发环境__

- JDK 1.8+
- Maven 3.6+
- Node.js 14+
- MySQL 5.7+
- IntelliJ IDEA 或 VS Code

#### 2. __AI服务__

- __方案A（推荐）__：本地部署ChatGLM-6B

  - 需要：8GB+内存，GPU（可选）
  - 下载地址：[](https://github.com/THUDM/ChatGLM-6B)<https://github.com/THUDM/ChatGLM-6B>

- __方案B__：使用免费API

  - 文心一言：[](https://cloud.baidu.com/product/wenxinworkshop)<https://cloud.baidu.com/product/wenxinworkshop>
  - 讯飞星火：[](https://www.xfyun.cn/services/spark)<https://www.xfyun.cn/services/spark>

#### 3. __服务器（可选）__

- 如果需要外网访问，可以使用云服务器
- 推荐：阿里云/腾讯云学生机（有优惠）

---

### 七、毕设亮点设计

#### 1. __技术亮点__

- ✅ 主表+子表架构设计（策略模式）
- ✅ AI对话集成（开源AI模型）
- ✅ 商品定制系统（灵活配置）
- ✅ 订单状态机（状态流转验证）

#### 2. __功能亮点__

- ✅ AI智能推荐商品
- ✅ 个性化商品定制
- ✅ 完整的电商流程
- ✅ 管理员后台管理

#### 3. __创新点__

- ✅ AI作为对联销售员（创新性）
- ✅ 春联商品定制（行业特色）
- ✅ 开源AI集成（技术前沿）

---

### 八、总结

__15天完成毕设系统是可行的__，但需要：

1. __严格执行计划__：每天完成既定任务
2. __使用成熟框架__：RuoYi框架可以节省大量时间
3. __合理简化功能__：AI使用模拟回复，定制功能简化实现
4. __适当加班__：关键阶段需要投入更多时间
5. __及时测试__：避免后期大量Bug

__最终交付物__：

- ✅ 完整的春联销售系统
- ✅ 可运行的演示环境
- ✅ 详细的开发文档
- ✅ 答辩PPT和演示视频

__后续升级计划__：

- 接入真实AI服务（ChatGPT、文心一言等）
- 优化AI推荐算法
- 完善商品定制功能
- 增加支付接口（微信支付、支付宝）
- 优化用户体验

这个计划是基于您的实际情况制定的，如果您有任何疑问或需要调整，请随时告诉我！
