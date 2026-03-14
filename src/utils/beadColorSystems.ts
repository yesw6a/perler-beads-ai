/**
 * 拼豆色号系统工具函数
 * 参考 pindou-draw 设计
 * 使用 colorSystemUtils 作为主要数据源
 */

import { 
  ColorSystem, 
  getColorKeyByHex, 
  getAllHexValues,
  getColorSystemDisplayName,
  getColorSystemColorCount,
  getRecommendedColorSystem,
  convertPaletteToColorSystem,
  sortColorsByHue
} from './colorSystemUtils';

// 重新导出类型和函数
export type BeadColorSystem = ColorSystem;
export { 
  getColorKeyByHex, 
  getAllHexValues as getAllAvailableHexColors,
  getColorSystemDisplayName,
  getColorSystemColorCount,
  getRecommendedColorSystem,
  convertPaletteToColorSystem,
  sortColorsByHue
};

// 色板颜色接口
export interface BeadColor {
  hex: string;
  key: string;
  count: number;
  percentage: number;
}

// 购买清单项
export interface BeadShoppingItem {
  colorKey: string;
  colorName: string;
  hex: string;
  count: number;
  system: BeadColorSystem;
}

/**
 * 导出色板为购买清单
 */
export function generateShoppingList(
  palette: BeadColor[],
  system: BeadColorSystem
): BeadShoppingItem[] {
  return palette
    .filter(color => color.count > 0)
    .map(color => ({
      colorKey: getColorKeyByHex(color.hex, system),
      colorName: getColorSystemDisplayName(system),
      hex: color.hex,
      count: color.count,
      system
    }))
    .sort((a, b) => a.colorKey.localeCompare(b.colorKey));
}

/**
 * 计算两种颜色的相似度（0-1）
 */
export function calculateColorSimilarity(hex1: string, hex2: string): number {
  const r1 = parseInt(hex1.slice(1, 3), 16);
  const g1 = parseInt(hex1.slice(3, 5), 16);
  const b1 = parseInt(hex1.slice(5, 7), 16);
  
  const r2 = parseInt(hex2.slice(1, 3), 16);
  const g2 = parseInt(hex2.slice(3, 5), 16);
  const b2 = parseInt(hex2.slice(5, 7), 16);
  
  const diff = Math.sqrt(
    Math.pow(r2 - r1, 2) +
    Math.pow(g2 - g1, 2) +
    Math.pow(b2 - b1, 2)
  );
  
  // 最大差异为 441.67 (sqrt(255^2 * 3))
  const maxDiff = 441.67;
  
  return 1 - (diff / maxDiff);
}

/**
 * 查找最接近的可用颜色
 */
export function findClosestAvailableColor(
  targetHex: string,
  availableHexColors: string[]
): string {
  if (availableHexColors.length === 0) {
    return targetHex;
  }
  
  let closestColor = availableHexColors[0];
  let highestSimilarity = 0;
  
  for (const hex of availableHexColors) {
    const similarity = calculateColorSimilarity(targetHex, hex);
    if (similarity > highestSimilarity) {
      highestSimilarity = similarity;
      closestColor = hex;
    }
  }
  
  return closestColor;
}

/**
 * 获取所有色号系统选项（用于 UI 选择）
 */
export function getColorSystemOptions() {
  return [
    { key: 'DMC' as BeadColorSystem, name: 'DMC (默认) (436 色)' },
    { key: 'Kaka' as BeadColorSystem, name: '卡卡家 (默认) (283 色)' },
    { key: 'ManMan' as BeadColorSystem, name: '漫漫家 (默认) (219 色)' },
    { key: 'PanPan' as BeadColorSystem, name: '盼盼拼豆 (默认) (221 色)' },
    { key: 'COCO' as BeadColorSystem, name: 'Coco (默认) (221 色)' },
    { key: 'MARD24' as BeadColorSystem, name: 'MARD 24 (默认) (24 色)' },
    { key: 'MARD48' as BeadColorSystem, name: 'MARD 48 (默认) (48 色)' },
    { key: 'MARD72' as BeadColorSystem, name: 'MARD 72 (默认) (72 色)' },
    { key: 'MARD96' as BeadColorSystem, name: 'MARD 96 (默认) (96 色)' },
    { key: 'MARD120' as BeadColorSystem, name: 'MARD 120 (默认) (120 色)' },
    { key: 'MARD144' as BeadColorSystem, name: 'MARD 144 (默认) (144 色)' },
    { key: 'MARD221' as BeadColorSystem, name: 'MARD 221 (默认) (221 色)' },
    { key: 'MARD295' as BeadColorSystem, name: 'MARD 295 (默认) (295 色)' },
  ];
}

/**
 * 获取默认色号系统
 */
export function getDefaultColorSystem(): BeadColorSystem {
  return 'DMC';
}
