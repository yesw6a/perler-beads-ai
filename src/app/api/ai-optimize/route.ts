import { NextRequest, NextResponse } from 'next/server';

// 阿里云百炼 API 配置 - 兼容模式
const ALIBABA_API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/images/generations';

const getApiKey = () => {
  const apiKey = process.env.ALIBABA_API_KEY || process.env.DASHSCOPE_API_KEY;
  if (!apiKey) {
    throw new Error('Missing ALIBABA_API_KEY or DASHSCOPE_API_KEY');
  }
  return apiKey;
};

const getModelName = () => {
  return process.env.MODEL_NAME || 'wanx-v1';
};

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { 
    status: 204,
    headers: corsHeaders 
  });
}

export async function POST(request: NextRequest) {
  // Add CORS headers to all responses
  const headers = new Headers(corsHeaders);
  
  try {
    const { imageBase64, prompt } = await request.json();

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'Missing imageBase64 parameter' },
        { status: 400, headers }
      );
    }

    if (!prompt) {
      return NextResponse.json(
        { error: 'Missing prompt parameter' },
        { status: 400, headers }
      );
    }

    const apiKey = getApiKey();
    const modelName = getModelName();

    const base64Data = imageBase64.includes(',')
      ? imageBase64.split(',')[1]
      : imageBase64;

    const requestBody = {
      model: modelName,
      prompt: prompt,
      image: `data:image/png;base64,${base64Data}`,
      n: 1,
      size: '1024x1024'
    };

    console.log('Submitting AI optimization task...');

    const response = await fetch(ALIBABA_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const responseText = await response.text();
    console.log('API Response:', response.status, responseText);

    if (!response.ok) {
      try {
        const errorData = JSON.parse(responseText);
        const errorMessage = errorData.error?.message || '';

        if (errorMessage.includes('risk') || errorMessage.includes('安全')) {
          throw new Error('图片未能通过安全检测，请尝试使用其他图片。');
        }
        
        throw new Error(`API Error: ${errorMessage}`);
      } catch (e) {
        if (e instanceof Error && e.message.includes('安全检测')) {
          throw e;
        }
        throw new Error(`API request failed: ${response.status}`);
      }
    }

    const data = JSON.parse(responseText);
    
    if (!data.data || !data.data[0] || !data.data[0].url) {
      throw new Error('Invalid response format from API');
    }

    const imageUrl = data.data[0].url;
    console.log('AI optimization completed');

    return NextResponse.json({
      success: true,
      imageUrl: imageUrl,
      model: modelName
    }, { headers });

  } catch (error) {
    console.error('AI optimization error:', error);
    return NextResponse.json(
      {
        error: 'AI optimization failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500, headers }
    );
  }
}
