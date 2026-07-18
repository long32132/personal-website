# 财务 AI 小助理真实截图 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 用用户提供的 1920 × 879 真实截图替换财务项目卡片中的功能结构示意，并保持桌面端和手机端完整显示。

**Architecture:** 保留现有单页 React 结构和 `next/image` 图片组件，只调整财务项目卡片的内容排列。真实截图作为静态资源保存到 `public/media`，卡片改为上下结构，图片使用固有宽高比和响应式尺寸提示避免裁切与变形。

**Tech Stack:** Next.js 16、React 19、TypeScript、CSS、Node.js 内置测试运行器、vinext

## Global Constraints

- 使用用户提供的真实截图，不生成、补画或修改产品界面。
- 完整保留产品标题、顶部导航、AI 助手主体和底部输入区域。
- 桌面端与手机端均不裁切、不变形、不横向溢出。
- 保留现有温暖编辑感视觉语言和作品文案。
- 更新现有私有网站地址，不创建新的站点。

---

### Task 1: 替换财务项目视觉并调整响应式布局

**Files:**
- Create: `public/media/finance-ai-assistant.png`
- Modify: `app/page.tsx:122-172`
- Modify: `app/globals.css:342-453`
- Test: `tests/site-content.test.mjs`

**Interfaces:**
- Consumes: 用户提供的 1920 × 879 PNG 截图；现有 `next/image` 的 `Image` 组件。
- Produces: `finance-ai-assistant.png` 静态资源和 `.finance-screenshot` 响应式图片容器。

- [ ] **Step 1: 写入失败测试**

在 `tests/site-content.test.mjs` 中加入：

```js
test("uses the real finance assistant screenshot", async () => {
  assert.match(page, /\/media\/finance-ai-assistant\.png/);
  assert.match(page, /财务 AI 小助理实际界面/);
  assert.doesNotMatch(page, /功能结构示意（非产品截图）/);

  const png = await readFile(
    new URL("../public/media/finance-ai-assistant.png", import.meta.url),
  );
  assert.equal(png.readUInt32BE(16), 1920);
  assert.equal(png.readUInt32BE(20), 879);
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `npm test`

Expected: FAIL，提示页面缺少 `/media/finance-ai-assistant.png` 或文件不存在。

- [ ] **Step 3: 保存真实截图资源**

将用户提供的文件原样复制为：

```text
public/media/finance-ai-assistant.png
```

复制后检查图片宽度为 `1920`、高度为 `879`，不进行裁切或压缩改写。

- [ ] **Step 4: 替换财务项目 JSX**

在 `app/page.tsx` 中删除 `.finance-preview` 及其内部的示意指标、图表和查询框，保留项目介绍，并在介绍后加入：

```tsx
<figure className="finance-screenshot">
  <Image
    src="/media/finance-ai-assistant.png"
    alt="财务 AI 小助理实际界面，包含应收应付看板、AI 助手和 Excel 数据问答入口"
    width={1920}
    height={879}
    sizes="(max-width: 760px) calc(100vw - 40px), 1340px"
    priority
  />
  <figcaption>财务 AI 小助理 · 实际界面</figcaption>
</figure>
```

- [ ] **Step 5: 将财务卡片改为上下结构**

在 `app/globals.css` 中将 `.finance-card` 调整为单列，并删除只服务于旧示意图的 `.finance-preview`、`.visual-caption`、`.preview-bar`、`.finance-metrics`、`.finance-chart` 和 `.finance-query` 规则。加入：

```css
.finance-card {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: 1fr;
  gap: 38px;
  padding: clamp(30px, 4vw, 58px);
}

.finance-screenshot {
  position: relative;
  margin: 0;
  overflow: hidden;
  border: 1px solid rgba(30, 29, 26, 0.18);
  background: #f5f6f8;
  box-shadow: 0 24px 58px rgba(54, 45, 34, 0.12);
}

.finance-screenshot img {
  display: block;
  width: 100%;
  height: auto;
}

.finance-screenshot figcaption {
  position: absolute;
  left: 18px;
  bottom: 18px;
  padding: 7px 11px;
  background: rgba(30, 29, 26, 0.86);
  color: #f8f5ee;
  font-size: 11px;
  letter-spacing: 0.05em;
}
```

- [ ] **Step 6: 运行测试和代码检查**

Run: `npm test`

Expected: 7 tests PASS。

Run: `npm run lint`

Expected: exit code 0，无 ESLint 错误。

Run: `git diff --check`

Expected: exit code 0，无空白字符错误。

- [ ] **Step 7: 提交截图替换**

```bash
git add app/page.tsx app/globals.css tests/site-content.test.mjs public/media/finance-ai-assistant.png
git commit -m "feat: show real finance assistant screenshot"
```

### Task 2: 构建并更新现有网站

**Files:**
- Read: `.openai/hosting.json`
- Generated: `dist/**`

**Interfaces:**
- Consumes: Task 1 的已提交页面和静态图片资源。
- Produces: 通过生产构建的站点包和现有私有站点的新版本。

- [ ] **Step 1: 执行生产构建**

Run: `npm run build`

Expected: `Build complete`，并生成 `dist/server/index.js`。

- [ ] **Step 2: 最终验证截图资源与工作树**

Run: `npm test && npm run lint && git status --short`

Expected: 7 tests PASS、lint exit code 0、工作树无未提交改动。

- [ ] **Step 3: 发布到现有网站**

使用 `.openai/hosting.json` 中已有的 `project_id` 保存新版本，并通过私有部署更新现有网站，不创建新 slug 或新站点。

- [ ] **Step 4: 检查部署状态**

轮询现有网站部署状态，直至返回 `succeeded`，并确认访问地址仍为：

```text
https://zhangjinglong-ai-works.kariiii1.chatgpt.site
```
