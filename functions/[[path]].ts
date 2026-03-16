/**
 * Cloudflare Pages Function - AI 优化图片
 * 使用阿里云百炼 Qwen-Image 2.0 API
 * 
 * 安全说明：API Key 由客户端提供，不存储在服务器
 */

import { ExecutionContext } from '@cloudflare/workers-types';

// 阿里云百炼 API 配置 - wan2.6-image（异步任务模式）
// 文档：https://bailian.console.aliyun.com/cn-beijing/?tab=model#/model-market/detail/wan2.6-image
const ALIBABA_API_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/image-generation/generation';

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
  
  // 轮询端点
  if (url.pathname === '/api/ai-optimize/poll') {
    const searchParams = url.searchParams;
    const taskId = searchParams.get('taskId');
    if (!taskId) {
      return new Response(
        JSON.stringify({ error: 'Missing taskId parameter' }),
        { status: 400, headers: corsHeaders }
      );
    }
    
    // 从请求体获取 API Key（如果提供）
    const body = await request.json().catch(() => ({}));
    const apiKey = body.apiKey;
    
    // 如果没有 API Key，尝试从环境变量获取（部署时配置）
    const envApiKey = (context as any).env?.ALIBABA_API_KEY || (context as any).env?.DASHSCOPE_API_KEY;
    const finalApiKey = apiKey || envApiKey;
    
    if (!finalApiKey) {
      return new Response(
        JSON.stringify({ error: 'Missing API Key. Please provide apiKey in request body or configure ALIBABA_API_KEY environment variable.' }),
        { status: 400, headers: corsHeaders }
      );
    }
    
    return pollTaskResult(taskId, finalApiKey, corsHeaders);
  }
  
  // 图片代理端点（解决阿里云 OSS 跨域问题）
  if (url.pathname === '/api/image-proxy') {
    const searchParams = url.searchParams;
    const imageUrl = searchParams.get('url');
    
    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: 'Missing url parameter' }),
        { status: 400, headers: corsHeaders }
      );
    }
    
    // 验证 URL 是阿里云 OSS 域名
    if (!imageUrl.includes('dashscope') && !imageUrl.includes('aliyuncs.com')) {
      return new Response(
        JSON.stringify({ error: 'Only Aliyun OSS URLs are allowed' }),
        { status: 403, headers: corsHeaders }
      );
    }
    
    return proxyImageUrl(imageUrl, corsHeaders);
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

    // 使用 wan2.6-image（异步任务模式）
    const model = 'wan2.6-image';

    // 处理 Base64 数据
    const base64Data = imageBase64.includes(',')
      ? imageBase64.split(',')[1]
      : imageBase64;

    // wan2.6-image 请求格式（异步任务模式）
    // 文档：https://bailian.console.aliyun.com/cn-beijing/?tab=model#/model-market/detail/wan2.6-image
    const requestBody = {
      model: model,
      input: {
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                image: `data:image/png;base64,${base64Data}`
              },
              {
                type: 'text',
                text: prompt
              }
            ]
          }
        ]
      },
      parameters: {
        n: 1,
        size: '1024*1024',
        enable_interleave: true
      }
    };

    console.log('Submitting AI optimization task...');
    console.log('API URL:', ALIBABA_API_URL);
    console.log('Model:', model);

    // 调用阿里云百炼 API（带重试）
    let lastError: Error | null = null;
    let response: Response | null = null;
    
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`[Attempt ${attempt}] Calling: ${ALIBABA_API_URL}`);
        console.log('[Request] Model:', model);
        console.log('[Request] Prompt:', prompt.substring(0, 100) + '...');
        console.log('[Request] API Key:', apiKey.substring(0, 10) + '...');
        
        // 构建 fetch 选项（异步任务模式）
        const fetchOptions: RequestInit = {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'X-DashScope-Async': 'enable'  // 启用异步模式
          },
          body: JSON.stringify(requestBody)
        };
        
        console.log('[Fetch] Starting request...');
        
        response = await fetch(ALIBABA_API_URL, fetchOptions);
        
        console.log('[Fetch] Response status:', response.status);
        console.log('[Fetch] Response OK:', response.ok);
        
        if (response.ok) {
          console.log('[Fetch] Task submitted!');
          break;
        }
        
        // 克隆响应以便读取 body
        const errorResponse = response.clone();
        const errorText = await errorResponse.text();
        console.log(`[Attempt ${attempt}] Failed: HTTP ${response.status}`, errorText);
        lastError = new Error(`HTTP ${response.status}: ${errorText}`);
        
        // 等待一段时间后重试
        if (attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        lastError = error instanceof Error ? error : new Error('Network connection lost: ' + errorMsg);
        console.log(`[Attempt ${attempt}] Network error:`, errorMsg);
        console.log('[Error details]:', error);
        console.log('[Error type]:', typeof error);
        console.log('[Error constructor]:', error?.constructor?.name);
        
        if (attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, 3000 * attempt));
        }
      }
    }

    if (!response) {
      console.error('All attempts failed');
      const errorMsg = lastError?.message || 'Network connection lost';
      console.error('Final error:', errorMsg);
      
      return new Response(
        JSON.stringify({ 
          error: 'AI optimization failed',
          message: errorMsg + '. Please check: 1) API Key is valid, 2) Network connection, 3) Try again later',
          debug: lastError?.toString()
        }),
        { status: 500, headers }
      );
    }

    // 克隆响应以便多次读取
    const responseClone = response.clone();
    const responseText = await responseClone.text();
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
            JSON.stringify({ error: `Model not found: ${model}.` }),
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

    // 异步任务模式响应
    const data = JSON.parse(responseText);
    
    // wan2.6-image 返回 task_id
    if (!data.output || !data.output.task_id) {
      return new Response(
        JSON.stringify({ error: 'Invalid response format from API', raw: data }),
        { status: 500, headers }
      );
    }

    const taskId = data.output.task_id;
    console.log('Async task created:', taskId);

    // 轮询获取结果
    return await pollTaskResult(taskId, apiKey, headers);

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

// 轮询异步任务结果（wan2.6-image）
// 注意：Cloudflare Workers 超时限制为 10 秒（免费计划）
// 策略：快速轮询 5 次（10 秒），如果未完成，返回 task_id 让前端轮询
async function pollTaskResult(taskId: string, apiKey: string, headers: Headers): Promise<Response> {
  const taskUrl = `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`;
  
  console.log('Polling task result:', taskId);
  console.log('Task URL:', taskUrl);
  
  // 快速轮询 5 次（10 秒内）
  for (let attempt = 1; attempt <= 5; attempt++) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      console.log(`[Poll ${attempt}] Fetching task status...`);
      
      const response = await fetch(taskUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`[Poll ${attempt}] Response status:`, response.status);
      
      if (!response.ok) {
        console.log(`[Poll ${attempt}] Task query failed:`, response.status);
        continue;
      }
      
      const responseClone = response.clone();
      const data = await responseClone.json();
      
      console.log(`[Poll ${attempt}] Task status:`, data.output?.task_status);
      
      if (data.output?.task_status === 'SUCCEEDED') {
        // wan2.6-image 返回格式（新版 API）
        // 结构：output.choices[0].message.content[].image (图文混排)
        // 旧版：output.results[0].url 或 output.image?.url
        let imageUrl: string | undefined;
        
        // 1. 新版 API 结构（图文混排）- 优先检查
        if (data.output?.choices?.[0]?.message?.content) {
          const content = data.output.choices[0].message.content;
          const imageItem = content.find((item: any) => item?.type === 'image');
          imageUrl = imageItem?.image;
          if (imageUrl) {
            console.log('[Poll] Found image in choices[].message.content[]:', imageUrl);
          }
        }
        
        // 2. 旧版 API 结构（兼容）
        if (!imageUrl) {
          imageUrl = data.output?.results?.[0]?.url || data.output?.image?.url || data.output?.image;
        }
        
        if (!imageUrl) {
          console.log('[Poll] Task succeeded but no image URL found');
          console.log('[Poll] Full response:', JSON.stringify(data, null, 2));
          // 继续轮询，可能是数据同步延迟
          continue;
        }
        
        console.log('[Poll] Task completed! Image URL:', imageUrl);
        return new Response(
          JSON.stringify({
            success: true,
            imageUrl: imageUrl,
            model: 'wan2.6-image',
            taskId: taskId
          }),
          { status: 200, headers }
        );
      }
      
      if (data.output?.task_status === 'FAILED') {
        const errorMsg = data.output?.message || data.output?.error || 'Unknown error';
        console.log('[Poll] Task failed:', errorMsg);
        return new Response(
          JSON.stringify({ error: 'Task failed: ' + errorMsg }),
          { status: 500, headers }
        );
      }
      
      // 其他状态：PENDING, RUNNING 等，继续轮询
      console.log(`[Poll ${attempt}] Task still processing:`, data.output?.task_status);
      
    } catch (error) {
      console.log(`[Poll ${attempt}] Error:`, error instanceof Error ? error.message : error);
    }
  }
  
  // 10 秒内未完成，返回 task_id 让前端轮询
  console.log('[Poll] Task not completed within 10s, returning task_id for client-side polling');
  return new Response(
    JSON.stringify({
      success: false,
      pending: true,
      taskId: taskId,
      message: 'Task is still processing. Please poll again with the task_id.',
      pollUrl: `/api/ai-optimize/poll?taskId=${taskId}`
    }),
    { status: 202, headers }  // 202 Accepted
  );
}

// 图片代理函数（解决阿里云 OSS 跨域问题）
async function proxyImageUrl(imageUrl: string, headers: Record<string, string>): Promise<Response> {
  try {
    console.log('[Proxy] Fetching image:', imageUrl);
    
    // 从阿里云 OSS 获取图片
    const response = await fetch(imageUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'PerlerBeadsAI/1.0'
      }
    });
    
    if (!response.ok) {
      console.log('[Proxy] Failed to fetch image:', response.status);
      return new Response(
        JSON.stringify({ error: `Failed to fetch image: ${response.status}` }),
        { status: response.status, headers }
      );
    }
    
    // 获取图片内容
    const imageBlob = await response.blob();
    const contentType = response.headers.get('Content-Type') || 'image/png';
    
    console.log('[Proxy] Image fetched successfully:', contentType, imageBlob.size);
    
    // 返回给前端，添加 CORS 头
    return new Response(imageBlob, {
      status: 200,
      headers: {
        ...headers,
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',  // 缓存 1 天
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      }
    });
    
  } catch (error) {
    console.error('[Proxy] Error:', error instanceof Error ? error.message : error);
    return new Response(
      JSON.stringify({ error: 'Proxy error: ' + (error instanceof Error ? error.message : 'Unknown error') }),
      { status: 500, headers }
    );
  }
}
