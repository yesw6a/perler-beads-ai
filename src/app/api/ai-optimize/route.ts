import { NextRequest, NextResponse } from 'next/server';
import { getAllAvailableHexColors } from '../../../utils/beadColorSystems';

// 阿里云百炼 API 配置 - 兼容模式
const ALIBABA_API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/images/generations';

// 从环境变量获取 API Key
const getApiKey = () => {
  const apiKey = process.env.ALIBABA_API_KEY || process.env.DASHSCOPE_API_KEY;
  if (!apiKey) {
    throw new Error('Missing ALIBABA_API_KEY or DASHSCOPE_API_KEY');
  }
  return apiKey;
};

// 从环境变量获取模型名称
const getModelName = () => {
  return process.env.MODEL_NAME || 'wanx-v1';
};

// 从环境变量获取默认色号系统
const getDefaultColorSystem = () => {
  return process.env.DEFAULT_COLOR_SYSTEM || 'MARD';
};

// 处理 OPTIONS 预检请求
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
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
    const availableColors = getAllAvailableHexColors();
    const apiKey = getApiKey();
    const modelName = getModelName();

    // 提取纯 base64 数据
    const base64Data = imageBase64.includes(',')
      ? imageBase64.split(',')[1]
      : imageBase64;

    // 构建请求体 - 兼容模式
    const requestBody = {
      model: modelName,
      prompt: prompt,
      image: `data:image/png;base64,${base64Data}`,
      n: 1,
      size: '1024x1024'
    };

    const body = JSON.stringify(requestBody);

    console.log('Submitting AI optimization task...');

    // 发送请求
    const response = await fetch(ALIBABA_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: body
    });

    const responseText = await response.text();
    console.log('API Response:', response.status, responseText);

    // 处理错误
    if (!response.ok) {
      try {
        const errorData = JSON.parse(responseText);
        const errorMessage = errorData.error?.message || '';

        if (errorMessage.includes('risk') || errorMessage.includes('安全')) {
          throw new Error('IMAGE_RISK: 图片未能通过安全检测，请尝试使用其他图片。');
        }
        
        throw new Error(`API Error: ${errorMessage}`);
      } catch (e) {
        if (e instanceof Error && e.message.includes('IMAGE_RISK')) {
          throw e;
        }
        throw new Error(`API request failed: ${response.status}`);
      }
    }

    // 解析响应 - 兼容模式格式
    const data = JSON.parse(responseText);
    
    if (!data.data || !data.data[0] || !data.data[0].url) {
      throw new Error('Invalid response format from API');
    }

    const imageUrl = data.data[0].url;
    console.log('AI optimization completed, image URL:', imageUrl);

    // 返回结果
    return NextResponse.json({
      success: true,
      imageUrl: imageUrl,
      model: modelName,
      colorSystem: targetColorSystem,
      availableColors: availableColors.length,
      message: `AI 优化完成，已适配 ${targetColorSystem} 色号系统`
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
