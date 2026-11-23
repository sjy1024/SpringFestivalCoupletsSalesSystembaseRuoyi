/**
 * 设备 ID：与 `app.js`、`deviceId.js` 统一实现，避免多模块各写一套导致格式不一致。
 * 历史代码仍可从 `utils/device` 引用。
 */
export { getDeviceId, clearDeviceId, setDeviceId } from './deviceId';