import colorSystemMapping from '../app/colorSystemMapping.json';

// 定义色号系统类型（参考 pindou-draw 设计）
export type ColorSystem = 
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

// 色号系统选项（参考 pindou-draw 设计）
export const colorSystemOptions = [
  { key: 'DMC', name: 'DMC (默认) (436 色)' },
  { key: 'Kaka', name: '卡卡家 (默认) (283 色)' },
  { key: 'ManMan', name: '漫漫家 (默认) (219 色)' },
  { key: 'PanPan', name: '盼盼拼豆 (默认) (221 色)' },
  { key: 'COCO', name: 'Coco (默认) (221 色)' },
  { key: 'MARD24', name: 'MARD 24 (默认) (24 色)' },
  { key: 'MARD48', name: 'MARD 48 (默认) (48 色)' },
  { key: 'MARD72', name: 'MARD 72 (默认) (72 色)' },
  { key: 'MARD96', name: 'MARD 96 (默认) (96 色)' },
  { key: 'MARD120', name: 'MARD 120 (默认) (120 色)' },
  { key: 'MARD144', name: 'MARD 144 (默认) (144 色)' },
  { key: 'MARD221', name: 'MARD 221 (默认) (221 色)' },
  { key: 'MARD295', name: 'MARD 295 (默认) (295 色)' },
];

// 类型定义
type ColorMapping = Record<string, Record<ColorSystem, string>>;
const typedColorSystemMapping = colorSystemMapping as ColorMapping;

// 获取所有可用的 hex 值
export function getAllHexValues(): string[] {
  return Object.keys(typedColorSystemMapping);
}

// 获取 MARD 色号到 Hex 的映射（用于向后兼容）
export function getMardToHexMapping(): Record<string, string> {
  const mapping: Record<string, string> = {};
  Object.entries(typedColorSystemMapping).forEach(([hex, colorData]) => {
    // 支持所有 MARD 色号系统
    (['MARD24', 'MARD48', 'MARD72', 'MARD96', 'MARD120', 'MARD144', 'MARD221', 'MARD295'] as ColorSystem[]).forEach(mardSystem => {
      const key = colorData[mardSystem];
      if (key) {
        mapping[key] = hex;
      }
    });
  });
  return mapping;
}

// 获取所有色号到 hex 值的映射
export function getColorSystemToHexMapping(colorSystem: ColorSystem): Record<string, string> {
  const mapping: Record<string, string> = {};
  Object.entries(typedColorSystemMapping).forEach(([hex, colorData]) => {
    const key = colorData[colorSystem];
    if (key) {
      mapping[key] = hex;
    }
  });
  return mapping;
}

// 从 colorSystemMapping.json 加载完整的颜色映射数据
export function loadFullColorMapping(): Map<string, Record<ColorSystem, string>> {
  const mapping = new Map<string, Record<ColorSystem, string>>();
  Object.entries(colorSystemMapping).forEach(([baseKey, colorData]) => {
    mapping.set(baseKey, colorData as Record<ColorSystem, string>);
  });
  return mapping;
}

// 将色板转换到指定色号系统
export function convertPaletteToColorSystem<T extends { hex: string; key: string }>(
  palette: T[],
  colorSystem: ColorSystem
): T[] {
  return palette.map(color => {
    const colorMapping = typedColorSystemMapping[color.hex];
    if (colorMapping && colorMapping[colorSystem]) {
      return {
        ...color,
        key: colorMapping[colorSystem]
      };
    }
    return color; // 如果找不到映射，保持原样
  });
}

// 获取指定色号系统的显示键
export function getDisplayColorKey(hexValue: string, colorSystem: ColorSystem): string {
  // 对于特殊键（如透明键），直接返回原键
  if (hexValue === 'ERASE' || hexValue.length === 0 || hexValue === '?') {
    return hexValue;
  }
  
  // 标准化 hex 值（确保大写）
  const normalizedHex = hexValue.toUpperCase();
  
  // 通过 hex 值从 colorSystemMapping 获取目标色号系统的值
  const colorMapping = typedColorSystemMapping[normalizedHex];
  if (colorMapping && colorMapping[colorSystem]) {
    return colorMapping[colorSystem];
  }
  
  return '?'; // 如果找不到映射，返回 '?'
}

// 将色号键转换到 hex 值（支持任意色号系统）
export function convertColorKeyToHex(displayKey: string, colorSystem: ColorSystem): string {
  // 如果已经是 hex 值，直接返回
  if (displayKey.startsWith('#') && displayKey.length === 7) {
    return displayKey.toUpperCase();
  }
  
  // 在 colorSystemMapping 中查找对应的 hex 值
  for (const [hex, mapping] of Object.entries(typedColorSystemMapping)) {
    if (mapping[colorSystem] === displayKey) {
      return hex;
    }
  }
  
  return displayKey; // 如果找不到映射，返回原键
}

// 验证颜色在指定系统中是否有效
export function isValidColorInSystem(hexValue: string, colorSystem: ColorSystem): boolean {
  const mapping = typedColorSystemMapping[hexValue];
  return mapping && mapping[colorSystem] !== undefined;
}

// 通过 hex 值获取指定色号系统的色号
export function getColorKeyByHex(hexValue: string, colorSystem: ColorSystem): string {
  // 标准化 hex 值（确保大写）
  const normalizedHex = hexValue.toUpperCase();
  
  // 查找映射
  const mapping = typedColorSystemMapping[normalizedHex];
  if (mapping && mapping[colorSystem]) {
    return mapping[colorSystem];
  }
  
  // 如果找不到映射，返回 '?'
  return '?';
}

// 将 hex 颜色转换为 HSL
function hexToHsl(hex: string): { h: number; s: number; l: number } {
  // 移除 # 符号
  const cleanHex = hex.replace('#', '');
  
  // 转换为 RGB
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (diff !== 0) {
    s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / diff + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / diff + 2) / 6;
        break;
      case b:
        h = ((r - g) / diff + 4) / 6;
        break;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

// 按色相排序颜色
export function sortColorsByHue<T extends { color: string }>(colors: T[]): T[] {
  return colors.slice().sort((a, b) => {
    const hslA = hexToHsl(a.color);
    const hslB = hexToHsl(b.color);
    
    // 首先按色相排序
    if (Math.abs(hslA.h - hslB.h) > 5) {
      return hslA.h - hslB.h;
    }
    
    // 色相相近时，按明度排序（从浅到深）
    if (Math.abs(hslA.l - hslB.l) > 3) {
      return hslB.l - hslA.l;
    }
    
    // 明度也相近时，按饱和度排序
    return hslB.s - hslA.s;
  });
}

// 获取色号系统的颜色数量
export function getColorSystemColorCount(colorSystem: ColorSystem): number {
  const colorKeys = new Set<string>();
  Object.values(typedColorSystemMapping).forEach(mapping => {
    if (mapping[colorSystem]) {
      colorKeys.add(mapping[colorSystem]);
    }
  });
  return colorKeys.size;
}

// 获取推荐色号系统（根据颜色数量）
export function getRecommendedColorSystem(colorCount: number): ColorSystem {
  if (colorCount <= 24) return 'MARD24';
  if (colorCount <= 48) return 'MARD48';
  if (colorCount <= 72) return 'MARD72';
  if (colorCount <= 96) return 'MARD96';
  if (colorCount <= 120) return 'MARD120';
  if (colorCount <= 144) return 'MARD144';
  if (colorCount <= 221) return 'MARD221';
  return 'MARD295';
}
