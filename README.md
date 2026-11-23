# 春联定制与售卖小程序（SpringCouplet Mall）

一个「线上售卖 + 春联定制 + AI 辅助」一体化的前后端分离商城项目：微信小程序面向消费者，RuoYi 管理后台面向商家，Spring Boot 后端统一提供 REST API，并可接入大模型实现 AI 对话与春联生成。

> 毕业设计课题：《基于 Spring Boot 和 uni-app 的春联定制与售卖小程序的设计与实现》。
> 说明：用户端实际采用 **原生微信小程序（WXML/WXSS）+ TDesign 组件库** 实现，目录沿用 `cl-uniapp` 名称。

## 功能特性

### 小程序端（C 端）

| 模块 | 功能 |
| --- | --- |
| 商品 | 商品列表 / 搜索、商品详情、规格选择、直购或加入购物车 |
| 购物车 | 增删改查、多选批量结算 |
| 订单 | 单商品 / 多商品下单、模拟支付、订单列表与详情、确认收货、申请取消 |
| 收货地址 | 地址增删改查、默认地址 |
| 春联定制 | 选择类型 / 尺寸 / 联纸，填写上联、下联、横批，服务端实时报价，提交后返回排队号与预计完成时间 |
| AI 助手 | AI 对话咨询、按主题一键生成春联、经典推荐、一键「填入定制」、历史会话 |
| 免登录 | 以 `deviceId` 标识终端（`X-Device-ID` 请求头），无需注册即可使用 |

### 管理后台（B 端）

| 模块 | 功能 |
| --- | --- |
| 系统管理 | 用户 / 角色 / 菜单 / 字典 / 日志等（RuoYi 自带） |
| 商品管理 | 商品增删改查、上下架、规格维护 |
| 订单管理 | 订单查询、取消审核、状态流转 |
| 定制管理 | 定制单查询、制作进度（待接单 / 制作中 / 已完成） |
| 数据看板 | 订单与库存统计（ECharts） |
| 智能助手 | SSE 流式对话，自动注入订单 / 库存摘要作为上下文，会话落库 |

## 技术栈

| 层 | 技术 |
| --- | --- |
| 后端 | Java 8 · Spring Boot 2.5.15 · Spring Security + JWT · MyBatis · PageHelper · Druid · Redis · Quartz（RuoYi-Vue 3.9.1） |
| 管理端 | Vue 2 · Element UI · Vue CLI · Axios · ECharts |
| 小程序 | 原生微信小程序 · TDesign 小程序组件库 · ES6 |
| 数据库 | MySQL（库名 `ry`）+ Redis |
| AI | OpenAI 兼容接口（默认 DeepSeek `deepseek-chat`），支持切换本地 Ollama；服务不可用时自动降级为关键词 / 本地模板模式 |

## 系统架构

```
┌─────────────────┐     REST API      ┌──────────────────────┐
│  微信小程序      │ ◄───────────────► │  Spring Boot 后端     │
│  (原生 + TDesign)│   /api/app/* 等    │  (RuoYi + MyBatis)   │
└─────────────────┘    deviceId 匿名   └──────────┬───────────┘
┌─────────────────┐                            │
│  Vue2 管理后台   │ ◄───── JWT 鉴权 ────────────┤
│  (Element UI)   │                            ▼
└─────────────────┘              ┌──────────────────────────┐
                                 │  MySQL + Redis           │
                                 └────────────┬─────────────┘
                                              ▼
                                 ┌──────────────────────────┐
                                 │  大模型推理服务            │
                                 │  OpenAI 兼容 / Ollama     │
                                 └──────────────────────────┘
```

## 目录结构

```
Demo/
├── RuoYi-Vue/          # 后端主工程（Maven 多模块 + ruoyi-ui 管理端，独立 Git 仓库）
│   ├── ruoyi-admin/    #   启动入口 & 控制器（含 app 包小程序接口 /api/app/*、/api/custom/*、/api/ai/*）
│   ├── ruoyi-framework #   安全、数据源等框架装配
│   ├── ruoyi-system/   #   系统管理 + 春联业务（domain/mapper/service）
│   ├── ruoyi-common/   #   公共工具
│   ├── ruoyi-quartz/   #   定时任务
│   ├── ruoyi-generator #   代码生成
│   ├── ruoyi-ui/       #   Vue2 管理后台
│   └── sql/            #   数据库脚本（见下方「初始化数据库」）
├── cl-uniapp/          # 微信小程序端（原生小程序工程，TDesign）
├── 2026/               # 毕设文档：需求分析、概要设计、详细设计、系统实现（含 PlantUML/Mermaid 图源）
├── 需求分析/            # 早期需求与论文材料
├── 项目/               # 设计说明书 PDF、答辩 PPT 素材
├── avatar/ upload/     # 运行期图片与上传文件存储目录
├── tools/              # plantuml.jar 等工具
└── diagram_out/        # 图表输出
```

更详细的模块说明见 [项目/项目结构与文件夹说明.md](项目/项目结构与文件夹说明.md)。

## 快速开始

### 环境要求

- JDK 8（RuoYi 3.9.1 官方推荐；更高版本未做完整验证）
- Maven 3.x
- MySQL 5.7+ / 8.0
- Redis（登录会话缓存依赖）
- Node.js 14～18（管理端构建，版本过高可能安装失败）
- 微信开发者工具（导入小程序）

### 1. 初始化数据库

创建数据库 `ry`（字符集 `utf8mb4`），按顺序导入 `RuoYi-Vue/sql/` 下脚本：

```sql
CREATE DATABASE ry DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
```

1. `ry_20250522.sql` — RuoYi 系统表 + 菜单 + 管理员账号
2. `quartz.sql` — 定时任务表
3. `all_in_one_merged.sql` — 春联业务表（⚠️ 含 `DROP TABLE` 与演示数据）
4. `cart_order_item_spec.sql`、`goods_spec_options.sql`（或 `spec_feature_standalone.sql`）— 购物车 / 订单明细规格字段与商品规格
5. `cl_mall_menu_restore.sql` — 商城管理端菜单
6. `assistant_permissions.sql` — 智能助手权限（按需）

### 2. 启动后端

1. 修改 `ruoyi-admin/src/main/resources/application-druid.yml` 中的 MySQL 账号密码
2. 按需修改 `application.yml` 中的 Redis 地址与 `token` 密钥
3. 复制 `ruoyi-admin/src/main/resources/application-local-example.yml` 为同目录下的 `application-local.yml`，填入自己的大模型配置（支持 DeepSeek 云端、LM Studio、本地 Ollama 三种接法，字段说明见示例文件注释；不配置时小程序端自动降级为关键词模式）
4. 启动：

```bash
# 方式一：脚本
./ry.bat          # Windows
./ry.sh           # Linux / macOS

# 方式二：IDE 直接运行 RuoYiApplication，或
mvn -pl ruoyi-admin spring-boot:run
```

后端默认监听 `http://localhost:8080`。

### 3. 启动管理后台

```bash
cd RuoYi-Vue/ruoyi-ui
npm install
npm run dev
```

访问 `http://localhost`（默认 80 端口），默认账号 `admin / admin123`（以数据库实际数据为准）。

### 4. 运行小程序

1. 微信开发者工具导入 `cl-uniapp/` 目录
2. 确认 `config/env.config.js` 中开发环境 `baseURL`（默认 `http://127.0.0.1:8080`；真机调试请改为本机局域网 IP）
3. 开发者工具「详情 → 本地设置」勾选**不校验合法域名**（本地 HTTP 调试需要）
4. 若组件缺失，在开发者工具中执行「工具 → 构建 npm」
5. 首页若出现商品，注意区分真实接口数据与降级 mock 数据（`fallbackToMock` 开启时后端不可达会显示演示数据）

## 已知限制与说明

本项目为**教学 / 毕业设计演示系统**，与生产环境存在差距，使用与二次开发前请知悉：

- **支付为模拟支付**：订单调用 `/api/app/order/mockPay` 直接将「待支付」置为「已支付」，未接入微信支付；取消订单不回补库存，无退款链路。
- **匿名访问**：小程序接口以 `deviceId` 标识用户，未接入微信登录；订单接口存在按收货手机号查询等弱校验路径，公开部署前须加固。
- **并发安全**：库存采用「先查后改」的覆盖更新，未加锁，高并发下可能超卖。
- **AI 降级**：大模型服务不可用时自动回退关键词 / 本地模板模式，功能不中断但回复质量下降。
- **敏感配置**：`application-local.yml`（含模型 API Key）已被 `.gitignore` 排除，仓库中只提供 `application-local-example.yml` 模板；`application-druid.yml` 中的数据库密码与 `application.yml` 中的 JWT 密钥仍为明文，公开仓库前请自行替换或改为环境变量注入。

## 致谢

- [RuoYi-Vue](https://gitee.com/y_project/RuoYi-Vue)（MIT License）— 后端与管理端基座
- [TDesign 微信小程序组件库](https://tdesign.tencent.com/miniprogram) 及[零售行业模板](https://github.com/Tencent/tdesign-miniprogram-starter-retail)（MIT License）— 小程序端 UI 与页面参考

## License

基于 RuoYi-Vue 的 MIT License 开源，详见 [RuoYi-Vue/LICENSE](RuoYi-Vue/LICENSE)。
