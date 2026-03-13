/**
 * 拼豆色号系统工具函数
 * 支持多个主流拼豆品牌的色号转换
 */

// 色号系统定义
export type BeadColorSystem = 
  | 'MARD'      // 玛德
  | 'COCO'      // 可可
  | 'ManMan'    // 漫漫
  | 'PanPan'    // 盼盼
  | 'MiXiaoWo'  // 咪小窝
  | 'Perler'    // 美国 Perler
  | 'Hama'      // 丹麦 Hama
  | 'Artkal';   // 国产 Artkal

// 色号系统显示名称
export const beadColorSystemNames: Record<BeadColorSystem, string> = {
  'MARD': 'MARD 玛德',
  'COCO': 'COCO 可可',
  'ManMan': '漫漫拼豆',
  'PanPan': '盼盼拼豆',
  'MiXiaoWo': '咪小窝拼豆',
  'Perler': 'Perler (美国)',
  'Hama': 'Hama (丹麦)',
  'Artkal': 'Artkal (国产)'
};

// 色号系统选项（用于 UI 选择）
export const beadColorSystemOptions = [
  { key: 'MARD' as BeadColorSystem, name: 'MARD 玛德', popular: true },
  { key: 'COCO' as BeadColorSystem, name: 'COCO 可可', popular: true },
  { key: 'ManMan' as BeadColorSystem, name: '漫漫拼豆', popular: true },
  { key: 'PanPan' as BeadColorSystem, name: '盼盼拼豆', popular: true },
  { key: 'MiXiaoWo' as BeadColorSystem, name: '咪小窝拼豆', popular: true },
  { key: 'Perler' as BeadColorSystem, name: 'Perler', popular: false },
  { key: 'Hama' as BeadColorSystem, name: 'Hama', popular: false },
  { key: 'Artkal' as BeadColorSystem, name: 'Artkal', popular: false },
];

// 获取常用色号系统
export function getPopularColorSystems(): BeadColorSystem[] {
  return beadColorSystemOptions
    .filter(opt => opt.popular)
    .map(opt => opt.key);
}

// 基础色号映射数据（HEX -> 各品牌色号）
// 这里只包含部分常用颜色作为示例，完整数据应该从 colorSystemMapping.json 加载
const BASE_COLOR_MAPPING: Record<string, Record<BeadColorSystem, string>> = {
  // 白色系
  '#FFFFFF': { MARD: 'A00', COCO: 'W01', ManMan: 'B1', PanPan: '1', MiXiaoWo: '1', Perler: '01', Hama: '01', Artkal: 'A01' },
  '#FFFFD5': { MARD: 'A02', COCO: 'E01', ManMan: 'B1', PanPan: '2', MiXiaoWo: '2', Perler: '02', Hama: '02', Artkal: 'A02' },
  '#FEFF8B': { MARD: 'A03', COCO: 'E05', ManMan: 'B2', PanPan: '28', MiXiaoWo: '28', Perler: '03', Hama: '03', Artkal: 'A03' },
  '#FBED56': { MARD: 'A04', COCO: 'E07', ManMan: 'B3', PanPan: '3', MiXiaoWo: '3', Perler: '04', Hama: '04', Artkal: 'A04' },
  
  // 黄色系
  '#F4D738': { MARD: 'A05', COCO: 'D03', ManMan: 'B4', PanPan: '74', MiXiaoWo: '79', Perler: '05', Hama: '05', Artkal: 'A05' },
  '#FEAC4C': { MARD: 'A06', COCO: 'D05', ManMan: 'B5', PanPan: '29', MiXiaoWo: '29', Perler: '06', Hama: '06', Artkal: 'A06' },
  '#FE8B4C': { MARD: 'A07', COCO: 'D08', ManMan: 'B6', PanPan: '4', MiXiaoWo: '4', Perler: '07', Hama: '07', Artkal: 'A07' },
  
  // 橙色系
  '#FF995B': { MARD: 'A09', COCO: 'D06', ManMan: 'B11', PanPan: '90', MiXiaoWo: '97', Perler: '09', Hama: '09', Artkal: 'A09' },
  '#F77C31': { MARD: 'A10', COCO: 'D07', ManMan: 'B12', PanPan: '89', MiXiaoWo: '96', Perler: '10', Hama: '10', Artkal: 'A10' },
  
  // 红色系
  '#FF0000': { MARD: 'R01', COCO: 'C01', ManMan: 'R1', PanPan: '5', MiXiaoWo: '5', Perler: '11', Hama: '11', Artkal: 'R01' },
  '#FD543D': { MARD: 'A14', COCO: 'C05', ManMan: 'B14', PanPan: '138', MiXiaoWo: '135', Perler: '14', Hama: '14', Artkal: 'R02' },
  '#FF0055': { MARD: 'R02', COCO: 'C02', ManMan: 'R2', PanPan: '6', MiXiaoWo: '6', Perler: '15', Hama: '15', Artkal: 'R03' },
  
  // 粉色系
  '#FFC0CB': { MARD: 'P01', COCO: 'K01', ManMan: 'P1', PanPan: '7', MiXiaoWo: '7', Perler: '16', Hama: '16', Artkal: 'P01' },
  '#FE9F72': { MARD: 'A12', COCO: 'K09', ManMan: 'A18', PanPan: '99', MiXiaoWo: '110', Perler: '17', Hama: '17', Artkal: 'P02' },
  '#FFB6C1': { MARD: 'P02', COCO: 'K02', ManMan: 'P2', PanPan: '8', MiXiaoWo: '8', Perler: '18', Hama: '18', Artkal: 'P03' },
  
  // 紫色系
  '#800080': { MARD: 'Z01', COCO: 'J01', ManMan: 'Z1', PanPan: '12', MiXiaoWo: '12', Perler: '19', Hama: '19', Artkal: 'Z01' },
  '#B843C5': { MARD: 'D05', COCO: 'J12', ManMan: 'D13', PanPan: '32', MiXiaoWo: '32', Perler: '20', Hama: '20', Artkal: 'Z02' },
  '#AC7BDE': { MARD: 'D06', COCO: 'J11', ManMan: 'D14', PanPan: '27', MiXiaoWo: '27', Perler: '21', Hama: '21', Artkal: 'Z03' },
  
  // 蓝色系
  '#0000FF': { MARD: 'L01', COCO: 'H01', ManMan: 'L1', PanPan: '13', MiXiaoWo: '13', Perler: '22', Hama: '22', Artkal: 'L01' },
  '#41CCFF': { MARD: 'C04', COCO: 'H05', ManMan: 'D3', PanPan: '77', MiXiaoWo: '82', Perler: '23', Hama: '23', Artkal: 'L02' },
  '#01ACEB': { MARD: 'C05', COCO: 'H07', ManMan: 'D7', PanPan: '34', MiXiaoWo: '34', Perler: '24', Hama: '24', Artkal: 'L03' },
  '#0F54C0': { MARD: 'C08', COCO: 'H14', ManMan: 'D9', PanPan: '52', MiXiaoWo: '71', Perler: '25', Hama: '25', Artkal: 'L04' },
  
  // 青色系
  '#00FFFF': { MARD: 'Q01', COCO: 'H02', ManMan: 'Q1', PanPan: '14', MiXiaoWo: '14', Perler: '26', Hama: '26', Artkal: 'Q01' },
  '#28DDDE': { MARD: 'C11', COCO: 'H10', ManMan: 'D28', PanPan: '122', MiXiaoWo: '113', Perler: '27', Hama: '27', Artkal: 'Q02' },
  
  // 绿色系
  '#00FF00': { MARD: 'G01', COCO: 'F01', ManMan: 'G1', PanPan: '15', MiXiaoWo: '15', Perler: '28', Hama: '28', Artkal: 'G01' },
  '#63F347': { MARD: 'B02', COCO: 'F08', ManMan: 'C2', PanPan: '33', MiXiaoWo: '33', Perler: '29', Hama: '29', Artkal: 'G02' },
  '#9EF780': { MARD: 'B03', COCO: 'F04', ManMan: 'C7', PanPan: '26', MiXiaoWo: '26', Perler: '30', Hama: '30', Artkal: 'G03' },
  '#5DE035': { MARD: 'B04', COCO: 'F09', ManMan: 'C3', PanPan: '66', MiXiaoWo: '78', Perler: '31', Hama: '31', Artkal: 'G04' },
  '#228B22': { MARD: 'G02', COCO: 'F11', ManMan: 'G2', PanPan: '16', MiXiaoWo: '16', Perler: '32', Hama: '32', Artkal: 'G05' },
  
  // 棕色系
  '#8B4513': { MARD: 'N01', COCO: 'B01', ManMan: 'N1', PanPan: '17', MiXiaoWo: '17', Perler: '33', Hama: '33', Artkal: 'N01' },
  '#A0522D': { MARD: 'N02', COCO: 'B02', ManMan: 'N2', PanPan: '18', MiXiaoWo: '18', Perler: '34', Hama: '34', Artkal: 'N02' },
  '#D2691E': { MARD: 'N03', COCO: 'B03', ManMan: 'N3', PanPan: '19', MiXiaoWo: '19', Perler: '35', Hama: '35', Artkal: 'N03' },
  
  // 黑色系
  '#000000': { MARD: 'K01', COCO: 'A01', ManMan: 'K1', PanPan: '20', MiXiaoWo: '20', Perler: '36', Hama: '36', Artkal: 'K01' },
  '#696969': { MARD: 'H01', COCO: 'A02', ManMan: 'H1', PanPan: '21', MiXiaoWo: '21', Perler: '37', Hama: '37', Artkal: 'H01' },
  '#808080': { MARD: 'H02', COCO: 'A03', ManMan: 'H2', PanPan: '22', MiXiaoWo: '22', Perler: '38', Hama: '38', Artkal: 'H02' },
  '#A9A9A9': { MARD: 'H03', COCO: 'A04', ManMan: 'H3', PanPan: '23', MiXiaoWo: '23', Perler: '39', Hama: '39', Artkal: 'H03' },
  
  // 肤色系
  '#FFDBAC': { MARD: 'S01', COCO: 'K05', ManMan: 'S1', PanPan: '24', MiXiaoWo: '24', Perler: '40', Hama: '40', Artkal: 'S01' },
  '#F5D7B1': { MARD: 'S02', COCO: 'K06', ManMan: 'S2', PanPan: '25', MiXiaoWo: '25', Perler: '41', Hama: '41', Artkal: 'S02' },
  '#E6C9B7': { MARD: 'A23', COCO: 'E12', ManMan: 'R08', PanPan: '274', MiXiaoWo: '259', Perler: '42', Hama: '42', Artkal: 'S03' },
  
  // 透明色
  'transparent': { MARD: 'T01', COCO: 'T01', ManMan: 'T1', PanPan: '0', MiXiaoWo: '0', Perler: '43', Hama: '43', Artkal: 'T01' },
};

/**
 * 获取所有可用的 HEX 颜色值
 */
export function getAllAvailableHexColors(): string[] {
  return Object.keys(BASE_COLOR_MAPPING);
}

/**
 * 获取色号系统的所有色号
 */
export function getAllColorKeys(system: BeadColorSystem): string[] {
  const keys: string[] = [];
  Object.values(BASE_COLOR_MAPPING).forEach(mapping => {
    if (mapping[system]) {
      keys.push(mapping[system]);
    }
  });
  return keys;
}

/**
 * 通过 HEX 值获取指定色号系统的色号
 */
export function getColorKeyByHex(hexValue: string, system: BeadColorSystem): string {
  const normalizedHex = hexValue.toUpperCase();
  const mapping = BASE_COLOR_MAPPING[normalizedHex];
  
  if (mapping && mapping[system]) {
    return mapping[system];
  }
  
  return '?'; // 找不到映射
}

/**
 * 通过色号反推 HEX 值
 */
export function getHexByColorKey(colorKey: string, system: BeadColorSystem): string {
  for (const [hex, mapping] of Object.entries(BASE_COLOR_MAPPING)) {
    if (mapping[system] === colorKey) {
      return hex;
    }
  }
  return '#000000'; // 默认黑色
}

/**
 * 验证颜色在指定色号系统中是否有效
 */
export function isValidColorInSystem(hexValue: string, system: BeadColorSystem): boolean {
  const mapping = BASE_COLOR_MAPPING[hexValue.toUpperCase()];
  return mapping && mapping[system] !== undefined && mapping[system] !== '?';
}

/**
 * 获取颜色的所有色号系统映射
 */
export function getAllColorSystemsForHex(hexValue: string): Record<BeadColorSystem, string> | null {
  return BASE_COLOR_MAPPING[hexValue.toUpperCase()] || null;
}

/**
 * 批量转换色板到指定色号系统
 */
export interface BeadColor {
  hex: string;
  key: string;
  count: number;
  percentage: number;
}

export function convertBeadPaletteToSystem(
  palette: BeadColor[],
  targetSystem: BeadColorSystem
): BeadColor[] {
  return palette.map(color => ({
    ...color,
    key: getColorKeyByHex(color.hex, targetSystem)
  }));
}

/**
 * 获取色号系统的显示名称
 */
export function getColorSystemDisplayName(system: BeadColorSystem): string {
  return beadColorSystemNames[system] || system;
}

/**
 * 智能推荐色号系统
 * 根据用户所在地区或使用习惯推荐
 */
export function recommendColorSystem(region?: string): BeadColorSystem {
  if (!region) {
    return 'MARD'; // 默认推荐 MARD
  }
  
  const regionLower = region.toLowerCase();
  
  if (regionLower.includes('us') || regionLower.includes('america')) {
    return 'Perler';
  } else if (regionLower.includes('eu') || regionLower.includes('europe') || regionLower.includes('denmark')) {
    return 'Hama';
  } else if (regionLower.includes('cn') || regionLower.includes('china')) {
    return 'MARD'; // 中国大陆推荐 MARD
  }
  
  return 'MARD';
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
 * 导出色板为购买清单
 */
export interface BeadShoppingItem {
  colorKey: string;
  colorName: string;
  hex: string;
  count: number;
  system: BeadColorSystem;
}

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
