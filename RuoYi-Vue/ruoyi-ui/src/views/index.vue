<template>
  <div class="app-container home">
    <el-row :gutter="20">
      <el-col :sm="24" :lg="12" style="padding-left: 20px">
        <h2>春联商城</h2>
        <p>
          欢迎来到春联商城！这是一个专业的春联销售平台，提供各种精美的春联、福字、对联等新年装饰品。我们致力于为广大用户提供高质量的春联产品和优质的购物体验。
        </p>
        <p>
          <b>平台特色:</b> 精选春联、快速配送、优质服务
        </p>
        <p>
          <el-tag type="danger">&yen;品质保证</el-tag>
        </p>
        <p>
          <el-button
            type="primary"
            size="mini"
            icon="el-icon-shopping-cart-1"
            plain
            @click="$router.push('/system/order')"
            >查看订单</el-button
          >
          <el-button
            size="mini"
            icon="el-icon-goods"
            plain
            @click="$router.push('/system/goods')"
            >浏览商品</el-button
          >
        </p>
      </el-col>

      <el-col :sm="24" :lg="12" style="padding-left: 50px">
        <el-row>
          <el-col :span="12">
            <h2>平台功能</h2>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="6">
            <h4>商品管理</h4>
            <ul>
              <li>春联分类</li>
              <li>商品展示</li>
              <li>库存管理</li>
              <li>价格设置</li>
              <li>促销活动</li>
              <li>...</li>
            </ul>
          </el-col>
          <el-col :span="6">
            <h4>订单管理</h4>
            <ul>
              <li>订单查询</li>
              <li>订单跟踪</li>
              <li>支付管理</li>
              <li>发货管理</li>
              <li>售后服务</li>
              <li>...</li>
            </ul>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
    <el-divider />
    <el-row :gutter="20">
      <el-col :xs="24" :sm="24" :md="12" :lg="8">
        <el-card class="update-log">
          <div slot="header" class="clearfix">
            <span>平台信息</span>
          </div>
          <div class="body">
            <p>
              <i class="el-icon-s-promotion"></i> 平台名称：<span>春联商城</span>
            </p>
            <p>
              <i class="el-icon-user-solid"></i> 联系方式：<span>13650638839</span>
            </p>
            <p>
              <i class="el-icon-chat-dot-round"></i> 客服邮箱：<span>2778828799@qq.com</span>
            </p>
            <p>
              <i class="el-icon-money"></i> 营业时间：<span>9:00-18:00</span>
            </p>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12" :lg="8">
        <el-card class="update-log">
          <div slot="header" class="clearfix">
            <span>快速导航</span>
          </div>
          <div class="body">
            <p><router-link to="/index">首页</router-link></p>
            <p><router-link to="/user/profile">个人中心</router-link></p>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name: "Index",
  data() {
    return {
      // 版本号
      version: "3.9.1"
    }
  }
}
</script>

<style scoped lang="scss">
.home {
  blockquote {
    padding: 10px 20px;
    margin: 0 0 20px;
    font-size: 17.5px;
    border-left: 5px solid #eee;
  }
  hr {
    margin-top: 20px;
    margin-bottom: 20px;
    border: 0;
    border-top: 1px solid #eee;
  }
  .col-item {
    margin-bottom: 20px;
  }

  ul {
    padding: 0;
    margin: 0;
  }

  font-family: "open sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 13px;
  color: #676a6c;
  overflow-x: hidden;

  ul {
    list-style-type: none;
  }

  h4 {
    margin-top: 0px;
  }

  h2 {
    margin-top: 10px;
    font-size: 26px;
    font-weight: 100;
  }

  p {
    margin-top: 10px;

    b {
      font-weight: 700;
    }
  }

  .update-log {
    ol {
      display: block;
      list-style-type: decimal;
      margin-block-start: 1em;
      margin-block-end: 1em;
      margin-inline-start: 0;
      margin-inline-end: 0;
      padding-inline-start: 40px;
    }
  }
}
</style>

