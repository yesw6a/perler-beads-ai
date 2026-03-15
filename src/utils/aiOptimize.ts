// AI 图片优化工具函数

const DEFAULT_PROMPT = '图片修改为：chibi 画风，背景白底。pixel art style, 16-bit, retro game aesthetic, sharp focus, high contrast, clean lines, detailed pixel art, masterpiece, best quality';

export interface AIOptimizeOptions {
  customPrompt?: string;
  apiKey?: string;        // 运行时输入的 API Key
  modelName?: string;     // 运行时输入的模型名称
  onProgress?: (progress: number) => void;
}

export interface AIOptimizeResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
  pending?: boolean;  // 任务进行中
  taskId?: string;   // 异步任务 ID
  message?: string;  // 额外信息
}

/**
 * 压缩图片到指定尺寸
 */
function resizeImage(img: HTMLImageElement, maxWidth: number = 1024, maxHeight: number = 1024): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  let width = img.width;
  let height = img.height;

  // 计算缩放比例
  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    width = Math.floor(width * ratio);
    height = Math.floor(height * ratio);
  }

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // 使用更好的图像质量
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, height);

  return canvas;
}

/**
 * 将 Canvas 转换为 Base64 格式，控制文件大小
 */
function canvasToBase64(canvas: HTMLCanvasElement, maxSizeKB: number = 2048): string {
  // 首先尝试 PNG 格式（无损）
  let base64 = canvas.toDataURL('image/png');
  let sizeKB = Math.round((base64.length * 3) / 4 / 1024);

  console.log('Original image size:', sizeKB, 'KB');

  // 如果 PNG 太大，尝试 JPEG 格式并调整质量
  if (sizeKB > maxSizeKB) {
    let quality = 0.9;
    while (sizeKB > maxSizeKB && quality > 0.3) {
      base64 = canvas.toDataURL('image/jpeg', quality);
      sizeKB = Math.round((base64.length * 3) / 4 / 1024);
      console.log(`JPEG quality ${quality}:`, sizeKB, 'KB');
      quality -= 0.1;
    }
  }

  // 如果还是太大，缩小尺寸
  if (sizeKB > maxSizeKB) {
    const scale = Math.sqrt(maxSizeKB / sizeKB) * 0.9;
    const newWidth = Math.floor(canvas.width * scale);
    const newHeight = Math.floor(canvas.height * scale);

    console.log(`Resizing to ${newWidth}x${newHeight}`);

    const newCanvas = document.createElement('canvas');
    newCanvas.width = newWidth;
    newCanvas.height = newHeight;
    const newCtx = newCanvas.getContext('2d');

    if (!newCtx) {
      throw new Error('Failed to get canvas context');
    }

    newCtx.imageSmoothingEnabled = true;
    newCtx.imageSmoothingQuality = 'high';
    newCtx.drawImage(canvas, 0, 0, newWidth, newHeight);

    return canvasToBase64(newCanvas, maxSizeKB);
  }

  console.log('Final image size:', sizeKB, 'KB');
  return base64;
}

/**
 * 将图片转换为 Base64 格式（支持 Telegram 等 CDN 图片）
 */
export function imageToBase64(imageSrc: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // 允许跨域加载（支持 Telegram 等 CDN 图片）
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        console.log('Original image size:', img.width, 'x', img.height);

        // 压缩图片到合适尺寸
        const canvas = resizeImage(img, 1024, 1024);

        // 转换为 base64，控制大小在 2MB 以内（兼容模式限制）
        const base64 = canvasToBase64(canvas, 2048);

        console.log('Final base64 length:', base64.length);
        resolve(base64);
      } catch (error) {
        console.error('Image processing error:', error);
        reject(error);
      }
    };

    img.onerror = (err) => {
      console.error('Image load error:', err);
      // 如果跨域加载失败，尝试直接加载
      console.log('Trying without crossOrigin...');
      const img2 = new Image();
      img2.onload = () => {
        try {
          const canvas = resizeImage(img2, 1024, 1024);
          const base64 = canvasToBase64(canvas, 2048);
          resolve(base64);
        } catch (e) {
          reject(new Error('Failed to process image'));
        }
      };
      img2.onerror = () => {
        console.error('Image load failed completely');
        reject(new Error('Failed to load image from source. The image URL may be invalid or inaccessible.'));
      };
      img2.src = imageSrc;
    };

    img.src = imageSrc;
  });
}

/**
 * 调用 AI 优化 API
 */
export async function optimizeImageWithAI(
  imageSrc: string,
  options: AIOptimizeOptions = {}
): Promise<AIOptimizeResult> {
  try {
    const { customPrompt, apiKey, modelName, onProgress } = options;

    // 更新进度
    onProgress?.(10);

    // 将图片转换为 base64
    const base64Image = await imageToBase64(imageSrc);

    onProgress?.(30);

    // 调用 API
    const response = await fetch('/api/ai-optimize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        imageBase64: base64Image,
        prompt: customPrompt || DEFAULT_PROMPT,
        apiKey: apiKey || '',      // 运行时输入的 API Key
        modelName: modelName || 'qwen-image-2.0'  // 运行时输入的模型名称
      })
    });

    onProgress?.(80);

    if (!response.ok) {
      // 202 Accepted 表示任务进行中
      if (response.status === 202) {
        const result = await response.json();
        return {
          success: false,
          pending: true,
          taskId: result.taskId,
          message: result.message
        };
      }
      
      // 尝试解析 JSON 错误
      let errorMessage: string;
      try {
        const errorData = await response.clone().json();
        errorMessage = errorData.message || errorData.error || `API request failed: ${response.status}`;
      } catch {
        // 解析失败，使用状态码
        errorMessage = `API request failed: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();

    onProgress?.(100);

    if (result.success && result.imageUrl) {
      return {
        success: true,
        imageUrl: result.imageUrl
      };
    } else if (result.pending && result.taskId) {
      return {
        success: false,
        pending: true,
        taskId: result.taskId,
        message: result.message
      };
    } else {
      throw new Error(result.error || 'Unknown error');
    }

  } catch (error) {
    console.error('AI optimization error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'AI optimization failed'
    };
  }
}

/**
 * 下载远程图片并转换为 DataURL
 */
export async function downloadImageAsDataURL(imageUrl: string): Promise<string> {
  const response = await fetch(imageUrl);
  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert image to data URL'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
