# Cloudflare Pages 部署配置指南

**更新时间**: 2026-03-15
**项目**: perler-beads-ai

---

## ⚙️ Build Settings

### 方法 1: Cloudflare Dashboard 配置

访问：https://dash.cloudflare.com/ → Workers & Pages → 选择项目

**构建设置**:
```
Production branch: main
Build command: npm run build
Build output directory: out
Root directory: (留空)
```

**环境变量**:
| 变量名 | 值 | 说明 |
|--------|-----|------|
| `NODE_VERSION` | `20` | Node.js 版本 |
| `ENABLE_FILE_SYSTEM_API` | `1` | 启用文件系统 API |

**⚠️ 注意**: 
- ~~`ALIBABA_API_KEY`~~ - **已移除**（改为运行时输入）
- ~~`MODEL_NAME`~~ - **已移除**（改为运行时输入）

---

### 方法 2: wrangler.toml 配置

```toml
name = "perler-beads-ai"
compatibility_date = "2024-01-01"

[dev]
port = 3000

# Pages 特定配置
[pages]
build_command = "npm run build"
build_output_directory = "out"
```

---

## 📁 项目结构

```
perler-beads-ai/
├── functions/              # Cloudflare Pages Functions
│   └── [[path]].ts        # API 路由处理器
├── src/                    # Next.js 源代码
├── public/                 # 静态资源
├── out/                    # 构建输出（Cloudflare 部署）
├── package.json
├── next.config.ts
└── wrangler.toml
```

---

## 🚀 部署流程

### 自动部署（推荐）
1. 推送代码到 GitHub `main` 分支
2. Cloudflare 自动检测并构建
3. 部署到全球边缘节点

### 手动部署
```bash
# 本地构建
npm run build

# 使用 Wrangler 部署
wrangler pages deploy out --project-name=perler-beads-ai
```

---

## 🔐 安全配置

### API Key 管理（运行时输入）

**已移除环境变量**:
- ❌ `ALIBABA_API_KEY` - 改为运行时输入
- ❌ `MODEL_NAME` - 改为运行时输入

**优势**:
1. ✅ 避免 API Key 泄露
2. ✅ 防止流量盗刷
3. ✅ 用户自行控制配额
4. ✅ LocalStorage 缓存，无需重复输入

---

## 📊 监控

### 部署状态
1. https://dash.cloudflare.com/
2. Workers & Pages → 项目
3. **Deployments** 标签页

### 使用量监控
1. Workers & Pages → 项目
2. **Analytics** 标签页
3. 查看请求数、带宽等

---

## 🆘 故障排查

### 构建失败
```
错误：Output directory "out" not found
解决：确认 next.config.ts 中有 output: 'export'
```

### Functions 不工作
```
错误：405 Method Not Allowed
解决：检查 functions/[[path]].ts 路由配置
```

### API 调用失败
```
错误：Missing ALIBABA_API_KEY
解决：这是预期的，需要在 UI 中输入 API Key
```

---

## 📚 相关文档

- `DEPLOY.md` - 完整部署指南
- `BAILIAN-CONFIG.md` - 阿里百炼配置
- `CLOUDFLARE-ENV.md` - 环境变量说明
- `README-API-TEST.md` - API Key 测试

---

**更新时间**: 2026-03-15 20:01
**更新者**: 宁姚 🗡️
