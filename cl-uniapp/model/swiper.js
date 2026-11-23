// 商品轮播图配置
// 展示热门商品，点击可跳转到商品详情
const productBanners = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop&q=80',
    title: '精品春联套装',
    subtitle: '传统手写春联，福到万家',
    goodsId: 1
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1609025098046-cd4628902d4a?w=800&h=400&fit=crop&q=80',
    title: '福字门贴',
    subtitle: '优质红纸，金字工艺',
    goodsId: 2
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1577720643272-265f434b4b0f?w=800&h=400&fit=crop&q=80',
    title: '定制对联',
    subtitle: '个性化定制，专属祝福',
    goodsId: 3
  }
];

export function genSwiperImageList() {
  return productBanners;
}
