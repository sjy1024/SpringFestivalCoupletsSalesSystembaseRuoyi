<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="88px">
      <el-form-item label="关联订单号" prop="orderNo">
        <el-input
          v-model="queryParams.orderNo"
          placeholder="请输入订单号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="定制状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择定制状态" clearable>
          <el-option
            v-for="dict in dict.type.cl_custom_order_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="排队号" prop="queueNo">
        <el-input
          v-model="queryParams.queueNo"
          placeholder="请输入排队号"
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
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:customOrder:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:customOrder:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="customOrderList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="定制ID" align="center" prop="customId" width="80" />
      <el-table-column label="关联订单号" align="center" prop="orderNo" min-width="140" />
      <el-table-column label="定制状态" align="center" prop="status" width="100">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.cl_custom_order_status" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="排队号" align="center" prop="queueNo" width="80" />
      <el-table-column label="预计完成" align="center" prop="estimatedTime" width="100">
        <template slot-scope="scope">
          {{ scope.row.estimatedTime != null ? scope.row.estimatedTime + ' 分钟' : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="对联摘要" align="center" prop="customContent" min-width="160" show-overflow-tooltip>
        <template slot-scope="scope">
          {{ formatCustomContentBrief(scope.row.customContent) }}
        </template>
      </el-table-column>
      <el-table-column label="提交时间" align="center" prop="createTime" width="160" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="260">
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.status === '0'"
            size="mini"
            type="text"
            icon="el-icon-s-check"
            @click="handleAccept(scope.row)"
            v-hasPermi="['system:customOrder:edit']"
          >接单</el-button>
          <el-button
            v-if="scope.row.status === '1'"
            size="mini"
            type="text"
            icon="el-icon-circle-check"
            @click="handleComplete(scope.row)"
            v-hasPermi="['system:customOrder:edit']"
          >完成</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-view"
            @click="handleDetail(scope.row)"
            v-hasPermi="['system:customOrder:query']"
          >详情</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:customOrder:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:customOrder:remove']"
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

    <!-- 修改定制订单 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="88px">
        <el-form-item label="定制状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择定制状态">
            <el-option
              v-for="dict in dict.type.cl_custom_order_status"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 定制订单详情 -->
    <el-dialog title="定制订单详情" :visible.sync="detailOpen" width="680px" append-to-body>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="定制ID">{{ detailData.customId }}</el-descriptions-item>
        <el-descriptions-item label="关联订单号">{{ detailData.orderNo || detailData.orderId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="定制状态">{{ formatCustomStatus(detailData.status) }}</el-descriptions-item>
        <el-descriptions-item label="排队号">{{ detailData.queueNo != null ? detailData.queueNo : '-' }}</el-descriptions-item>
        <el-descriptions-item label="排队位置">{{ detailData.queuePosition != null ? detailData.queuePosition : '-' }}</el-descriptions-item>
        <el-descriptions-item label="预计完成">{{ detailData.estimatedTime != null ? detailData.estimatedTime + ' 分钟' : '-' }}</el-descriptions-item>
        <el-descriptions-item label="提交时间" :span="2">{{ detailData.createTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="对联内容" :span="2">
          <pre class="couplet-content">{{ formatCustomContent(detailData.customContent) }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="定制规格" :span="2">
          {{ formatCustomSpec(detailData.customSpec) }}
        </el-descriptions-item>
        <el-descriptions-item v-if="detailData.remark" label="备注" :span="2">{{ detailData.remark }}</el-descriptions-item>
      </el-descriptions>
      <div slot="footer" class="dialog-footer">
        <el-button @click="detailOpen = false">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listCustomOrder, getCustomOrder, updateCustomOrder, delCustomOrder } from "@/api/system/customOrder"

export default {
  name: "CustomOrder",
  dicts: ['cl_custom_order_status'],
  data() {
    return {
      loading: true,
      ids: [],
      single: true,
      multiple: true,
      showSearch: true,
      total: 0,
      customOrderList: [],
      title: "",
      open: false,
      detailOpen: false,
      detailData: {},
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        orderNo: null,
        status: null,
        queueNo: null
      },
      form: {},
      rules: {
        status: [
          { required: true, message: "定制状态不能为空", trigger: "change" }
        ]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      listCustomOrder(this.queryParams).then(response => {
        this.customOrderList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    cancel() {
      this.open = false
      this.reset()
    },
    reset() {
      this.form = {
        customId: null,
        status: null,
        remark: null
      }
      this.resetForm("form")
    },
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    resetQuery() {
      this.resetForm("queryForm")
      this.handleQuery()
    },
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.customId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    handleDetail(row) {
      const customId = row.customId
      getCustomOrder(customId).then(response => {
        this.detailData = response.data
        this.detailOpen = true
      })
    },
    handleUpdate(row) {
      this.reset()
      const customId = row.customId || this.ids[0]
      getCustomOrder(customId).then(response => {
        this.form = {
          customId: response.data.customId,
          status: response.data.status,
          remark: response.data.remark
        }
        this.open = true
        this.title = "修改定制订单"
      })
    },
    handleAccept(row) {
      this.$modal.confirm('确认接单定制单「' + row.customId + '」？').then(() => {
        return updateCustomOrder({ customId: row.customId, status: '1' })
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess("已接单")
      }).catch(() => {})
    },
    handleComplete(row) {
      this.$modal.confirm('确认标记定制单「' + row.customId + '」为已完成？').then(() => {
        return updateCustomOrder({ customId: row.customId, status: '2' })
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess("已完成")
      }).catch(() => {})
    },
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          updateCustomOrder(this.form).then(() => {
            this.$modal.msgSuccess("修改成功")
            this.open = false
            this.getList()
          })
        }
      })
    },
    handleDelete(row) {
      const customIds = row.customId || this.ids
      this.$modal.confirm('是否确认删除定制订单编号为「' + customIds + '」的数据项？').then(() => {
        return delCustomOrder(customIds)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess("删除成功")
      }).catch(() => {})
    },
    handleExport() {
      this.download('system/customOrder/export', {
        ...this.queryParams
      }, `customOrder_${new Date().getTime()}.xlsx`)
    },
    formatCustomContentBrief(content) {
      if (!content) return '-'
      const text = this.formatCustomContent(content)
      return text.length > 30 ? text.substring(0, 30) + '...' : text
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
    }
  }
}
</script>

<style scoped>
.couplet-content {
  margin: 0;
  white-space: pre-wrap;
  font-family: inherit;
  line-height: 1.6;
}
</style>
