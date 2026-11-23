<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="订单号" prop="orderNo">
        <el-input
          v-model="queryParams.orderNo"
          placeholder="请输入订单号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="订单类型" prop="orderType">
        <el-select v-model="queryParams.orderType" placeholder="请选择订单类型" clearable>
          <el-option
            v-for="dict in dict.type.cl_order_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="订单状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择订单状态" clearable>
          <el-option
            v-for="dict in dict.type.cl_order_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="收货人" prop="receiverName">
        <el-input
          v-model="queryParams.receiverName"
          placeholder="请输入收货人"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="收货地址" prop="receiverAddress">
        <el-input
          v-model="queryParams.receiverAddress"
          placeholder="请输入收货地址"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="收货电话" prop="receiverPhone">
        <el-input
          v-model="queryParams.receiverPhone"
          placeholder="请输入收货电话"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['system:order:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:order:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:order:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:order:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="orderList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
<!--      <el-table-column label="订单ID" align="center" prop="orderId" />-->
      <el-table-column label="订单号" align="center" prop="orderNo" />
      <el-table-column label="订单类型" align="center" prop="orderType">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.cl_order_type" :value="scope.row.orderType"/>
        </template>
      </el-table-column>
      <el-table-column label="总价" align="center" prop="totalAmount" />
      <el-table-column label="订单状态" align="center" prop="status">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.cl_order_status" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="取消审核" align="center" prop="cancelStatus" width="110">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.cancelStatus === '1'" type="warning" size="mini">待审核</el-tag>
          <el-tag v-else-if="scope.row.cancelStatus === '2'" type="success" size="mini">已同意</el-tag>
          <el-tag v-else-if="scope.row.cancelStatus === '3'" type="info" size="mini">已拒绝</el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="收货人" align="center" prop="receiverName" />
      <el-table-column label="收货地址" align="center" prop="receiverAddress" />
      <el-table-column label="收货电话" align="center" prop="receiverPhone" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="280">
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.cancelStatus === '1'"
            size="mini"
            type="text"
            icon="el-icon-check"
            @click="handleApproveCancel(scope.row)"
            v-hasPermi="['system:order:edit']"
          >同意取消</el-button>
          <el-button
            v-if="scope.row.cancelStatus === '1'"
            size="mini"
            type="text"
            icon="el-icon-close"
            @click="handleRejectCancel(scope.row)"
            v-hasPermi="['system:order:edit']"
          >拒绝</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-view"
            @click="handleDetail(scope.row)"
            v-hasPermi="['system:order:query']"
          >详情</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:order:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:order:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改订单对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="订单号" prop="orderNo">
          <el-input v-model="form.orderNo" placeholder="请输入订单号" />
        </el-form-item>
        <el-form-item label="订单类型" prop="orderType">
          <el-select v-model="form.orderType" placeholder="请选择订单类型">
            <el-option
              v-for="dict in dict.type.cl_order_type"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="总价" prop="totalAmount">
          <el-input v-model="form.totalAmount" placeholder="请输入总价" />
        </el-form-item>
        <el-form-item label="订单状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择订单状态">
            <el-option
              v-for="dict in dict.type.cl_order_status"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="收货人" prop="receiverName">
          <el-input v-model="form.receiverName" placeholder="请输入收货人" />
        </el-form-item>
        <el-form-item label="收货电话" prop="receiverPhone">
          <el-input v-model="form.receiverPhone" placeholder="请输入收货电话" />
        </el-form-item>
        <el-form-item label="收货地址" prop="receiverAddress">
          <el-input v-model="form.receiverAddress" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 订单详情对话框 -->
    <el-dialog title="订单详情" :visible.sync="detailOpen" width="800px" append-to-body>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="订单号">{{ detailData.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="订单类型">
          <dict-tag :options="dict.type.cl_order_type" :value="detailData.orderType"/>
        </el-descriptions-item>
        <el-descriptions-item label="订单状态">
          <dict-tag :options="dict.type.cl_order_status" :value="detailData.status"/>
        </el-descriptions-item>
        <el-descriptions-item label="订单总额">
          <span style="color: #f56c6c; font-weight: bold;">¥{{ detailData.totalAmount }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="收货人">{{ detailData.receiverName }}</el-descriptions-item>
        <el-descriptions-item label="收货电话">{{ detailData.receiverPhone }}</el-descriptions-item>
        <el-descriptions-item label="收货地址" :span="2">{{ detailData.receiverAddress }}</el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="2">{{ detailData.createTime }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ detailData.remark || '无' }}</el-descriptions-item>
      </el-descriptions>

      <!-- 定制对联内容 -->
      <template v-if="detailData.orderType === '1' || (detailData.customOrders && detailData.customOrders.length)">
        <el-divider content-position="left">定制对联内容</el-divider>
        <div v-if="!detailData.customOrders || !detailData.customOrders.length" class="custom-empty">
          暂无定制内容记录
        </div>
        <div
          v-for="(item, index) in detailData.customOrders"
          :key="item.customId || index"
          class="custom-order-block"
        >
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="定制状态">{{ formatCustomStatus(item.status) }}</el-descriptions-item>
            <el-descriptions-item label="排队号">{{ item.queueNo != null ? item.queueNo : '-' }}</el-descriptions-item>
            <el-descriptions-item label="预计完成">{{ item.estimatedTime != null ? item.estimatedTime + ' 分钟' : '-' }}</el-descriptions-item>
            <el-descriptions-item label="提交时间">{{ item.createTime || '-' }}</el-descriptions-item>
            <el-descriptions-item label="对联内容" :span="2">
              <pre class="couplet-content">{{ formatCustomContent(item.customContent) }}</pre>
            </el-descriptions-item>
            <el-descriptions-item label="定制规格" :span="2">
              {{ formatCustomSpec(item.customSpec) }}
            </el-descriptions-item>
            <el-descriptions-item v-if="item.remark" label="定制备注" :span="2">{{ item.remark }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </template>

      <!-- 订单明细 -->
      <el-divider content-position="left">订单明细</el-divider>
      <el-table :data="detailData.orderItems" border style="width: 100%">
        <el-table-column prop="goodsName" label="商品名称" />
        <el-table-column prop="goodsPrice" label="单价" width="100">
          <template slot-scope="scope">
            ¥{{ scope.row.goodsPrice }}
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="数量" width="80" align="center" />
        <el-table-column prop="totalPrice" label="小计" width="120">
          <template slot-scope="scope">
            <span style="color: #f56c6c; font-weight: bold;">¥{{ scope.row.totalPrice }}</span>
          </template>
        </el-table-column>
      </el-table>

      <div slot="footer" class="dialog-footer">
        <el-button @click="detailOpen = false">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listOrder, getOrder, delOrder, addOrder, updateOrder, reviewOrderCancel } from "@/api/system/order"

export default {
  name: "Order",
  dicts: ['cl_order_status', 'cl_order_type'],
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组（主键，供删除/修改接口使用）
      ids: [],
      selectedOrderNos: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 订单表格数据
      orderList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 是否显示详情对话框
      detailOpen: false,
      // 详情数据
      detailData: {
        orderItems: [],
        customOrders: []
      },
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        orderNo: null,
        orderType: null,
        status: null,
        receiverName: null,
        receiverPhone: null,
        receiverAddress: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        orderNo: [
          { required: true, message: "订单号不能为空", trigger: "blur" }
        ],
        orderType: [
          { required: true, message: "订单类型不能为空", trigger: "change" }
        ],
        totalAmount: [
          { required: true, message: "总价不能为空", trigger: "blur" }
        ],
        status: [
          { required: true, message: "订单状态不能为空", trigger: "change" }
        ],
        receiverName: [
          { required: true, message: "收货人不能为空", trigger: "blur" }
        ],
        receiverPhone: [
          { required: true, message: "收货电话不能为空", trigger: "blur" }
        ],
        receiverAddress: [
          { required: true, message: "收货地址不能为空", trigger: "blur" }
        ],
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询订单列表 */
    getList() {
      this.loading = true
      listOrder(this.queryParams).then(response => {
        this.orderList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        orderId: null,
        orderNo: null,
        deviceId: null,
        orderType: null,
        totalAmount: null,
        status: null,
        receiverName: null,
        receiverPhone: null,
        receiverAddress: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null,
        remark: null
      }
      this.resetForm("form")
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm")
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.orderId)
      this.selectedOrderNos = selection.map(item => item.orderNo)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = "添加订单"
    },
    /** 查看详情按钮操作 */
    handleDetail(row) {
      const orderId = row.orderId
      getOrder(orderId).then(response => {
        this.detailData = response.data
        if (!this.detailData.orderItems) {
          this.detailData.orderItems = []
        }
        if (!this.detailData.customOrders) {
          this.detailData.customOrders = []
        }
        this.detailOpen = true
      })
    },
    formatCustomContent(content) {
      if (!content) {
        return '无'
      }
      try {
        const obj = JSON.parse(content)
        if (obj.shanglian || obj.xialian || obj.hengpi) {
          return `上联：${obj.shanglian || ''}\n下联：${obj.xialian || ''}\n横批：${obj.hengpi || ''}`
        }
      } catch (e) {
        // 非 JSON，按原文展示
      }
      return content
    },
    formatCustomSpec(spec) {
      if (!spec) {
        return '无'
      }
      const typeMap = { 1: '春联', 2: '福字', 3: '横批' }
      const sizeMap = { 1: '1.2米', 2: '1.5米', 3: '1.8米', 4: '2.1米' }
      const paperMap = { 1: '丹色', 2: '纯红色', 3: '点金红色' }
      const labelOf = (map, val) => {
        if (val == null || val === '') return null
        const key = Number(val)
        return map[key] || String(val)
      }
      try {
        const obj = JSON.parse(spec)
        const parts = []
        const typeVal = obj.typeName || labelOf(typeMap, obj.type)
        const sizeVal = obj.sizeName || labelOf(sizeMap, obj.size)
        const paperVal = obj.paperName || labelOf(paperMap, obj.paper)
        if (typeVal) parts.push(`类型：${typeVal}`)
        if (sizeVal) parts.push(`尺寸：${sizeVal}`)
        if (paperVal) parts.push(`联纸：${paperVal}`)
        if (obj.price != null) parts.push(`价格：¥${obj.price}`)
        return parts.length ? parts.join('，') : spec
      } catch (e) {
        return spec
      }
    },
    formatCustomStatus(status) {
      const map = { '0': '待接单', '1': '制作中', '2': '已完成' }
      return map[status] || status || '-'
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const orderId = row.orderId || this.ids
      getOrder(orderId).then(response => {
        this.form = response.data
        this.open = true
        this.title = "修改订单"
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.orderId != null) {
            updateOrder(this.form).then(response => {
              this.$modal.msgSuccess("修改成功")
              this.open = false
              this.getList()
            })
          } else {
            addOrder(this.form).then(response => {
              this.$modal.msgSuccess("新增成功")
              this.open = false
              this.getList()
            })
          }
        }
      })
    },
    /** 商家同意取消 */
    handleApproveCancel(row) {
      this.$modal.confirm(`确认同意取消订单「${row.orderNo}」？`).then(() => {
        return reviewOrderCancel({ orderId: row.orderId, action: 'approve' })
      }).then(() => {
        this.$modal.msgSuccess('已同意取消')
        this.getList()
      }).catch(() => {})
    },
    /** 商家拒绝取消 */
    handleRejectCancel(row) {
      this.$prompt('可填写拒绝原因（选填）', '拒绝取消申请', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPlaceholder: '例如：春联已进入制作，无法取消'
      }).then(({ value }) => {
        return reviewOrderCancel({
          orderId: row.orderId,
          action: 'reject',
          reviewRemark: value || ''
        })
      }).then(() => {
        this.$modal.msgSuccess('已拒绝取消申请')
        this.getList()
      }).catch(() => {})
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const orderIds = row.orderId || this.ids
      const orderNos = row.orderNo || (this.selectedOrderNos || []).join('、')
      this.$modal.confirm(`是否确认删除订单号为「${orderNos}」的数据项？`).then(function() {
        return delOrder(orderIds)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess("删除成功")
      }).catch(() => {})
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/order/export', {
        ...this.queryParams
      }, `order_${new Date().getTime()}.xlsx`)
    }
  }
}
</script>

<style scoped>
.custom-order-block + .custom-order-block {
  margin-top: 16px;
}
.couplet-content {
  margin: 0;
  white-space: pre-wrap;
  font-family: inherit;
  line-height: 1.8;
  color: #c45656;
}
.custom-empty {
  color: #909399;
  padding: 8px 0 16px;
}
</style>
