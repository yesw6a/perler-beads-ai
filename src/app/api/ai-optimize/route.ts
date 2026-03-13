import { NextRequest, NextResponse } from 'next/server';
import { getAllAvailableHexColors, getColorKeyByHex } from '../../../utils/beadColorSystems';

// 阿里云百炼 API 配置 - 通义万相图片生成
const ALIBABA_API_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-to-image/image-synthesis';

// 从环境变量获取 API Key
const getApiKey = () => {
  const apiKey = process.env.ALIBABA_API_KEY || process.env.DASHSCOPE_API_KEY;

  if (!apiKey) {
    throw new Error('Missing ALIBABA_API_KEY or DASHSCOPE_API_KEY environment variable');
  }

  return apiKey;
};

// 从环境变量获取模型名称（默认 wanx-v1）
const getModelName = () => {
  return process.env.MODEL_NAME || 'wanx-v1';
};

// 从环境变量获取默认色号系统
const getDefaultColorSystem = () => {
  return process.env.DEFAULT_COLOR_SYSTEM || 'MARD';
};

// 提交任务到通义万相
async function submitTask(imageBase64: string, prompt: string) {
  const apiKey = getApiKey();
  const modelName = getModelName();

  // 提取纯 base64 数据
  const base64Data = imageBase64.includes(',')
    ? imageBase64.split(',')[1]
    : imageBase64;

  // 构建请求体 - 使用通义万相 API
  const requestBody = {
    model: modelName,
    input: {
      prompt: prompt,
      init_image: `data:image/png;base64,${base64Data}`,
      strength: 0.5  // 重绘强度，0-1 之间
    },
    parameters: {
      style: '<auto>',
      size: '1024*1024',
      n: 1
    }
  };

  const body = JSON.stringify(requestBody);

  // 构建 headers
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'X-DashScope-Async': 'enable'  // 启用异步任务
  };

  // 发送请求
  const response = await fetch(ALIBABA_API_URL, {
    method: 'POST',
    headers: headers,
    body: body
  });

  const responseText = await response.text();
  console.log('Alibaba Wanx API Response:', response.status, responseText);

  if (!response.ok) {
    try {
      const errorData = JSON.parse(responseText);
      const errorCode = errorData.code;
      const errorMessage = errorData.message || '';

      if (errorMessage.includes('risk') || errorMessage.includes('安全')) {
        throw new Error(`IMAGE_RISK: 图片未能通过安全检测，请尝试使用其他图片。`);
      }
      
      throw new Error(`API Error ${errorCode}: ${errorMessage}`);
    } catch (e) {
      if (e instanceof Error && (e.message.startsWith('API Error') || e.message.startsWith('IMAGE_RISK'))) {
        throw e;
      }
      throw new Error(`API request failed: ${response.status} ${responseText}`);
    }
  }

  const data = JSON.parse(responseText);
  return data;
}

// 查询任务结果
async function queryTask(taskId: string) {
  const apiKey = getApiKey();

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  };

  const response = await fetch(`https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`, {
    method: 'GET',
    headers: headers
  });

  const responseText = await response.text();
  console.log('Task Query Response:', response.status, responseText);

  if (!response.ok) {
    throw new Error(`Task query failed: ${response.status} ${responseText}`);
  }

  return JSON.parse(responseText);
}

// 轮询等待任务完成
async function waitForTaskCompletion(taskId: string, maxAttempts = 60, intervalMs = 3000): Promise<string> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    console.log(`Polling attempt ${attempt + 1}/${maxAttempts}...`);
    const result = await queryTask(taskId);

    if (result.output && result.output.task_status === 'SUCCEEDED') {
      // 任务成功，返回图片 URL
      if (result.output.results && result.output.results.length > 0) {
        return result.output.results[0].url;
      }
      throw new Error('Task completed but no image URL returned');
    } else if (result.output && result.output.task_status === 'FAILED') {
      const errorMessage = result.output.message || 'Task failed';
      if (errorMessage.includes('risk') || errorMessage.includes('安全')) {
        throw new Error(`IMAGE_RISK: 图片未能通过安全检测，请尝试使用其他图片。`);
      }
      throw new Error(`Task failed: ${errorMessage}`);
    }

    // 等待后重试
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }

  throw new Error('Task timeout: exceeded maximum polling attempts');
}

export async function POST(request: NextRequest) {
  try {
    const { imageBase64, prompt, colorSystem } = await request.json();

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'Missing imageBase64 parameter' },
        { status: 400 }
      );
    }

    if (!prompt) {
      return NextResponse.json(
        { error: 'Missing prompt parameter' },
        { status: 400 }
      );
    }

    // 使用请求中的色号系统或默认值
    const targetColorSystem = colorSystem || getDefaultColorSystem();
    
    // 获取所有可用的拼豆色号
    const availableColors = getAllAvailableHexColors();

    // 1. 提交任务
    console.log('Submitting AI image optimization task...');
    const submitResult = await submitTask(imageBase64, prompt);

    // 检查是否有 task_id（异步任务）
    let taskId = submitResult.output?.task_id;
    if (!taskId) {
      // 同步任务，直接返回结果
      if (submitResult.output && submitResult.output.results && submitResult.output.results.length > 0) {
        const imageUrl = submitResult.output.results[0].url;
        return NextResponse.json({
          success: true,
          imageUrl: imageUrl,
          model: getModelName()
        });
      }
      return NextResponse.json(
        { error: 'No task_id or results returned', details: submitResult },
        { status: 500 }
      );
    }

    console.log('Task submitted, ID:', taskId);

    // 2. 轮询等待任务完成
    const imageUrl = await waitForTaskCompletion(taskId);

    // 3. 返回结果
    return NextResponse.json({
      success: true,
      imageUrl: imageUrl,
      model: getModelName(),
      colorSystem: targetColorSystem,
      availableColors: availableColors.length,
      message: `AI 优化完成，已适配 ${targetColorSystem} 色号系统，共 ${availableColors.length} 种可用颜色`
    });

  } catch (error) {
    console.error('AI optimization error:', error);
    return NextResponse.json(
      {
        error: 'AI optimization failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
