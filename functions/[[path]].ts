/**
 * Cloudflare Pages Function - 路由处理器
 * 处理所有 /api/* 路由
 */

import { ExecutionContext } from '@cloudflare/workers-types';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// 处理 OPTIONS 请求 (CORS preflight)
export async function onRequestOptions(context: EventContext): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
}

// 处理 POST 请求
export async function onRequestPost(context: EventContext): Promise<Response> {
  const { request, env } = context;
  const url = new URL(request.url);
  
  // 路由到具体的 API 处理函数
  if (url.pathname === '/api/ai-optimize') {
    return handleAiOptimize(request, env);
  }
  
  return new Response(
    JSON.stringify({ error: 'Not found' }),
    { status: 404, headers: corsHeaders }
  );
}

// AI 优化处理函数
async function handleAiOptimize(request: Request, env: any): Promise<Response> {
  const headers = new Headers(corsHeaders);
  
  try {
    const { imageBase64, prompt } = await request.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: 'Missing imageBase64 parameter' }),
        { status: 400, headers }
      );
    }

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Missing prompt parameter' }),
        { status: 400, headers }
      );
    }

    // 从环境变量获取 API Key
    const apiKey = env.ALIBABA_API_KEY || env.DASHSCOPE_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Missing ALIBABA_API_KEY environment variable' }),
        { status: 500, headers }
      );
    }

    const modelName = env.MODEL_NAME || 'wanx-v1';

    // 阿里云百炼 API 端点 - OpenAI 兼容模式
    const ALIBABA_API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/images/generations';

    // 处理 Base64 数据
    const base64Data = imageBase64.includes(',')
      ? imageBase64.split(',')[1]
      : imageBase64;

    // 构建请求体
    const requestBody = {
      model: modelName,
      prompt: prompt,
      image: `data:image/png;base64,${base64Data}`,
      n: 1,
      size: '1024x1024'
    };

    console.log('Submitting AI optimization task...');

    // 调用阿里云百炼 API
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
          return new Response(
            JSON.stringify({ error: '图片未能通过安全检测，请尝试使用其他图片。' }),
            { status: 400, headers }
          );
        }
        
        return new Response(
          JSON.stringify({ error: `API Error: ${errorMessage}` }),
          { status: response.status, headers }
        );
      } catch (e) {
        return new Response(
          JSON.stringify({ error: `API request failed: ${response.status}` }),
          { status: response.status, headers }
        );
      }
    }

    const data = JSON.parse(responseText);
    
    if (!data.data || !data.data[0] || !data.data[0].url) {
      return new Response(
        JSON.stringify({ error: 'Invalid response format from API' }),
        { status: 500, headers }
      );
    }

    const imageUrl = data.data[0].url;
    console.log('AI optimization completed');

    return new Response(
      JSON.stringify({
        success: true,
        imageUrl: imageUrl,
        model: modelName
      }),
      { status: 200, headers }
    );

  } catch (error) {
    console.error('AI optimization error:', error);
    return new Response(
      JSON.stringify({
        error: 'AI optimization failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers }
    );
  }
}
