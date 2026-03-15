# 🚀 Cloudflare Pages 部署指南

**更新时间**: 2026-03-15
**更新者**: 宁姚 🗡️

---

## 快速部署

### 方法 1: Cloudflare Dashboard

1. **访问 Cloudflare Dashboard**
   - https://dash.cloudflare.com/

2. **创建 Pages 项目**
   - Workers & Pages → Create application
   - Connect to Git

3. **选择 GitHub 仓库**
   - Repository: `yesw6a/perler-beads-ai`
   - Branch: `main`

4. **配置构建**
   ```
   Framework preset: Next.js
   Build command: npm run build
   Build output directory: .next
   ```

5. **环境变量** ⭐ **重要**
   ```
   ALIBABA_API_KEY=你的阿里云百炼 API Key
   MODEL_NAME=wanx-v1
   ```

6. **部署**
   - Save and Deploy
   - 等待 3-5 分钟

---

### 方法 2: Wrangler CLI

```bash
# 安装 Wrangler
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 部署
wrangler pages deploy .next --project-name=perler-beads-ai
```

---

## 📁 项目结构

```
perler-beads-ai/
├── src/                    # 源代码
├── public/                 # 静态资源
├── _headers                # Cloudflare 安全头 ⭐
├── _redirects              # Cloudflare 重定向 ⭐
├── next.config.ts          # Next.js 配置
└── package.json            # 依赖配置
```

---

## ⚙️ 配置说明

### _headers (安全头)

- `X-Content-Type-Options: nosniff` - 防止 MIME 类型嗅探
- `X-Frame-Options: DENY` - 防止点击劫持
- `X-XSS-Protection` - XSS 防护
- `Content-Security-Policy` - 内容安全策略

### _redirects (路由)

- SPA 路由支持，所有请求重定向到 index.html

---

## 🎯 自定义域名 (可选)

1. **Cloudflare Dashboard** → Pages → 选择项目
2. **Custom domains** → Set up a custom domain
3. **输入域名** → 按照提示配置 DNS

---

## 📊 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `ALIBABA_API_KEY` | **阿里云百炼 API Key** (必填) | - |
| `MODEL_NAME` | 模型名称 | `wanx-v1` |
| `DASHSCOPE_API_KEY` | DashScope API Key (备选) | - |
| `APP_NAME` | 应用名称 | perler-beads-ai |
| `APP_VERSION` | 版本号 | 0.1.0 |

### 环境变量说明

**ALIBABA_API_KEY** (推荐):
- 获取地址：https://bailian.console.aliyun.com/cn-beijing/?tab=api
- 格式：`sk-xxxxxxxxxxxxxxxx`

**MODEL_NAME** (可选):
- `wanx-v1` - 通义万相 v1（默认）
- `wanx2.1-pro-turbo-v1` - 通义万相 2.1 Pro 加速版
- `wanx2.1-turbo-v1` - 通义万相 2.1 加速版

**DASHSCOPE_API_KEY** (备选):
- 如果 ALIBABA_API_KEY 未设置，会使用此变量
- DashScope 兼容模式

---

## 🔧 本地开发

```bash
# 安装依赖
npm install

# 创建 .env.local 文件
cp .env.local.example .env.local

# 编辑 .env.local，填写 API Key

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

---

## ✅ 部署检查清单

- [ ] 已 Fork 仓库到 GitHub
- [ ] 已添加 `_headers` 文件
- [ ] 已添加 `_redirects` 文件
- [ ] 已添加 `.gitignore`
- [ ] 已推送到 GitHub
- [ ] Cloudflare Pages 已连接
- [ ] **环境变量已配置** (ALIBABA_API_KEY, MODEL_NAME)
- [ ] 部署成功
- [ ] 自定义域名 (可选)

---

## 📝 更新部署

**自动部署**: 推送代码到 GitHub 后，Cloudflare 自动构建部署

**手动部署**:
```bash
npm run build
wrangler pages deploy .next --project-name=perler-beads-ai
```

---

## 🆘 故障排查

### 部署失败

1. 检查 Cloudflare Build Logs
2. 确认 Next.js 构建成功
3. 检查依赖安装

### 页面空白

1. 打开浏览器开发者工具
2. 查看 Console 错误
3. 检查 API 配置

### API 错误

1. **确认环境变量已配置** (ALIBABA_API_KEY)
2. 检查 API Key 格式（以 `sk-` 开头）
3. 查看 API 调用日志
4. 确认账号已开通通义万相服务

### 安全检测失败

错误：`图片未能通过安全检测`

解决：
- 更换其他图片
- 确保图片内容合规
- 避免敏感内容

---

## 🔗 相关文档

- **配置指南**: `BAILIAN-CONFIG.md`
- **API 文档**: `api.md`
- **阿里云百炼**: https://bailian.console.aliyun.com/
- **DashScope**: https://help.aliyun.com/zh/dashscope

---

**部署时间**: 2026-03-15  
**版本**: 0.1.0  
**作者**: 宁姚 🗡️  
**API 提供商**: 阿里云百炼
