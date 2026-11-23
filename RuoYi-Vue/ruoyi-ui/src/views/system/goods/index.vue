<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="商品名称" prop="goodsName">
        <el-input
          v-model="queryParams.goodsName"
          placeholder="请输入商品名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="商品类型" prop="goodsType">
        <el-select v-model="queryParams.goodsType" placeholder="请选择商品类型" clearable>
          <el-option
            v-for="dict in dict.type.cl_goods_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="商品价格" prop="goodsPrice">
        <el-input
          v-model="queryParams.goodsPrice"
          placeholder="请输入商品价格"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="库存数量" prop="stock">
        <el-input
          v-model="queryParams.stock"
          placeholder="请输入库存数量"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="评分" prop="rating">
        <el-input
          v-model="queryParams.rating"
          placeholder="请输入评分"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="上架状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择上架状态" clearable>
          <el-option
            v-for="dict in dict.type.cl_goods_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="排序" prop="sortOrder">
        <el-input
          v-model="queryParams.sortOrder"
          placeholder="请输入排序"
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
          v-hasPermi="['system:goods:add']"
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
          v-hasPermi="['system:goods:edit']"
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
          v-hasPermi="['system:goods:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:goods:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="goodsList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="商品名称" align="center" prop="goodsName" />
      <el-table-column label="商品类型" align="center" prop="goodsType" width="140">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.cl_goods_type" :value="scope.row.goodsType"/>
        </template>
      </el-table-column>
      <el-table-column label="规格" align="center" prop="specOptions" width="160" show-overflow-tooltip>
        <template slot-scope="scope">
          <span v-if="isSpecGoods(scope.row.goodsType)">{{ formatSpecSummary(scope.row.specOptions) }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="商品价格" align="center" prop="goodsPrice" />
      <el-table-column label="库存数量" align="center" prop="stock" />
      <el-table-column label="封面图片" align="center" prop="coverImage" width="100">
        <template slot-scope="scope">
          <image-preview :src="scope.row.coverImage" :width="50" :height="50"/>
        </template>
      </el-table-column>
      <el-table-column label="商品图片" align="center" prop="images" width="100">
        <template slot-scope="scope">
          <image-preview :src="scope.row.images" :width="50" :height="50"/>
        </template>
      </el-table-column>
      <el-table-column label="商品描述" align="center" prop="description" />
      <el-table-column label="评分" align="center" prop="rating" />
      <el-table-column label="上架状态" align="center" prop="status">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.cl_goods_status" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="排序" align="center" prop="sortOrder" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:goods:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:goods:remove']"
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

    <!-- 添加或修改商品对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="720px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="商品名称" prop="goodsName">
          <el-input v-model="form.goodsName" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="商品类型" prop="goodsType">
          <el-select v-model="form.goodsType" placeholder="请选择商品类型" @change="handleGoodsTypeChange">
            <el-option
              v-for="dict in dict.type.cl_goods_type"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>

        <!-- 需要材质尺寸的商品：规格模板 -->
        <div v-if="isSpecGoods(form.goodsType)" class="spec-template-box">
          <el-divider content-position="left">规格模板</el-divider>
          <div class="spec-template-tip">
            勾选本商品支持的尺寸与联纸，价格与小程序定制页默认模板一致，可按需调整。
            <el-button type="text" size="mini" @click="applyDefaultSpecTemplate">一键应用默认模板</el-button>
          </div>

          <div class="spec-section">
            <div class="spec-section-title">可选尺寸</div>
            <el-checkbox-group v-model="selectedSizeIds" @change="syncGoodsPriceFromSpec">
              <el-checkbox v-for="item in sizeTemplate" :key="'size-' + item.id" :label="item.id">
                {{ item.name }}
              </el-checkbox>
            </el-checkbox-group>
            <el-table
              v-if="selectedSizeRows.length"
              :data="selectedSizeRows"
              size="mini"
              border
              class="spec-price-table"
            >
              <el-table-column prop="name" label="尺寸" width="120" />
              <el-table-column label="售价(元)">
                <template slot-scope="scope">
                  <el-input-number
                    v-model="sizePriceMap[scope.row.id]"
                    :min="0"
                    :precision="2"
                    :step="1"
                    size="mini"
                    controls-position="right"
                    @change="syncGoodsPriceFromSpec"
                  />
                </template>
              </el-table-column>
            </el-table>
          </div>

          <div class="spec-section">
            <div class="spec-section-title">可选联纸（材质）</div>
            <el-checkbox-group v-model="selectedMaterialIds">
              <el-checkbox v-for="item in materialTemplate" :key="'paper-' + item.id" :label="item.id">
                {{ item.name }}
              </el-checkbox>
            </el-checkbox-group>
            <el-table
              v-if="selectedMaterialRows.length"
              :data="selectedMaterialRows"
              size="mini"
              border
              class="spec-price-table"
            >
              <el-table-column prop="name" label="联纸" width="120" />
              <el-table-column label="加价(元)">
                <template slot-scope="scope">
                  <el-input-number
                    v-model="materialExtraMap[scope.row.id]"
                    :min="0"
                    :precision="2"
                    :step="1"
                    size="mini"
                    controls-position="right"
                  />
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>

        <el-form-item :label="isSpecGoods(form.goodsType) ? '起步价格' : '商品价格'" prop="goodsPrice">
          <el-input v-model="form.goodsPrice" :placeholder="isSpecGoods(form.goodsType) ? '通常为最小尺寸价格' : '请输入商品价格'" />
        </el-form-item>
        <el-form-item label="库存数量" prop="stock">
          <el-input v-model="form.stock" placeholder="请输入库存数量" />
        </el-form-item>
        <el-form-item label="封面图片" prop="coverImage">
          <image-upload v-model="form.coverImage"/>
        </el-form-item>
        <el-form-item label="商品图片" prop="images">
          <image-upload v-model="form.images" :limit="5"/>
        </el-form-item>
        <el-form-item label="商品描述" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="评分" prop="rating">
          <el-input v-model="form.rating" placeholder="请输入评分" />
        </el-form-item>
        <el-form-item label="上架状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择上架状态">
            <el-option
              v-for="dict in dict.type.cl_goods_status"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input v-model="form.sortOrder" placeholder="请输入排序" />
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
  </div>
</template>

<script>
import { listGoods, getGoods, delGoods, addGoods, updateGoods } from "@/api/system/goods"

const SIZE_TEMPLATE = [
  { id: 1, name: '1.2米', price: 38 },
  { id: 2, name: '1.5米', price: 48 },
  { id: 3, name: '1.8米', price: 58 },
  { id: 4, name: '2.1米', price: 68 }
]

const MATERIAL_TEMPLATE = [
  { id: 1, name: '丹色', extraPrice: 0 },
  { id: 2, name: '纯红色', extraPrice: 0 },
  { id: 3, name: '点金红色', extraPrice: 5 }
]

export default {
  name: "Goods",
  dicts: ['cl_goods_type', 'cl_goods_status'],
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 商品表格数据
      goodsList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        goodsName: null,
        goodsType: null,
        goodsPrice: null,
        stock: null,
        coverImage: null,
        images: null,
        description: null,
        rating: null,
        status: null,
        sortOrder: null,
      },
      // 表单参数
      form: {},
      sizeTemplate: SIZE_TEMPLATE.map(item => ({ ...item })),
      materialTemplate: MATERIAL_TEMPLATE.map(item => ({ ...item })),
      selectedSizeIds: [],
      selectedMaterialIds: [],
      sizePriceMap: {},
      materialExtraMap: {},
      // 表单校验
      rules: {
        goodsName: [
          { required: true, message: "商品名称不能为空", trigger: "blur" }
        ],
      }
    }
  },
  created() {
    this.getList()
  },
  computed: {
    selectedSizeRows() {
      return this.sizeTemplate.filter(item => this.selectedSizeIds.includes(item.id))
    },
    selectedMaterialRows() {
      return this.materialTemplate.filter(item => this.selectedMaterialIds.includes(item.id))
    }
  },
  methods: {
    isSpecGoods(goodsType) {
      return String(goodsType) === '1'
    },
    /** 查询商品列表 */
    getList() {
      this.loading = true
      listGoods(this.queryParams).then(response => {
        this.goodsList = response.rows
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
        goodsId: null,
        goodsName: null,
        goodsType: null,
        goodsPrice: null,
        stock: null,
        coverImage: null,
        images: null,
        description: null,
        specOptions: null,
        rating: null,
        status: null,
        sortOrder: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null,
        remark: null
      }
      this.resetSpecForm()
      this.resetForm("form")
    },
    resetSpecForm() {
      this.selectedSizeIds = []
      this.selectedMaterialIds = []
      this.sizePriceMap = {}
      this.materialExtraMap = {}
    },
    handleGoodsTypeChange(val) {
      if (this.isSpecGoods(val) && !this.selectedSizeIds.length) {
        this.applyDefaultSpecTemplate()
      }
      if (!this.isSpecGoods(val)) {
        this.resetSpecForm()
        this.form.specOptions = null
      }
    },
    applyDefaultSpecTemplate() {
      this.selectedSizeIds = this.sizeTemplate.map(item => item.id)
      this.selectedMaterialIds = this.materialTemplate.map(item => item.id)
      const sizePriceMap = {}
      const materialExtraMap = {}
      this.sizeTemplate.forEach(item => {
        sizePriceMap[item.id] = item.price
      })
      this.materialTemplate.forEach(item => {
        materialExtraMap[item.id] = item.extraPrice
      })
      this.sizePriceMap = sizePriceMap
      this.materialExtraMap = materialExtraMap
      this.syncGoodsPriceFromSpec()
    },
    parseSpecOptions(specOptions) {
      this.resetSpecForm()
      if (!specOptions) {
        return
      }
      try {
        const obj = typeof specOptions === 'string' ? JSON.parse(specOptions) : specOptions
        const sizes = Array.isArray(obj.sizes) ? obj.sizes : []
        const materials = Array.isArray(obj.materials) ? obj.materials : []
        this.selectedSizeIds = sizes.map(item => item.id)
        this.selectedMaterialIds = materials.map(item => item.id)
        sizes.forEach(item => {
          this.$set(this.sizePriceMap, item.id, item.price)
        })
        materials.forEach(item => {
          this.$set(this.materialExtraMap, item.id, item.extraPrice != null ? item.extraPrice : 0)
        })
      } catch (e) {
        console.warn('规格 JSON 解析失败', e)
      }
    },
    buildSpecOptions() {
      const sizes = this.sizeTemplate
        .filter(item => this.selectedSizeIds.includes(item.id))
        .map(item => ({
          id: item.id,
          name: item.name,
          price: Number(this.sizePriceMap[item.id] != null ? this.sizePriceMap[item.id] : item.price)
        }))
      const materials = this.materialTemplate
        .filter(item => this.selectedMaterialIds.includes(item.id))
        .map(item => ({
          id: item.id,
          name: item.name,
          extraPrice: Number(this.materialExtraMap[item.id] != null ? this.materialExtraMap[item.id] : item.extraPrice)
        }))
      return JSON.stringify({ sizes, materials })
    },
    validateSpecTemplate() {
      if (!this.isSpecGoods(this.form.goodsType)) {
        return true
      }
      if (!this.selectedSizeIds.length) {
        this.$modal.msgWarning('请至少选择一种尺寸')
        return false
      }
      if (!this.selectedMaterialIds.length) {
        this.$modal.msgWarning('请至少选择一种联纸（材质）')
        return false
      }
      return true
    },
    syncGoodsPriceFromSpec() {
      if (!this.isSpecGoods(this.form.goodsType) || !this.selectedSizeIds.length) {
        return
      }
      const prices = this.selectedSizeIds
        .map(id => Number(this.sizePriceMap[id]))
        .filter(price => !Number.isNaN(price))
      if (prices.length) {
        this.form.goodsPrice = Math.min(...prices)
      }
    },
    formatSpecSummary(specOptions) {
      if (!specOptions) {
        return '未配置'
      }
      try {
        const obj = JSON.parse(specOptions)
        const sizeCount = (obj.sizes || []).length
        const materialCount = (obj.materials || []).length
        if (!sizeCount && !materialCount) {
          return '未配置'
        }
        return `${sizeCount}种尺寸 / ${materialCount}种联纸`
      } catch (e) {
        return '未配置'
      }
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
      this.ids = selection.map(item => item.goodsId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.form.goodsType = '0'
      this.open = true
      this.title = "添加商品"
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const goodsId = row.goodsId || this.ids
      getGoods(goodsId).then(response => {
        this.form = response.data
        if (this.isSpecGoods(this.form.goodsType)) {
          this.parseSpecOptions(this.form.specOptions)
          if (!this.selectedSizeIds.length) {
            this.applyDefaultSpecTemplate()
          }
        }
        this.open = true
        this.title = "修改商品"
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (!valid) {
          return
        }
        if (!this.validateSpecTemplate()) {
          return
        }
        const payload = { ...this.form }
        if (this.isSpecGoods(payload.goodsType)) {
          payload.specOptions = this.buildSpecOptions()
        } else {
          payload.specOptions = null
        }
        if (payload.goodsId != null) {
          updateGoods(payload).then(response => {
            this.$modal.msgSuccess("修改成功")
            this.open = false
            this.getList()
          })
        } else {
          addGoods(payload).then(response => {
            this.$modal.msgSuccess("新增成功")
            this.open = false
            this.getList()
          })
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const goodsIds = row.goodsId || this.ids
      this.$modal.confirm('是否确认删除商品编号为"' + goodsIds + '"的数据项？').then(function() {
        return delGoods(goodsIds)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess("删除成功")
      }).catch(() => {})
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/goods/export', {
        ...this.queryParams
      }, `goods_${new Date().getTime()}.xlsx`)
    }
  }
}
</script>

<style scoped>
.spec-template-box {
  margin: 0 0 16px 90px;
  padding: 12px 16px;
  background: #fafafa;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}
.spec-template-tip {
  font-size: 12px;
  color: #909399;
  margin-bottom: 12px;
  line-height: 1.6;
}
.spec-section {
  margin-bottom: 16px;
}
.spec-section-title {
  font-size: 13px;
  font-weight: 600;
  color: #606266;
  margin-bottom: 8px;
}
.spec-price-table {
  margin-top: 10px;
  max-width: 360px;
}
</style>
