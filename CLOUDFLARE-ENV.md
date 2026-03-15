# Cloudflare Pages 环境变量配置

**配置时间**: 2026-03-15
**配置者**: 宁姚 🗡️

---

## ✅ 你已配置的环境变量

根据你说已配置：
- ✅ `ALIBABA_API_KEY` - 阿里云百炼 API Key
- ✅ `MODEL_NAME` - 模型名称

---

## 🔍 验证配置

### 在 Cloudflare Dashboard 检查

1. 访问：https://dash.cloudflare.com/
2. 进入 **Workers & Pages**
3. 选择你的 Pages 项目
4. 点击 **Settings** → **Environment variables**
5. 确认以下变量存在：

| 变量名 | 值 | 状态 |
|--------|-----|------|
| `ALIBABA_API_KEY` | `sk-xxxxx` | ✅ 已配置 |
| `MODEL_NAME` | `wanx-v1` | ✅ 已配置 |

---

## 📝 添加/修改变量

### 步骤

1. **Workers & Pages** → 选择项目
2. **Settings** → **Environment variables**
3. **Add variable**
4. 填写：
   - **Key**: `ALIBABA_API_KEY`
   - **Value**: `sk-your-api-key`
   - **Encrypt**: ✅ (可选，加密存储)
5. **Save**

### 需要重启部署

添加/修改变量后，需要重新部署才能生效：

**方法 1: 自动部署**
- 推送代码到 GitHub
- Cloudflare 自动构建部署

**方法 2: 手动触发**
- Cloudflare Dashboard → Deployments
- 点击最新部署的 **⋮** → **Retry deployment**

---

## 🔧 本地测试环境变量

### 创建 .dev.vars 文件

在 Cloudflare Pages 本地开发时，可以创建 `.dev.vars` 文件：

```bash
# .dev.vars
ALIBABA_API_KEY=sk-your-test-api-key
MODEL_NAME=wanx-v1
```

### 本地运行

```bash
# 使用 Wrangler 运行
wrangler pages dev -- npm run dev
```

---

## 📊 环境变量说明

### 必需变量

| 变量 | 说明 | 示例 |
|------|------|------|
| `ALIBABA_API_KEY` | 阿里云百炼 API Key | `sk-xxxxxxxx` |

### 可选变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `MODEL_NAME` | 模型名称 | `wanx-v1` |
| `DASHSCOPE_API_KEY` | DashScope 备选 Key | - |

### 模型名称选项

| 模型 | 说明 | 适用场景 |
|------|------|----------|
| `wanx-v1` | 通义万相 v1 | 通用图像生成（推荐） |
| `wanx2.1-pro-turbo-v1` | 通义万相 2.1 Pro | 高质量快速生成 |
| `wanx2.1-turbo-v1` | 通义万相 2.1 | 快速生成 |

---

## 🔐 安全建议

### 1. 加密存储
在 Cloudflare Dashboard 添加变量时，勾选 **Encrypt** 选项。

### 2. 不要提交到 Git
- `.env.local` 已在 `.gitignore` 中
- `.dev.vars` 也应添加到 `.gitignore`

### 3. 定期轮换
建议每 3-6 个月更换一次 API Key。

### 4. 监控使用
定期检查 Cloudflare 使用情况和 API 调用量。

---

## 🆘 故障排查

### 变量不生效

**检查**:
1. 确认变量名正确（大小写敏感）
2. 确认已保存
3. 重新部署项目

**解决**:
```bash
# 本地测试
echo $ALIBABA_API_KEY
```

### API 调用失败

**检查**:
1. API Key 格式（以 `sk-` 开头）
2. 账号已开通通义万相服务
3. 账号有足够余额/配额

**解决**:
- 访问：https://bailian.console.aliyun.com/
- 检查服务状态和配额

---

## 📚 相关文档

- **Cloudflare 环境变量**: https://developers.cloudflare.com/pages/configuration/
- **阿里百炼配置**: `BAILIAN-CONFIG.md`
- **部署指南**: `DEPLOY.md`

---

**配置状态**: ✅ 已配置  
**最后验证**: 2026-03-15  
**配置者**: 宁姚 🗡️
