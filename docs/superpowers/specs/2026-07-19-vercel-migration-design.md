# 个人网站 Vercel 迁移设计

## 目标

将张景隆个人网站从当前 ChatGPT Sites 托管迁移到 Vercel，同时保持页面内容和视觉不变，实现：

- GitHub `long32132/personal-website` 的 `main` 分支自动部署到 Vercel。
- `zhangjinglongai.com` 继续作为主域名。
- `www.zhangjinglongai.com` 自动跳转到主域名。
- 域名切换期间不中断访问。
- 旧托管保留 7 天作为回退路径。

## 当前状态

- 网站是 Next.js App Router 单页应用。
- 页面本身只依赖 Next.js、React、静态图片和 CSS。
- 当前 `dev`、`build`、`start` 脚本使用 `vinext`，并包含 Cloudflare Worker、D1、R2、ChatGPT Sites 和 Vite 专用脚手架。
- 页面没有实际使用数据库、Cloudflare Worker API 或 ChatGPT 登录功能。
- 当前生产站点为公开访问，主域名和 HTTPS 均正常。
- GitHub 公共仓库已经存在，默认分支为 `main`。

## 方案选择

采用原生 Next.js 构建并连接 Vercel Git 部署。

不采用以下方案：

- 保留 `vinext` 并自定义 Vercel 构建：运行时和构建输出并非 Vercel 原生路径，维护成本更高。
- 静态导出：虽然当前页面可以静态化，但会限制未来加入聊天助手、API 和其他服务端能力。

## 应用改造

### 构建方式

将脚本切换为：

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start"
}
```

保留现有 `next.config.ts`，不增加自定义 Vercel 构建命令。Vercel 使用 Next.js Framework Preset 自动识别项目。

### 依赖与文件清理

删除当前页面未使用、仅服务于旧托管脚手架的内容：

- `vinext`、Vite、Cloudflare Vite 插件、Wrangler 和相关 RSC 构建依赖。
- `vite.config.ts`、`worker/`、`build/`。
- 未使用的 D1 示例、数据库配置和 Drizzle 依赖。
- 未使用的 ChatGPT Sites 登录辅助文件。
- `.openai/hosting.json` 及旧托管专用元数据。
- 更新 `README.md`，改为原生 Next.js 本地运行、Vercel 自动部署和域名说明。

删除仅影响源码；已经发布的旧站点继续运行。Git 历史保留全部文件，必要时可通过回退提交恢复旧构建配置。

### 页面行为

- 不修改页面文案、布局、颜色、图片或外部链接。
- 不新增环境变量、数据库或服务端接口。
- 保留 Next.js Image 当前的 `unoptimized` 设置，避免迁移同时改变图片呈现行为。
- 保留现有 SEO、Open Graph 和移动端布局。

## 测试与验证

在改动前先增加迁移约束测试，并确认测试因旧配置存在而失败。测试应验证：

- `dev`、`build`、`start` 使用原生 Next.js 命令。
- `package.json` 不再包含 `vinext` 和 Cloudflare 构建依赖。
- 旧托管入口文件不再存在。
- 已有内容、链接、图片和响应式约束测试继续通过。

实施后执行：

```text
npm test
npm run lint
npm run build
```

本地正式构建必须成功，且工作树无意外文件后，才能推送迁移分支。

## Vercel 部署

1. 将迁移分支推送到 GitHub，先获得 Vercel Preview Deployment。
2. 验证临时域名的首页内容、图片、导航、外部链接、移动端和控制台错误。
3. 合并到 GitHub `main`，让 Vercel 创建 Production Deployment。
4. Vercel 项目连接 `long32132/personal-website`，生产分支设置为 `main`。
5. 不配置任何运行时环境变量。

每次向 `main` 推送后，Vercel 自动生成新的生产部署；非生产分支生成预览部署。

## 域名切换

### 切换前

- 在 Vercel 项目中添加 `zhangjinglongai.com` 和 `www.zhangjinglongai.com`。
- 以 Vercel 项目 Domains 页面显示的专属 A、CNAME 和 TXT 值为准，不预设通用值。
- 当前阿里云 DNS 的 TTL 已为 10 分钟，不更换域名注册商或权威 DNS。

### 切换过程

1. 保持 ChatGPT Sites 旧站点公开且可访问。
2. 在阿里云把根域名 `@` 的两条旧 A 记录替换为 Vercel 要求的 A 记录。
3. 添加 `www` 的 Vercel CNAME 记录。
4. 如 Vercel 要求域名所有权验证，添加它提供的 TXT 记录。
5. 等待 Vercel 显示域名和 SSL 为有效。
6. 将 `www.zhangjinglongai.com` 设置为 308 跳转到 `https://zhangjinglongai.com`。

切换时不删除旧托管的 TXT 验证记录；它们不参与访问路由，可保留到回退期结束。

### 验证标准

- `https://zhangjinglongai.com` 返回 HTTP 200。
- 页面标题和主体内容为张景隆个人网站。
- HTTPS 证书有效。
- `https://www.zhangjinglongai.com` 跳转到不带 `www` 的主域名。
- Vercel 生产部署显示 Ready。
- GitHub `main` 与 Vercel 生产提交一致。

## 回退策略

域名切换后保留旧 ChatGPT Sites 托管 7 天。

如果 Vercel 出现影响访问的问题：

1. 将阿里云根域名 A 记录恢复为旧托管的两条地址。
2. 暂停或移除 `www` 的 Vercel CNAME。
3. 等待最长一个 TTL 周期后复查。

Vercel 本身也保留历史部署，可在应用问题而非平台问题发生时直接回滚到上一个 Ready 部署。

## 完成条件

- 原生 Next.js 构建、测试和 lint 全部通过。
- Vercel Preview 和 Production 部署均成功。
- GitHub 自动部署连接有效。
- 主域名与 `www` 跳转均正常，HTTPS 有效。
- 旧托管保持可回退状态，未提前删除。
