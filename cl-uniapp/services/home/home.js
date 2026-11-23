import { config, cdnBase } from '../../config/index';
import { getBannerData } from './banner';

/** 首页默认分类 Tab（首屏骨架） */
export function getDefaultHomeTabs() {
  return [
    { text: '精选推荐', key: 0 },
    { text: '春联定制', key: 1 },
    { text: '福字专区', key: 2 },
    { text: '人气榜', key: 3 },
    { text: '新品上市', key: 4 },
    { text: '特惠专区', key: 5 },
    { text: '定制服务', key: 6 },
  ];
}

/** 获取首页数据 */
function mockFetchHome() {
  const { delay } = require('../_utils/delay');
  
  return delay().then(async () => {
    // 获取轮播图数据
    const bannerData = await getBannerData();
    
    return {
      swiper: bannerData,
      tabList: getDefaultHomeTabs(),
      activityImg: `${cdnBase}/activity/banner.png`,
    };
  });
}

/** 获取首页数据 */
export function fetchHome() {
  // 首页数据当前没有对接后端接口，为避免 useMock=false 时返回无效数据导致首页崩溃，
  // 这里先统一返回 mock 结构（swiper/tabList/activityImg）。
  // 后续若你要把首页轮播/分类也做成后台可配，再扩展真实接口即可。
    return mockFetchHome();
}
