/**
 * Cloudflare Pages Function - AI 优化图片
 * 使用阿里云百炼 Qwen-Image 2.0 API
 * 
 * 安全说明：API Key 由客户端提供，不存储在服务器
 */

import { ExecutionContext } from '@cloudflare/workers-types';

// 阿里云百炼 API 配置 - 通义万相 wanx-v1（支持 Base64）
// 文档：https://help.aliyun.com/zh/dashscope/developer-reference/wanx-api
const ALIBABA_API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/images/generations';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key, X-Model-Name',
  'Access-Control-Allow-Credentials': 'true',
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
  const { request } = context;
  const url = new URL(request.url);
  
  // 路由到具体的 API 处理函数
  if (url.pathname === '/api/ai-optimize') {
    return handleAiOptimize(request);
  }
  
  return new Response(
    JSON.stringify({ error: 'Not found' }),
    { status: 404, headers: corsHeaders }
  );
}

// AI 优化处理函数
async function handleAiOptimize(request: Request): Promise<Response> {
  const headers = new Headers(corsHeaders);
  
  try {
    const { imageBase64, prompt, apiKey, modelName } = await request.json();

    // 验证必需参数
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

    // ⭐ 从请求体获取 API Key（运行时输入）
    if (!apiKey) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing API Key',
          message: 'Please provide your Alibaba API Key in the request body'
        }),
        { status: 401, headers }
      );
    }

    // 验证 API Key 格式
    if (!apiKey.startsWith('sk-')) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid API Key format',
          message: 'API Key should start with "sk-"'
        }),
        { status: 401, headers }
      );
    }

    // 默认模型 - wan2.6-image（支持 Base64）
    const model = modelName || 'wan2.6-image';

    // 处理 Base64 数据
    const base64Data = imageBase64.includes(',')
      ? imageBase64.split(',')[1]
      : imageBase64;

    // wan2.6-image 请求格式（OpenAI 兼容模式）
    const requestBody = {
      model: model,
      prompt: prompt,
      image: `data:image/png;base64,${base64Data}`,  // 支持 Base64 data URI
      n: 1,
      size: '1024x1024'
    };

    console.log('Submitting AI optimization task...');
    console.log('API URL:', ALIBABA_API_URL);
    console.log('Model:', model);

    // 调用阿里云百炼 API（带重试）
    let lastError: Error | null = null;
    let response: Response | null = null;
    
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        response = await fetch(ALIBABA_API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });
        
        if (response.ok) {
          break;
        }
        
        lastError = new Error(`HTTP ${response.status}`);
        console.log(`Attempt ${attempt} failed: HTTP ${response.status}`);
        
        // 等待一段时间后重试
        if (attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        console.log(`Attempt ${attempt} failed:`, lastError.message);
        
        if (attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
        }
      }
    }

    if (!response) {
      console.error('All attempts failed');
      return new Response(
        JSON.stringify({ 
          error: 'AI optimization failed',
          message: lastError?.message || 'Network connection lost. Please check your API key and try again.'
        }),
        { status: 500, headers }
      );
    }

    const responseText = await response.text();
    console.log('API Response:', response.status, responseText);

    if (!response.ok) {
      try {
        const errorData = JSON.parse(responseText);
        const errorMessage = errorData.message || errorData.error?.message || '';
        const errorCode = errorData.code || errorData.error?.code || '';

        if (errorMessage.includes('risk') || errorMessage.includes('安全')) {
          return new Response(
            JSON.stringify({ error: '图片未能通过安全检测，请尝试使用其他图片。' }),
            { status: 400, headers }
          );
        }
        
        if (errorMessage.includes('invalid') || errorMessage.includes('Invalid') || errorCode === 'InvalidApiKey') {
          return new Response(
            JSON.stringify({ 
              error: 'Invalid API Key',
              message: 'Please check your API Key. It should be a valid Alibaba Cloud API Key starting with "sk-".'
            }),
            { status: 401, headers }
          );
        }

        if (errorCode === 'ModelNotFound') {
          return new Response(
            JSON.stringify({ error: `Model not found: ${model}. Please use 'qwen-image-2.0' or 'qwen-vl-max'.` }),
            { status: 400, headers }
          );
        }

        if (errorCode === 'QuotaExhausted') {
          return new Response(
            JSON.stringify({ error: 'API Quota exhausted. Please check your Alibaba Cloud account.' }),
            { status: 429, headers }
          );
        }
        
        return new Response(
          JSON.stringify({ error: `API Error (${errorCode}): ${errorMessage}` }),
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
    
    // Qwen-Image 2.0 响应格式
    if (!data.output || !data.output.results || !data.output.results[0] || !data.output.results[0].url) {
      // 检查是否是异步任务
      if (data.output && data.output.task_id) {
        console.log('Async task created:', data.output.task_id);
        return await pollTaskResult(data.output.task_id, apiKey, headers);
      }
      
      return new Response(
        JSON.stringify({ error: 'Invalid response format from API', raw: data }),
        { status: 500, headers }
      );
    }

    const imageUrl = data.output.results[0].url;
    console.log('AI optimization completed');

    return new Response(
      JSON.stringify({
        success: true,
        imageUrl: imageUrl,
        model: model
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

// 轮询异步任务结果
async function pollTaskResult(taskId: string, apiKey: string, headers: Headers): Promise<Response> {
  const taskUrl = `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`;
  
  console.log('Polling task result:', taskId);
  
  for (let attempt = 1; attempt <= 30; attempt++) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      const response = await fetch(taskUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      console.log(`Task status (attempt ${attempt}):`, data.output?.task_status);
      
      if (data.output?.task_status === 'SUCCEEDED') {
        const imageUrl = data.output.results[0].url;
        return new Response(
          JSON.stringify({
            success: true,
            imageUrl: imageUrl,
            model: 'qwen-image-2.0'
          }),
          { status: 200, headers }
        );
      }
      
      if (data.output?.task_status === 'FAILED') {
        return new Response(
          JSON.stringify({ error: 'Task failed: ' + (data.output?.message || 'Unknown error') }),
          { status: 500, headers }
        );
      }
      
    } catch (error) {
      console.log('Poll error:', error.message);
    }
  }
  
  return new Response(
    JSON.stringify({ error: 'Task timeout. Please try again.' }),
    { status: 504, headers }
  );
}
