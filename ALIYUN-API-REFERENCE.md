# 阿里云百炼 API 参考文档

**整理时间**: 2026-03-15 22:50
**来源**: https://help.aliyun.com/zh/model-studio/

---

## 📖 官方文档链接

- **文本生成模型概述**: https://help.aliyun.com/zh/model-studio/text-generation
- **图像与视频理解**: https://help.aliyun.com/zh/model-studio/vision
- **异步调用模型**: https://help.aliyun.com/zh/model-studio/async-inference
- **API 参考**: https://help.aliyun.com/zh/model-studio/qwen-api-reference

---

## 🔑 API 调用基础

### API 端点
```
https://dashscope.aliyuncs.com/compatible-mode/v1
```

### 认证方式
```
Authorization: Bearer $DASHSCOPE_API_KEY
```

### 请求格式
```json
{
  "model": "wan2.6-image",
  "input": {
    "messages": [
      {
        "role": "user",
        "content": [
          {
            "type": "image_url",
            "image_url": {
              "url": "data:image/png;base64,..."
            }
          },
          {
            "type": "text",
            "text": "prompt..."
          }
        ]
      }
    ]
  },
  "parameters": {
    "n": 1,
    "size": "1024*1024"
  }
}
```

---

## 🔄 异步任务模式

### 提交任务
**端点**: `POST /api/v1/services/aigc/image-generation/generation`

**请求头**:
```
Authorization: Bearer $DASHSCOPE_API_KEY
Content-Type: application/json
X-DashScope-Async: enable
```

**响应**:
```json
{
  "output": {
    "task_id": "cb2a6a0d-0e18-433a-99a5-8bf7e724d5be"
  },
  "request_id": "..."
}
```

---

### 查询任务状态
**端点**: `GET /api/v1/tasks/{task_id}`

**请求头**:
```
Authorization: Bearer $DASHSCOPE_API_KEY
```

**响应**:
```json
{
  "output": {
    "task_id": "...",
    "task_status": "SUCCEEDED",
    "results": [
      {
        "url": "https://dashscope-result.oss-cn-shanghai.aliyuncs.com/..."
      }
    ]
  },
  "request_id": "..."
}
```

**任务状态**:
- `PENDING`: 任务等待中
- `RUNNING`: 任务执行中
- `SUCCEEDED`: 任务成功
- `FAILED`: 任务失败

---

## 📊 响应格式详解

### 图像生成成功响应
```json
{
  "output": {
    "task_id": "...",
    "task_status": "SUCCEEDED",
    "results": [
      {
        "url": "https://..."
      }
    ],
    "image": {
      "url": "https://..."
    }
  }
}
```

**注意**: 
- `results[0].url` 和 `image.url` 都可能包含结果
- 需要兼容两种格式

---

## ⚠️ 错误处理

### 常见错误码

| 错误码 | 说明 | 解决方案 |
|--------|------|----------|
| `InvalidApiKey` | API Key 无效 | 检查 API Key 是否正确 |
| `QuotaExhausted` | 配额已用完 | 充值或等待下月重置 |
| `ModelNotFound` | 模型不存在 | 检查模型名称是否正确 |
| `TaskFailed` | 任务失败 | 查看错误信息，重试 |

### 错误响应格式
```json
{
  "error": {
    "code": "InvalidApiKey",
    "message": "Invalid API Key provided"
  }
}
```

---

## 💡 最佳实践

### 1. 异步任务轮询
```python
import time

def poll_task(task_id, api_key, max_attempts=300):
    """轮询异步任务结果（最多 5 分钟）"""
    for attempt in range(max_attempts):
        response = requests.get(
            f'https://dashscope.aliyuncs.com/api/v1/tasks/{task_id}',
            headers={'Authorization': f'Bearer {api_key}'}
        )
        
        data = response.json()
        status = data['output']['task_status']
        
        if status == 'SUCCEEDED':
            return data['output']['results'][0]['url']
        elif status == 'FAILED':
            raise Exception(f"Task failed: {data['output'].get('message', 'Unknown error')}")
        
        time.sleep(2)  # 每 2 秒轮询一次
    
    raise TimeoutError("Task timeout after 5 minutes")
```

### 2. 错误重试
```python
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
def call_api_with_retry(task_id, api_key):
    """带重试的任务查询"""
    return poll_task(task_id, api_key)
```

### 3. 超时处理
```python
import asyncio

async def poll_with_timeout(task_id, api_key, timeout=300):
    """带超时的轮询"""
    try:
        return await asyncio.wait_for(
            poll_task_async(task_id, api_key),
            timeout=timeout
        )
    except asyncio.TimeoutError:
        raise TimeoutError(f"Task timeout after {timeout} seconds")
```

---

## 📝 代码示例

### Python SDK 示例
```python
from openai import OpenAI
import os

client = OpenAI(
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1"
)

# 提交异步任务
response = client.chat.completions.create(
    model="wan2.6-image",
    messages=[{
        "role": "user",
        "content": [
            {"type": "image_url", "image_url": {"url": "data:image/png;base64,..."}},
            {"type": "text", "text": "转换为像素艺术风格"}
        ]
    }],
    parameters={"n": 1, "size": "1024*1024"}
)

task_id = response.output.task_id

# 轮询任务结果
import time
while True:
    result = client.tasks.get(task_id)
    if result.output.task_status == 'SUCCEEDED':
        image_url = result.output.results[0].url
        break
    time.sleep(2)
```

### curl 示例
```bash
# 提交任务
curl --location 'https://dashscope.aliyuncs.com/api/v1/services/aigc/image-generation/generation' \
--header 'Content-Type: application/json' \
--header "Authorization: Bearer $DASHSCOPE_API_KEY" \
--header 'X-DashScope-Async: enable' \
--data '{
  "model": "wan2.6-image",
  "input": {
    "messages": [
      {
        "role": "user",
        "content": [
          {
            "type": "image_url",
            "image_url": {
              "url": "data:image/png;base64,..."
            }
          },
          {
            "type": "text",
            "text": "转换为像素艺术风格"
          }
        ]
      }
    ]
  },
  "parameters": {
    "n": 1,
    "size": "1024*1024"
  }
}'

# 查询任务
curl --location 'https://dashscope.aliyuncs.com/api/v1/tasks/{task_id}' \
--header "Authorization: Bearer $DASHSCOPE_API_KEY"
```

---

## 🔗 相关资源

- **阿里云百炼控制台**: https://bailian.console.aliyun.com/
- **API Key 管理**: https://help.aliyun.com/zh/model-studio/get-api-key
- **模型列表**: https://help.aliyun.com/zh/model-studio/models
- **计费说明**: https://help.aliyun.com/zh/model-studio/model-pricing
- **限流说明**: https://help.aliyun.com/zh/model-studio/rate-limit

---

**整理者**: 宁姚 🗡️
**最后更新**: 2026-03-15 22:50
