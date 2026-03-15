# 阿里百炼 API 配置指南

**配置时间**: 2026-03-15
**配置者**: 宁姚 🗡️

---

## 🔑 获取 API Key

### 步骤 1: 访问阿里百炼控制台
打开：https://bailian.console.aliyun.com/cn-beijing/?tab=api

### 步骤 2: 登录/注册
- 使用阿里云账号登录
- 如果没有账号，先注册阿里云账号

### 步骤 3: 创建 API Key
1. 进入 **API 管理** 页面
2. 点击 **创建 API Key**
3. 复制生成的 API Key（格式：`sk-xxxxxxxxxxxxxxxx`）

### 步骤 4: 开通模型服务
确保开通以下模型服务：
- ✅ **通义万相** (wanx-v1) - 图像生成
- ✅ **通义千问** (qwen) - 文本生成（可选）

---

## ⚙️ 配置项目

### 方式 1: 使用 .env.local 文件（推荐）

编辑 `/Users/cc/.openclaw/workspace/perler-beads-ai/.env.local`：

```bash
# 阿里云百炼 API Key（必填）
ALIBABA_API_KEY=sk-your-actual-api-key-here

# 模型名称（可选，默认 wanx-v1）
MODEL_NAME=wanx-v1
```

### 方式 2: 使用环境变量

```bash
# 在终端设置
export ALIBABA_API_KEY=sk-your-api-key-here
export MODEL_NAME=wanx-v1
```

### 方式 3: 使用 DashScope 兼容模式

```bash
# 也可以使用 DashScope API Key
DASHSCOPE_API_KEY=sk-your-dashscope-key-here
```

---

## 🧪 测试配置

### 1. 安装依赖
```bash
cd ~/.openclaw/workspace/perler-beads-ai
npm install
```

### 2. 启动开发服务器
```bash
npm run dev
```

### 3. 访问应用
打开浏览器访问：http://localhost:3000

### 4. 测试 AI 优化功能
1. 上传一张图片
2. 点击 **AI 优化** 按钮
3. 输入提示词或使用默认提示词
4. 点击 **开始优化**
5. 等待 AI 生成完成

---

## 📊 可用模型

### 通义万相（图像生成）
| 模型 | 说明 | 适用场景 |
|------|------|----------|
| `wanx-v1` | 通义万相 v1 | 通用图像生成 |
| `wanx2.1-pro-turbo-v1` | 通义万相 2.1 Pro 加速版 | 高质量快速生成 |
| `wanx2.1-turbo-v1` | 通义万相 2.1 加速版 | 快速生成 |

### 通义千问（文本生成）
| 模型 | 说明 | 适用场景 |
|------|------|----------|
| `qwen-plus` | 通义千问 Plus | 复杂任务 |
| `qwen-turbo` | 通义千问 Turbo | 快速响应 |

---

## 🔧 API 配置说明

### 当前配置（route.ts）
```typescript
const ALIBABA_API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/images/generations';

const getApiKey = () => {
  const apiKey = process.env.ALIBABA_API_KEY || process.env.DASHSCOPE_API_KEY;
  // ...
};

const getModelName = () => {
  return process.env.MODEL_NAME || 'wanx-v1';
};
```

### 请求格式
```json
{
  "model": "wanx-v1",
  "prompt": "pixel art style, chibi character, white background",
  "image": "data:image/png;base64,...",
  "n": 1,
  "size": "1024x1024"
}
```

### 响应格式
```json
{
  "success": true,
  "imageUrl": "https://...",
  "model": "wanx-v1"
}
```

---

## ⚠️ 常见问题

### 1. Missing API Key 错误
**错误**: `Missing ALIBABA_API_KEY or DASHSCOPE_API_KEY`

**解决**:
- 检查 `.env.local` 文件是否存在
- 确认 API Key 格式正确（以 `sk-` 开头）
- 重启开发服务器

### 2. 安全检测失败
**错误**: `图片未能通过安全检测`

**解决**:
- 更换其他图片
- 确保图片内容合规
- 避免敏感内容

### 3. API 调用失败
**错误**: `API request failed: 401` 或 `403`

**解决**:
- 检查 API Key 是否有效
- 确认账号已开通相关服务
- 检查账号余额/配额

### 4. 配额限制
**错误**: `Quota exceeded` 或 `Rate limit exceeded`

**解决**:
- 等待配额重置
- 升级账号套餐
- 联系阿里云客服

---

## 💰 费用说明

### 免费额度
- 新账号通常有免费试用额度
- 具体额度查看控制台

### 计费方式
- 按调用次数计费
- 按图像分辨率计费
- 查看官方定价：https://help.aliyun.com/pricing/dashscope

---

## 📚 相关文档

- **阿里百炼官方文档**: https://help.aliyun.com/product/bailian.html
- **通义万相 API 文档**: https://help.aliyun.com/zh/dashscope/developer-reference/api-details
- **DashScope 文档**: https://help.aliyun.com/zh/dashscope

---

## 🔐 安全提示

1. **不要提交 API Key 到 Git**
   - `.env.local` 已在 `.gitignore` 中
   - 不要分享到公开场合

2. **定期轮换 API Key**
   - 建议每 3-6 个月更换一次
   - 发现泄露立即停用

3. **监控使用情况**
   - 定期检查调用量
   - 设置预算告警

---

**配置完成时间**: 2026-03-15 18:35
**配置者**: 宁姚 🗡️
**状态**: ✅ 待用户填写 API Key
