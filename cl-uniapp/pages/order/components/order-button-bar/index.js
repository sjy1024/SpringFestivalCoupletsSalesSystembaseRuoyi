import Toast from 'tdesign-miniprogram/toast/index';
import Dialog from 'tdesign-miniprogram/dialog/index';
import { OrderButtonTypes } from '../../config';
import { confirmReceipt, cancelOrder } from '../../../../services/order/orderStatus';

Component({
  options: {
    addGlobalClass: true,
  },
  properties: {
    order: {
      type: Object,
      observer(order) {
        // 判定有传goodsIndex ，则认为是商品button bar, 仅显示申请售后按钮
        if (this.properties?.goodsIndex !== null) {
          const goods = order.goodsList[Number(this.properties.goodsIndex)];
          this.setData({
            buttons: {
              left: [],
              right: (goods.buttons || []).filter((b) => b.type == OrderButtonTypes.APPLY_REFUND),
            },
          });
          return;
        }
        // 订单的button bar 不显示申请售后按钮
        const buttonsRight = (order.buttons || [])
          // .filter((b) => b.type !== OrderButtonTypes.APPLY_REFUND)
          .map((button) => {
            //邀请好友拼团按钮
            if (button.type === OrderButtonTypes.INVITE_GROUPON && order.groupInfoVo) {
              const {
                groupInfoVo: { groupId, promotionId, remainMember, groupPrice },
                goodsList,
              } = order;
              const goodsImg = goodsList[0] && goodsList[0].imgUrl;
              const goodsName = goodsList[0] && goodsList[0].name;
              return {
                ...button,
                openType: 'share',
                dataShare: {
                  goodsImg,
                  goodsName,
                  groupId,
                  promotionId,
                  remainMember,
                  groupPrice,
                  storeId: order.storeId,
                },
              };
            }
            return button;
          });
        // 删除订单按钮单独挪到左侧
        const deleteBtnIndex = buttonsRight.findIndex((b) => b.type === OrderButtonTypes.DELETE);
        let buttonsLeft = [];
        if (deleteBtnIndex > -1) {
          buttonsLeft = buttonsRight.splice(deleteBtnIndex, 1);
        }
        this.setData({
          buttons: {
            left: buttonsLeft,
            right: buttonsRight,
          },
        });
      },
    },
    goodsIndex: {
      type: Number,
      value: null,
    },
    isBtnMax: {
      type: Boolean,
      value: false,
    },
  },

  data: {
    order: {},
    buttons: {
      left: [],
      right: [],
    },
  },

  methods: {
    // 点击【订单操作】按钮，根据按钮类型分发
    onOrderBtnTap(e) {
      const { type } = e.currentTarget.dataset;
      switch (type) {
        case OrderButtonTypes.DELETE:
          this.onDelete(this.data.order);
          break;
        case OrderButtonTypes.CANCEL:
          this.onCancel(this.data.order);
          break;
        case OrderButtonTypes.CONFIRM:
          this.onConfirm(this.data.order);
          break;
        case OrderButtonTypes.PAY:
          this.onPay(this.data.order);
          break;
        case OrderButtonTypes.APPLY_REFUND:
          this.onApplyRefund(this.data.order);
          break;
        case OrderButtonTypes.VIEW_REFUND:
          this.onViewRefund(this.data.order);
          break;
        case OrderButtonTypes.COMMENT:
          this.onAddComment(this.data.order);
          break;
        case OrderButtonTypes.INVITE_GROUPON:
          //分享邀请好友拼团
          break;
        case OrderButtonTypes.REBUY:
          this.onBuyAgain(this.data.order);
      }
    },

    onCancel(order) {
      const orderStatus = String(order.status ?? order.orderStatus ?? '0');
      const isPaidFlow = orderStatus === '1' || orderStatus === '2';
      Dialog.confirm({
        title: isPaidFlow ? '申请取消订单？' : '确认取消订单？',
        content: isPaidFlow
          ? '提交后需商家审核，审核通过后订单将取消。'
          : '取消后无法恢复，确定要取消这个订单吗？',
        confirmBtn: isPaidFlow ? '提交申请' : '确认取消',
        cancelBtn: '我再想想',
      })
        .then(() => {
          const orderId = order.id || order.orderId;
          console.log('取消订单, orderId:', orderId, 'status:', orderStatus);

          wx.showLoading({ title: '处理中...' });

          cancelOrder(orderId, '用户主动取消', orderStatus)
            .then(() => {
              wx.hideLoading();
              Toast({
                context: this,
                selector: '#t-toast',
                message: isPaidFlow ? '取消申请已提交' : '订单已取消',
                icon: 'check-circle',
                duration: 1500,
              });
              setTimeout(() => {
                this.triggerEvent('refresh');
              }, 1500);
            })
            .catch((error) => {
              wx.hideLoading();
              console.error('取消订单失败:', error);
              Toast({
                context: this,
                selector: '#t-toast',
                message: error.message || '取消订单失败',
                icon: 'close-circle',
                duration: 2000,
              });
            });
        })
        .catch(() => {
          // 用户取消了操作
        });
    },

    onConfirm(order) {
      Dialog.confirm({
        title: '确认收货',
        content: '请确认您已收到商品，确认收货后订单将完成',
        confirmBtn: '确认收货',
        cancelBtn: '取消',
      })
        .then(() => {
          // 调用确认收货接口，使用 order.id（订单列表中映射的字段）
          const orderId = order.id || order.orderId;
          console.log('确认收货, orderId:', orderId);
          
          // 显示加载提示
          wx.showLoading({ title: '处理中...' });
          
          confirmReceipt(orderId)
            .then(() => {
              wx.hideLoading();
              Toast({
                context: this,
                selector: '#t-toast',
                message: '确认收货成功',
                icon: 'check-circle',
                duration: 1500,
              });
              // 延迟刷新，让用户看到成功提示
              setTimeout(() => {
                // 通知父组件刷新订单列表
                this.triggerEvent('refresh');
              }, 1500);
            })
            .catch((error) => {
              wx.hideLoading();
              console.error('确认收货失败:', error);
              Toast({
                context: this,
                selector: '#t-toast',
                message: error.message || '确认收货失败',
                icon: 'close-circle',
                duration: 2000,
              });
            });
        })
        .catch(() => {
          // 用户取消了操作
        });
    },

    onPay(order) {
      // 跳转到订单详情页面进行支付
      wx.navigateTo({
        url: `/pages/order/detail/index?orderId=${order.id}`
      });
    },

    onBuyAgain() {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '你点击了再次购买',
        icon: 'check-circle',
      });
    },

    onApplyRefund() {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '售后功能暂未开放',
        icon: '',
      });
    },

    onViewRefund() {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '你点击了查看退款',
        icon: '',
      });
    },

    /** 添加订单评论 */
    onAddComment() {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '评价功能暂未开放',
        icon: '',
      });
    },
  },
});
