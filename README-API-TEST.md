# API Key 测试指南

**创建时间**: 2026-03-15
**目的**: 验证阿里云百炼 API Key 是否有效

---

## ⚠️ 当前配置问题

根据截图发现：
- **变量名**: `ALIBABA_API_KEY` ✅ 正确
- **模型名**: `MODEL_NAME = qwern-image-2.0` ❌ **可能无效**

---

## 🔧 建议修复

### 方案 1: 修改模型名称（推荐）

在 Cloudflare Dashboard 修改：

1. 访问：https://dash.cloudflare.com/
2. Workers & Pages → 选择你的项目
3. Settings → Environment variables
4. 编辑 `MODEL_NAME`
5. 改为：`wanx-v1`
6. Save
7. **重新部署**（Deployments → Retry deployment）

**推荐模型名称**:
| 模型 | 说明 | 推荐度 |
|------|------|--------|
| `wanx-v1` | 通义万相 v1 | ⭐⭐⭐⭐⭐ 推荐 |
| `wanx2.1-pro-turbo-v1` | 通义万相 2.1 Pro | ⭐⭐⭐⭐ |
| `wanx2.1-turbo-v1` | 通义万相 2.1 | ⭐⭐⭐⭐ |

---

## 🧪 本地测试 API Key

### 步骤 1: 下载测试脚本
```bash
cd ~/.openclaw/workspace/perler-beads-ai
```

### 步骤 2: 设置环境变量
```bash
export ALIBABA_API_KEY=sk-33e91cb7d4ab4d3...  # 你的完整 API Key
export MODEL_NAME=wanx-v1
```

### 步骤 3: 运行测试
```bash
node test-api-key.js
```

### 预期输出

**成功**:
```
✅ API Key 有效！
🖼️ 生成图片 URL: https://...
```

**失败 - API Key 无效**:
```
❌ API Key 无效！请检查 ALIBABA_API_KEY 是否正确
```

**失败 - 模型无效**:
```
❌ 模型名称无效！当前模型：qwern-image-2.0
💡 建议使用：wanx-v1, wanx2.1-pro-turbo-v1, wanx2.1-turbo-v1
```

---

## 🔍 验证 API Key 有效性

### 方法 1: 阿里云控制台

1. 访问：https://bailian.console.aliyun.com/
2. API-KEY 管理
3. 查看你的 API Key 状态
4. 确认已开通"通义万相"服务

### 方法 2: Curl 测试

```bash
curl -X POST https://dashscope.aliyuncs.com/compatible-mode/v1/images/generations \
  -H "Authorization: Bearer sk-33e91cb7d4ab4d3..." \
  -H "Content-Type: application/json" \
  -d '{
    "model": "wanx-v1",
    "prompt": "A red pixel",
    "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
    "n": 1,
    "size": "1024x1024"
  }'
```

**成功响应**:
```json
{
  "data": [
    {
      "url": "https://..."
    }
  ]
}
```

---

## 📋 检查清单

- [ ] API Key 格式正确（以 `sk-` 开头）
- [ ] API Key 未过期
- [ ] 账号已开通通义万相服务
- [ ] 账号有足够余额/配额
- [ ] 模型名称有效（`wanx-v1`）
- [ ] Cloudflare 环境变量已保存
- [ ] 已重新部署项目

---

## 🆘 常见错误

### 错误 1: Invalid API Key
**原因**: API Key 错误或过期
**解决**: 重新生成 API Key

### 错误 2: Model not found
**原因**: 模型名称无效
**解决**: 使用 `wanx-v1`

### 错误 3: Service not activated
**原因**: 未开通通义万相服务
**解决**: 在阿里云控制台开通服务

### 错误 4: Quota exceeded
**原因**: 配额用完
**解决**: 充值或等待下月

---

**测试者**: 宁姚 🗡️
**更新时间**: 2026-03-15 19:41
