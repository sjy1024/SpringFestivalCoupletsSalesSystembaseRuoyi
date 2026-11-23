/**
 * 商品规格工具（与后台 cl_goods.spec_options 格式一致）
 */

export function isSpecGoods(goodsType) {
  return String(goodsType) === '1';
}

export function parseSpecOptions(specOptions) {
  if (!specOptions) {
    return { sizes: [], materials: [] };
  }
  try {
    const obj = typeof specOptions === 'string' ? JSON.parse(specOptions) : specOptions;
    return {
      sizes: Array.isArray(obj.sizes) ? obj.sizes : [],
      materials: Array.isArray(obj.materials) ? obj.materials : [],
    };
  } catch (e) {
    return { sizes: [], materials: [] };
  }
}

export function calcUnitPrice(sizes, materials, sizeId, materialId) {
  const size = sizes.find((s) => s.id === sizeId);
  if (!size) return null;
  const material = materials.find((m) => m.id === materialId);
  const base = Number(size.price) || 0;
  const extra = material ? Number(material.extraPrice) || 0 : 0;
  return base + extra;
}

export function buildItemSpec(sizes, materials, sizeId, materialId) {
  const size = sizes.find((s) => s.id === sizeId);
  const material = materials.find((m) => m.id === materialId);
  if (!size || !material) return null;
  const unitPrice = calcUnitPrice(sizes, materials, sizeId, materialId);
  return {
    sizeId,
    sizeName: size.name,
    materialId,
    materialName: material.name,
    unitPrice,
  };
}

export function formatSpecText(itemSpec) {
  if (!itemSpec) return '';
  try {
    const obj = typeof itemSpec === 'string' ? JSON.parse(itemSpec) : itemSpec;
    if (obj.sizeName && obj.materialName) {
      return `${obj.sizeName} / ${obj.materialName}`;
    }
    return obj.sizeName || obj.materialName || '';
  } catch (e) {
    return '';
  }
}

export function parseItemSpecIds(itemSpec) {
  if (!itemSpec) return { sizeId: null, materialId: null };
  try {
    const obj = typeof itemSpec === 'string' ? JSON.parse(itemSpec) : itemSpec;
    return {
      sizeId: obj.sizeId != null ? Number(obj.sizeId) : null,
      materialId: obj.materialId != null ? Number(obj.materialId) : null,
    };
  } catch (e) {
    return { sizeId: null, materialId: null };
  }
}
