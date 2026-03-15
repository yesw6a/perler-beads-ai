/**
 * Cloudflare Pages Function - AI 优化图片
 * 使用阿里云百炼 Qwen-Image 2.0 API
 */

import { ExecutionContext } from '@cloudflare/workers-types';

// 阿里云百炼 API 配置 - Qwen-Image 2.0
// 文档：https://help.aliyun.com/zh/dashscope/developer-reference/qwen-vl-api
const ALIBABA_API_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/image-generation/generation';

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

// AI 优化处理函数（Qwen-Image 2.0 格式）
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
      console.error('Missing ALIBABA_API_KEY');
      return new Response(
        JSON.stringify({ error: 'Missing ALIBABA_API_KEY environment variable. Please configure it in Cloudflare Dashboard.' }),
        { status: 500, headers }
      );
    }

    const modelName = env.MODEL_NAME || 'qwen-image-2.0';

    // 处理 Base64 数据
    const base64Data = imageBase64.includes(',')
      ? imageBase64.split(',')[1]
      : imageBase64;

    // Qwen-Image 2.0 请求格式
    // 文档：https://help.aliyun.com/zh/dashscope/developer-reference/qwen-vl-api
    const requestBody = {
      model: modelName,
      input: {
        image: `data:image/png;base64,${base64Data}`,
        prompt: prompt
      },
      parameters: {
        style: '<auto>',
        size: '1024*1024',
        n: 1
      }
    };

    console.log('Submitting AI optimization task...');
    console.log('API URL:', ALIBABA_API_URL);
    console.log('Model:', modelName);

    // 调用阿里云百炼 API（带重试）
    let lastError: Error | null = null;
    let response: Response | null = null;
    
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        response = await fetch(ALIBABA_API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'X-DashScope-WorkSpace': 'default'
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
            JSON.stringify({ error: 'Invalid API Key. Please check your ALIBABA_API_KEY configuration.' }),
            { status: 401, headers }
          );
        }

        if (errorCode === 'ModelNotFound') {
          return new Response(
            JSON.stringify({ error: `Model not found: ${modelName}. Please use 'qwen-image-2.0' or 'qwen-vl-max'.'` }),
            { status: 400, headers }
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
    // {
    //   "output": {
    //     "task_id": "...",
    //     "task_status": "SUCCEEDED",
    //     "results": [
    //       {
    //         "url": "https://..."
    //       }
    //     ]
    //   }
    // }
    
    if (!data.output || !data.output.results || !data.output.results[0] || !data.output.results[0].url) {
      // 检查是否是异步任务
      if (data.output && data.output.task_id) {
        console.log('Async task created:', data.output.task_id);
        // 对于异步任务，需要轮询获取结果
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
