import updateManager from './common/updateManager';
import { getDeviceId } from './utils/deviceId';

App({
  globalData: {
    selectedCartItems: [],
  },
  onLaunch: function () {
    // 初始化设备ID（如果不存在则自动生成）
    const deviceId = getDeviceId();
    console.log('设备ID:', deviceId);
  },
  onShow: function () {
    updateManager();
  },
});
