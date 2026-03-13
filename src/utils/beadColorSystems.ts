/**
 * 拼豆色号系统工具函数
 * 支持多个主流拼豆品牌的色号转换
 * 参考 pindou-draw 设计
 */

// 色号系统定义
export type BeadColorSystem = 
  | 'DMC'         // DMC (默认 436 色)
  | 'Kaka'        // 卡卡家 (283 色)
  | 'ManMan'      // 漫漫家 (219 色)
  | 'PanPan'      // 盼盼拼豆 (221 色)
  | 'COCO'        // Coco (221 色)
  | 'MARD24'      // MARD 24 色
  | 'MARD48'      // MARD 48 色
  | 'MARD72'      // MARD 72 色
  | 'MARD96'      // MARD 96 色
  | 'MARD120'     // MARD 120 色
  | 'MARD144'     // MARD 144 色
  | 'MARD221'     // MARD 221 色
  | 'MARD295';    // MARD 295 色

// 色卡系列配置
export interface ColorCardSeries {
  key: BeadColorSystem;
  name: string;
  colorCount: number;
  isDefault: boolean;
  description?: string;
}

// 色号系统配置
export const colorCardSeries: ColorCardSeries[] = [
  { key: 'DMC', name: 'DMC (默认)', colorCount: 436, isDefault: true, description: 'DMC 标准色卡，436 色' },
  { key: 'Kaka', name: '卡卡家', colorCount: 283, isDefault: false, description: '卡卡家拼豆色卡，283 色' },
  { key: 'ManMan', name: '漫漫家', colorCount: 219, isDefault: false, description: '漫漫家拼豆色卡，219 色' },
  { key: 'PanPan', name: '盼盼拼豆', colorCount: 221, isDefault: false, description: '盼盼拼豆色卡，221 色' },
  { key: 'COCO', name: 'Coco', colorCount: 221, isDefault: false, description: 'Coco 拼豆色卡，221 色' },
  { key: 'MARD24', name: 'MARD 24', colorCount: 24, isDefault: false, description: 'MARD 基础色卡，24 色' },
  { key: 'MARD48', name: 'MARD 48', colorCount: 48, isDefault: false, description: 'MARD 进阶色卡，48 色' },
  { key: 'MARD72', name: 'MARD 72', colorCount: 72, isDefault: false, description: 'MARD 专业色卡，72 色' },
  { key: 'MARD96', name: 'MARD 96', colorCount: 96, isDefault: false, description: 'MARD 高级色卡，96 色' },
  { key: 'MARD120', name: 'MARD 120', colorCount: 120, isDefault: false, description: 'MARD 大师色卡，120 色' },
  { key: 'MARD144', name: 'MARD 144', colorCount: 144, isDefault: false, description: 'MARD 专家色卡，144 色' },
  { key: 'MARD221', name: 'MARD 221', colorCount: 221, isDefault: false, description: 'MARD 专业色卡，221 色' },
  { key: 'MARD295', name: 'MARD 295', colorCount: 295, isDefault: false, description: 'MARD 完整色卡，295 色' },
];

// 获取默认色卡系统
export function getDefaultColorSystem(): BeadColorSystem {
  const defaultSeries = colorCardSeries.find(s => s.isDefault);
  return defaultSeries?.key || 'DMC';
}

// 获取色卡系统显示名称
export function getColorSystemDisplayName(system: BeadColorSystem): string {
  const series = colorCardSeries.find(s => s.key === system);
  return series?.name || system;
}

// 获取色卡系统颜色数量
export function getColorSystemColorCount(system: BeadColorSystem): number {
  const series = colorCardSeries.find(s => s.key === system);
  return series?.colorCount || 0;
}

// 获取所有色卡系统选项（用于 UI 选择）
export function getColorSystemOptions(): ColorCardSeries[] {
  return colorCardSeries;
}

// 获取推荐色卡系统（根据颜色数量）
export function getRecommendedColorSystem(colorCount: number): BeadColorSystem {
  if (colorCount <= 24) return 'MARD24';
  if (colorCount <= 48) return 'MARD48';
  if (colorCount <= 72) return 'MARD72';
  if (colorCount <= 96) return 'MARD96';
  if (colorCount <= 120) return 'MARD120';
  if (colorCount <= 144) return 'MARD144';
  if (colorCount <= 221) return 'MARD221';
  if (colorCount <= 295) return 'MARD295';
  return 'DMC'; // 超过 295 色使用 DMC
}

// 基础色号映射数据（HEX -> 各品牌色号）
// 这里包含部分常用颜色作为示例，完整数据应该从 colorSystemMapping.json 加载
const BASE_COLOR_MAPPING: Record<string, Record<BeadColorSystem, string>> = {
  // 白色系
  '#FFFFFF': { DMC: 'W01', Kaka: 'K01', ManMan: 'M01', PanPan: 'P01', COCO: 'C01', MARD24: 'M01', MARD48: 'M01', MARD72: 'M01', MARD96: 'M01', MARD120: 'M01', MARD144: 'M01', MARD221: 'M01', MARD295: 'M01' },
  '#FFFFD5': { DMC: 'W02', Kaka: 'K02', ManMan: 'M02', PanPan: 'P02', COCO: 'C02', MARD24: 'M02', MARD48: 'M02', MARD72: 'M02', MARD96: 'M02', MARD120: 'M02', MARD144: 'M02', MARD221: 'M02', MARD295: 'M02' },
  '#FEFF8B': { DMC: 'Y01', Kaka: 'K03', ManMan: 'M03', PanPan: 'P03', COCO: 'C03', MARD24: 'M03', MARD48: 'M03', MARD72: 'M03', MARD96: 'M03', MARD120: 'M03', MARD144: 'M03', MARD221: 'M03', MARD295: 'M03' },
  '#FBED56': { DMC: 'Y02', Kaka: 'K04', ManMan: 'M04', PanPan: 'P04', COCO: 'C04', MARD24: 'M04', MARD48: 'M04', MARD72: 'M04', MARD96: 'M04', MARD120: 'M04', MARD144: 'M04', MARD221: 'M04', MARD295: 'M04' },
  
  // 黄色系
  '#F4D738': { DMC: 'Y03', Kaka: 'K05', ManMan: 'M05', PanPan: 'P05', COCO: 'C05', MARD24: 'M05', MARD48: 'M05', MARD72: 'M05', MARD96: 'M05', MARD120: 'M05', MARD144: 'M05', MARD221: 'M05', MARD295: 'M05' },
  '#FEAC4C': { DMC: 'O01', Kaka: 'K06', ManMan: 'M06', PanPan: 'P06', COCO: 'C06', MARD24: 'M06', MARD48: 'M06', MARD72: 'M06', MARD96: 'M06', MARD120: 'M06', MARD144: 'M06', MARD221: 'M06', MARD295: 'M06' },
  '#FE8B4C': { DMC: 'O02', Kaka: 'K07', ManMan: 'M07', PanPan: 'P07', COCO: 'C07', MARD24: 'M07', MARD48: 'M07', MARD72: 'M07', MARD96: 'M07', MARD120: 'M07', MARD144: 'M07', MARD221: 'M07', MARD295: 'M07' },
  
  // 橙色系
  '#FF995B': { DMC: 'O03', Kaka: 'K08', ManMan: 'M08', PanPan: 'P08', COCO: 'C08', MARD24: 'M08', MARD48: 'M08', MARD72: 'M08', MARD96: 'M08', MARD120: 'M08', MARD144: 'M08', MARD221: 'M08', MARD295: 'M08' },
  '#F77C31': { DMC: 'O04', Kaka: 'K09', ManMan: 'M09', PanPan: 'P09', COCO: 'C09', MARD24: 'M09', MARD48: 'M09', MARD72: 'M09', MARD96: 'M09', MARD120: 'M09', MARD144: 'M09', MARD221: 'M09', MARD295: 'M09' },
  
  // 红色系
  '#FF0000': { DMC: 'R01', Kaka: 'K10', ManMan: 'M10', PanPan: 'P10', COCO: 'C10', MARD24: 'M10', MARD48: 'M10', MARD72: 'M10', MARD96: 'M10', MARD120: 'M10', MARD144: 'M10', MARD221: 'M10', MARD295: 'M10' },
  '#FD543D': { DMC: 'R02', Kaka: 'K11', ManMan: 'M11', PanPan: 'P11', COCO: 'C11', MARD24: 'M11', MARD48: 'M11', MARD72: 'M11', MARD96: 'M11', MARD120: 'M11', MARD144: 'M11', MARD221: 'M11', MARD295: 'M11' },
  '#FF0055': { DMC: 'R03', Kaka: 'K12', ManMan: 'M12', PanPan: 'P12', COCO: 'C12', MARD24: 'M12', MARD48: 'M12', MARD72: 'M12', MARD96: 'M12', MARD120: 'M12', MARD144: 'M12', MARD221: 'M12', MARD295: 'M12' },
  
  // 粉色系
  '#FFC0CB': { DMC: 'P01', Kaka: 'K13', ManMan: 'M13', PanPan: 'P13', COCO: 'C13', MARD24: 'M13', MARD48: 'M13', MARD72: 'M13', MARD96: 'M13', MARD120: 'M13', MARD144: 'M13', MARD221: 'M13', MARD295: 'M13' },
  '#FE9F72': { DMC: 'P02', Kaka: 'K14', ManMan: 'M14', PanPan: 'P14', COCO: 'C14', MARD24: 'M14', MARD48: 'M14', MARD72: 'M14', MARD96: 'M14', MARD120: 'M14', MARD144: 'M14', MARD221: 'M14', MARD295: 'M14' },
  '#FFB6C1': { DMC: 'P03', Kaka: 'K15', ManMan: 'M15', PanPan: 'P15', COCO: 'C15', MARD24: 'M15', MARD48: 'M15', MARD72: 'M15', MARD96: 'M15', MARD120: 'M15', MARD144: 'M15', MARD221: 'M15', MARD295: 'M15' },
  
  // 紫色系
  '#800080': { DMC: 'Z01', Kaka: 'K16', ManMan: 'M16', PanPan: 'P16', COCO: 'C16', MARD24: 'M16', MARD48: 'M16', MARD72: 'M16', MARD96: 'M16', MARD120: 'M16', MARD144: 'M16', MARD221: 'M16', MARD295: 'M16' },
  '#B843C5': { DMC: 'Z02', Kaka: 'K17', ManMan: 'M17', PanPan: 'P17', COCO: 'C17', MARD24: 'M17', MARD48: 'M17', MARD72: 'M17', MARD96: 'M17', MARD120: 'M17', MARD144: 'M17', MARD221: 'M17', MARD295: 'M17' },
  '#AC7BDE': { DMC: 'Z03', Kaka: 'K18', ManMan: 'M18', PanPan: 'P18', COCO: 'C18', MARD24: 'M18', MARD48: 'M18', MARD72: 'M18', MARD96: 'M18', MARD120: 'M18', MARD144: 'M18', MARD221: 'M18', MARD295: 'M18' },
  
  // 蓝色系
  '#0000FF': { DMC: 'L01', Kaka: 'K19', ManMan: 'M19', PanPan: 'P19', COCO: 'C19', MARD24: 'M19', MARD48: 'M19', MARD72: 'M19', MARD96: 'M19', MARD120: 'M19', MARD144: 'M19', MARD221: 'M19', MARD295: 'M19' },
  '#41CCFF': { DMC: 'L02', Kaka: 'K20', ManMan: 'M20', PanPan: 'P20', COCO: 'C20', MARD24: 'M20', MARD48: 'M20', MARD72: 'M20', MARD96: 'M20', MARD120: 'M20', MARD144: 'M20', MARD221: 'M20', MARD295: 'M20' },
  '#01ACEB': { DMC: 'L03', Kaka: 'K21', ManMan: 'M21', PanPan: 'P21', COCO: 'C21', MARD24: 'M21', MARD48: 'M21', MARD72: 'M21', MARD96: 'M21', MARD120: 'M21', MARD144: 'M21', MARD221: 'M21', MARD295: 'M21' },
  '#0F54C0': { DMC: 'L04', Kaka: 'K22', ManMan: 'M22', PanPan: 'P22', COCO: 'C22', MARD24: 'M22', MARD48: 'M22', MARD72: 'M22', MARD96: 'M22', MARD120: 'M22', MARD144: 'M22', MARD221: 'M22', MARD295: 'M22' },
  
  // 青色系
  '#00FFFF': { DMC: 'Q01', Kaka: 'K23', ManMan: 'M23', PanPan: 'P23', COCO: 'C23', MARD24: 'M23', MARD48: 'M23', MARD72: 'M23', MARD96: 'M23', MARD120: 'M23', MARD144: 'M23', MARD221: 'M23', MARD295: 'M23' },
  '#28DDDE': { DMC: 'Q02', Kaka: 'K24', ManMan: 'M24', PanPan: 'P24', COCO: 'C24', MARD24: 'M24', MARD48: 'M24', MARD72: 'M24', MARD96: 'M24', MARD120: 'M24', MARD144: 'M24', MARD221: 'M24', MARD295: 'M24' },
  
  // 绿色系
  '#00FF00': { DMC: 'G01', Kaka: 'K25', ManMan: 'M25', PanPan: 'P25', COCO: 'C25', MARD24: 'M25', MARD48: 'M25', MARD72: 'M25', MARD96: 'M25', MARD120: 'M25', MARD144: 'M25', MARD221: 'M25', MARD295: 'M25' },
  '#63F347': { DMC: 'G02', Kaka: 'K26', ManMan: 'M26', PanPan: 'P26', COCO: 'C26', MARD24: 'M26', MARD48: 'M26', MARD72: 'M26', MARD96: 'M26', MARD120: 'M26', MARD144: 'M26', MARD221: 'M26', MARD295: 'M26' },
  '#9EF780': { DMC: 'G03', Kaka: 'K27', ManMan: 'M27', PanPan: 'P27', COCO: 'C27', MARD24: 'M27', MARD48: 'M27', MARD72: 'M27', MARD96: 'M27', MARD120: 'M27', MARD144: 'M27', MARD221: 'M27', MARD295: 'M27' },
  '#5DE035': { DMC: 'G04', Kaka: 'K28', ManMan: 'M28', PanPan: 'P28', COCO: 'C28', MARD24: 'M28', MARD48: 'M28', MARD72: 'M28', MARD96: 'M28', MARD120: 'M28', MARD144: 'M28', MARD221: 'M28', MARD295: 'M28' },
  '#228B22': { DMC: 'G05', Kaka: 'K29', ManMan: 'M29', PanPan: 'P29', COCO: 'C29', MARD24: 'M29', MARD48: 'M29', MARD72: 'M29', MARD96: 'M29', MARD120: 'M29', MARD144: 'M29', MARD221: 'M29', MARD295: 'M29' },
  
  // 棕色系
  '#8B4513': { DMC: 'N01', Kaka: 'K30', ManMan: 'M30', PanPan: 'P30', COCO: 'C30', MARD24: 'M30', MARD48: 'M30', MARD72: 'M30', MARD96: 'M30', MARD120: 'M30', MARD144: 'M30', MARD221: 'M30', MARD295: 'M30' },
  '#A0522D': { DMC: 'N02', Kaka: 'K31', ManMan: 'M31', PanPan: 'P31', COCO: 'C31', MARD24: 'M31', MARD48: 'M31', MARD72: 'M31', MARD96: 'M31', MARD120: 'M31', MARD144: 'M31', MARD221: 'M31', MARD295: 'M31' },
  '#D2691E': { DMC: 'N03', Kaka: 'K32', ManMan: 'M32', PanPan: 'P32', COCO: 'C32', MARD24: 'M32', MARD48: 'M32', MARD72: 'M32', MARD96: 'M32', MARD120: 'M32', MARD144: 'M32', MARD221: 'M32', MARD295: 'M32' },
  
  // 黑色系
  '#000000': { DMC: 'K01', Kaka: 'K33', ManMan: 'M33', PanPan: 'P33', COCO: 'C33', MARD24: 'M33', MARD48: 'M33', MARD72: 'M33', MARD96: 'M33', MARD120: 'M33', MARD144: 'M33', MARD221: 'M33', MARD295: 'M33' },
  '#696969': { DMC: 'H01', Kaka: 'K34', ManMan: 'M34', PanPan: 'P34', COCO: 'C34', MARD24: 'M34', MARD48: 'M34', MARD72: 'M34', MARD96: 'M34', MARD120: 'M34', MARD144: 'M34', MARD221: 'M34', MARD295: 'M34' },
  '#808080': { DMC: 'H02', Kaka: 'K35', ManMan: 'M35', PanPan: 'P35', COCO: 'C35', MARD24: 'M35', MARD48: 'M35', MARD72: 'M35', MARD96: 'M35', MARD120: 'M35', MARD144: 'M35', MARD221: 'M35', MARD295: 'M35' },
  '#A9A9A9': { DMC: 'H03', Kaka: 'K36', ManMan: 'M36', PanPan: 'P36', COCO: 'C36', MARD24: 'M36', MARD48: 'M36', MARD72: 'M36', MARD96: 'M36', MARD120: 'M36', MARD144: 'M36', MARD221: 'M36', MARD295: 'M36' },
  
  // 肤色系
  '#FFDBAC': { DMC: 'S01', Kaka: 'K37', ManMan: 'M37', PanPan: 'P37', COCO: 'C37', MARD24: 'M37', MARD48: 'M37', MARD72: 'M37', MARD96: 'M37', MARD120: 'M37', MARD144: 'M37', MARD221: 'M37', MARD295: 'M37' },
  '#F5D7B1': { DMC: 'S02', Kaka: 'K38', ManMan: 'M38', PanPan: 'P38', COCO: 'C38', MARD24: 'M38', MARD48: 'M38', MARD72: 'M38', MARD96: 'M38', MARD120: 'M38', MARD144: 'M38', MARD221: 'M38', MARD295: 'M38' },
  '#E6C9B7': { DMC: 'S03', Kaka: 'K39', ManMan: 'M39', PanPan: 'P39', COCO: 'C39', MARD24: 'M39', MARD48: 'M39', MARD72: 'M39', MARD96: 'M39', MARD120: 'M39', MARD144: 'M39', MARD221: 'M39', MARD295: 'M39' },
  
  // 透明色
  'transparent': { DMC: 'T01', Kaka: 'K40', ManMan: 'M40', PanPan: 'P40', COCO: 'C40', MARD24: 'M40', MARD48: 'M40', MARD72: 'M40', MARD96: 'M40', MARD120: 'M40', MARD144: 'M40', MARD221: 'M40', MARD295: 'M40' },
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
