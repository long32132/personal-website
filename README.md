# 张景隆的个人网站

围绕 AI 应用、自动化工作流、Vibe Coding 作品与内容展开的个人网站。

## 技术栈

- Next.js App Router
- React
- TypeScript
- Tailwind CSS

## 本地运行

```bash
npm install
npm run dev
```

## 检查与构建

```bash
npm test
npm run lint
npm run build
```

## 部署

Vercel 连接 GitHub 仓库 `long32132/personal-website`：

- `main` 分支自动发布到生产环境。
- 其他分支自动生成预览环境。
- 主域名为 `https://zhangjinglongai.com`。
- `www.zhangjinglongai.com` 永久跳转到主域名。

主要内容位于 `app/page.tsx`，视觉样式位于 `app/globals.css`。
