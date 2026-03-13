import { NextRequest, NextResponse } from 'next/server';

// 阿里云百炼 API 配置
const ALIBABA_API_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';

// 从环境变量获取 API Key
const getApiKey = () => {
  const apiKey = process.env.ALIBABA_API_KEY || process.env.DASHSCOPE_API_KEY;

  if (!apiKey) {
    throw new Error('Missing ALIBABA_API_KEY or DASHSCOPE_API_KEY environment variable');
  }

  return apiKey;
};

// 从环境变量获取模型名称（默认 qwen-vl-max）
const getModelName = () => {
  return process.env.MODEL_NAME || 'qwen-vl-max';
};

// 提交任务到阿里云百炼
async function submitTask(imageBase64: string, prompt: string) {
  const apiKey = getApiKey();

  // 提取纯 base64 数据（去掉 data:image/png;base64,前缀）
  const base64Data = imageBase64.includes(',')
    ? imageBase64.split(',')[1]
    : imageBase64;

  // 构建请求体 - 使用环境变量配置的模型
  const modelName = getModelName();
  const requestBody = {
    model: modelName,
    input: {
      messages: [
        {
          role: 'user',
          content: [
            {
              image: `data:image/png;base64,${base64Data}`
            },
            {
              text: prompt
            }
          ]
        }
      ]
    },
    parameters: {
      temperature: 0.7,
      max_tokens: 2048
    }
  };

  const body = JSON.stringify(requestBody);

  // 构建 headers
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  };

  // 发送请求
  const response = await fetch(ALIBABA_API_URL, {
    method: 'POST',
    headers: headers,
    body: body
  });

  const responseText = await response.text();
  console.log('Alibaba API Response:', response.status, responseText);

  if (!response.ok) {
    // 尝试解析错误信息
    try {
      const errorData = JSON.parse(responseText);
      const errorCode = errorData.code;
      const errorMessage = errorData.message || '';

      // 图片风险检测
      if (errorMessage.includes('risk') || errorMessage.includes('安全')) {
        throw new Error(`IMAGE_RISK: 图片未能通过安全检测，请尝试使用其他图片。`);
      }
      
      throw new Error(`API Error ${errorCode}: ${errorMessage}`);
    } catch (e) {
      if (e instanceof Error && e.message.startsWith('API Error') || e.message.startsWith('IMAGE_RISK')) {
        throw e;
      }
      throw new Error(`API request failed: ${response.status} ${responseText}`);
    }
  }

  // 解析响应数据
  const data = JSON.parse(responseText);
  
  // 检查业务错误
  if (data.output && data.output.choices && data.output.choices.length > 0) {
    return data;
  }
  
  throw new Error('Invalid response format from API');
}

export async function POST(request: NextRequest) {
  try {
    const { imageBase64, prompt } = await request.json();

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

    // 调用阿里云百炼 API
    console.log('Submitting AI optimization task to Alibaba...');
    const result = await submitTask(imageBase64, prompt);

    // 提取生成的文本
    const generatedText = result.output?.choices?.[0]?.message?.content || '';

    if (!generatedText) {
      return NextResponse.json(
        { error: 'No content generated', details: result },
        { status: 500 }
      );
    }

    console.log('AI optimization completed');

    // 返回结果
    return NextResponse.json({
      success: true,
      result: generatedText,
      model: modelName
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
