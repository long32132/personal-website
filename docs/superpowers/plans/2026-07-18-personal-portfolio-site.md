# 张景隆个人网站实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新建一个以真实作品、内容创作和 AI 工作流为核心的张景隆个人网站，替代简历式个人主页。

**Architecture:** 使用 Sites 的 React + TypeScript 单页结构，页面内容集中在 `app/page.tsx`，视觉系统集中在 `app/globals.css`，站点元数据集中在 `app/layout.tsx`。网站不依赖数据库和登录能力，所有项目资料均为静态内容，外部作品通过真实链接打开。

**Tech Stack:** React、TypeScript、Sites/Vite、CSS、Node.js 内置测试运行器、Cloudflare Sites 托管。

## Global Constraints

- 全站姓名只能使用“张景隆”。
- 网站定位是个人作品主页，不是在线简历或求职落地页。
- 不展示教育经历、职业时间线、技能熟练度、求职状态、AI 实验室、客户评价或虚构数据。
- 只展示已经真实存在的财务 AI 小助理、久坐提醒、大话骰子、小红书内容和模型回答事实核验工作流。
- AI 分身不进入首版，也不显示“开发中”入口。
- 外部链接必须使用用户提供或仓库确认过的真实地址，并在新标签页打开。
- 手机端不得产生横向滚动，所有交互必须支持键盘和触摸操作。
- 在用户确认视觉风格前，不创建任何生产页面代码。
- 文案唯一来源为 `docs/site/portfolio-content.md`，实现时不得擅自扩写经历和项目成果。

---

## File Structure

- `app/page.tsx`：单页语义结构、导航、作品卡片、工作流和联系方式。
- `app/globals.css`：所选视觉方向的颜色、排版、卡片、动画和响应式规则。
- `app/layout.tsx`：站点标题、描述、Open Graph 与 X 分享元数据。
- `public/media/`：用户真实项目截图和内容封面。
- `public/og.png`：根据最终页面视觉生成的社交分享图。
- `tests/site-content.test.mjs`：姓名、核心栏目、真实链接和禁用文案的内容契约测试。
- `docs/site/portfolio-content.md`：经用户确认的整站文案真源。
- `docs/site/portfolio-style.md`：用户最终选定的视觉方向与设计令牌。

### Task 1: 冻结视觉方向

**Files:**
- Create: `docs/site/portfolio-style.md`
- Reference: `docs/site/portfolio-content.md`

**Interfaces:**
- Consumes: 用户从三张风格预览中选定的一个方向。
- Produces: 实现阶段唯一可用的颜色、字体、布局、卡片和动效规范。

- [ ] **Step 1: 制作三个使用相同内容的视觉预览**

三个预览统一使用 1600×1000 画布，展示 Hero、一个主作品卡、两个次作品卡和工作流片段；只改变颜色、排版和组件风格。

- [ ] **Step 2: 等待用户明确选择**

没有收到用户选择前停止，不初始化网站、不创建 `app/page.tsx`。

- [ ] **Step 3: 写入选定风格文档**

文档必须包含以下完整字段：

```markdown
# 张景隆个人网站视觉规范

## 方向名称
[用户选定方向的正式名称]

## 颜色
- 页面背景
- 主文字
- 次文字
- 强调色
- 卡片背景
- 边框

## 字体
- 中文标题
- 中文正文
- 英文标签

## 布局
- 最大内容宽度
- Hero 布局
- 作品卡比例
- 移动端断点

## 组件
- 导航
- 按钮
- 作品卡
- 工作流

## 动效
- 页面进入
- 卡片悬浮
- 减少动态效果兼容
```

- [ ] **Step 4: 复核风格与内容定位一致**

确认没有 AI 实验室式发光效果、简历时间线、技能进度条或商业落地页式数据大字。

### Task 2: 初始化站点并建立失败的内容契约测试

**Files:**
- Create: `app/page.tsx`
- Create: `app/layout.tsx`
- Create: `app/globals.css`
- Create: `tests/site-content.test.mjs`
- Inspect: `.openai/hosting.json`

**Interfaces:**
- Consumes: `docs/site/portfolio-content.md` 与 `docs/site/portfolio-style.md`。
- Produces: 可由内容契约约束的 Sites 单页项目。

- [ ] **Step 1: 使用 Sites 初始化器创建站点**

在工作区根目录仅运行一次 Sites 初始化脚本，保留生成的包管理器、锁文件、Vite 插件和 hosting 配置。

- [ ] **Step 2: 创建内容契约测试**

```js
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const page = await readFile(new URL('../app/page.tsx', import.meta.url), 'utf8');

test('uses the correct name and required sections', () => {
  assert.match(page, /张景隆/);
  for (const id of ['about', 'work', 'workflow', 'contact']) {
    assert.match(page, new RegExp(`id=["']${id}["']`));
  }
});

test('contains every verified public link', () => {
  const links = [
    'https://long32132.github.io/-2333/',
    'https://github.com/long32132/-2333',
    'https://github.com/long32132/stand-up-reminder',
    'https://github.com/long2132',
    'https://www.xiaohongshu.com/user/profile/5c8e6bd00000000010024796',
    'mailto:956348436@qq.com',
  ];
  for (const link of links) assert.match(page, new RegExp(link.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
});

test('does not contain rejected resume-style claims', () => {
  for (const phrase of ['AI Application Specialist', 'AI Trainer', 'AI 实验室', '教育经历', '求职中']) {
    assert.doesNotMatch(page, new RegExp(phrase));
  }
});
```

- [ ] **Step 3: 运行测试并确认 RED**

Run: `node --test tests/site-content.test.mjs`

Expected: FAIL，因为 starter 页面尚未包含 `about`、`work`、`workflow`、`contact` 和全部真实链接。

### Task 3: 实现语义页面与真实内容

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`
- Create: `public/media/xiaohongshu-posts.png`
- Create: `public/media/dice-cover.png`
- Create: `public/media/finance-assistant.png`
- Create: `public/media/stand-up-reminder.png`

**Interfaces:**
- Consumes: 内容 Markdown、视觉规范和四张真实素材。
- Produces: 完整的单页个人网站与可访问的外部链接。

- [ ] **Step 1: 复制和生成真实作品素材**

使用用户提供的小红书截图、大话骰子现有封面、财务 AI 小助理实际界面和久坐提醒实际界面。不得用生成图伪装成产品截图。

- [ ] **Step 2: 实现页面结构**

`app/page.tsx` 必须按以下顺序输出：

```tsx
<main>
  <header>{/* Hero 与导航 */}</header>
  <section id="about">{/* 关于我 */}</section>
  <section id="work">{/* 四项作品 */}</section>
  <section id="workflow">{/* 事实核验工作流 */}</section>
  <section id="contact">{/* 联系方式 */}</section>
</main>
```

外部链接统一使用：

```tsx
<a href={url} target="_blank" rel="noreferrer">
  {label}
</a>
```

- [ ] **Step 3: 实现响应式视觉系统**

`app/globals.css` 使用 `docs/site/portfolio-style.md` 的确切设计令牌，并至少包含：

```css
html { scroll-behavior: smooth; }
body { margin: 0; overflow-x: hidden; }
a:focus-visible, button:focus-visible { outline: 3px solid var(--accent); outline-offset: 3px; }
@media (max-width: 760px) { .work-grid { grid-template-columns: 1fr; } }
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; scroll-behavior: auto !important; } }
```

- [ ] **Step 4: 更新站点元数据**

`app/layout.tsx` 使用：

```ts
export const metadata = {
  title: '张景隆｜AI 应用、工作流与 Vibe Coding',
  description: '张景隆的个人网站：记录 AI 应用、工作流、Vibe Coding 作品与内容。',
};
```

- [ ] **Step 5: 运行内容测试并确认 GREEN**

Run: `node --test tests/site-content.test.mjs`

Expected: 3 tests passed, 0 failed。

### Task 4: 构建与人工验收

**Files:**
- Modify if required: `app/page.tsx`
- Modify if required: `app/globals.css`
- Modify: `app/layout.tsx`
- Create: `public/og.png`

**Interfaces:**
- Consumes: 完整实现。
- Produces: 构建通过、桌面端与手机端无阻塞问题的发布候选版本。

- [ ] **Step 1: 执行生产构建**

Run: `npm run build`

Expected: exit code 0，无 TypeScript 或打包错误。

- [ ] **Step 2: 检查桌面端**

在 1440×900 下确认姓名、Hero、四项作品、工作流、联系方式和所有外部按钮均可见或可滚动到达。

- [ ] **Step 3: 检查手机端**

在 390×844 下确认 `document.documentElement.scrollWidth <= window.innerWidth`，卡片为单列，按钮可触摸，导航不遮挡内容。

- [ ] **Step 4: 检查链接和禁用内容**

逐一验证六个公开链接；页面搜索确认不存在错误姓名、求职标签、技能条、虚构数据和 AI 分身入口。

- [ ] **Step 5: 生成并验证社交分享图**

生成一张与最终网站同色系的 1200×630 分享图，文字仅包含“张景隆”“AI 应用 · 工作流 · Vibe Coding”。检查文字无误后保存为 `public/og.png` 并接入 Open Graph 与 X 元数据。

- [ ] **Step 6: 再次执行完整验证**

Run: `node --test tests/site-content.test.mjs && npm run build`

Expected: 所有测试通过且构建 exit code 0。

### Task 5: 发布与交付

**Files:**
- Inspect: `.openai/hosting.json`

**Interfaces:**
- Consumes: 已验证的生产构建。
- Produces: 可公开访问的网站地址。

- [ ] **Step 1: 使用 Sites 托管发布**

保持开发服务运行，按 `sites-hosting` 流程发布当前项目。

- [ ] **Step 2: 验证线上首页**

打开发布地址，确认页面标题为“张景隆｜AI 应用、工作流与 Vibe Coding”，首页可加载且真实链接仍然正确。

- [ ] **Step 3: 向用户交付**

只报告公开访问地址、已包含的核心模块和任何仍需用户补充的真实项目截图，不使用“应该可以”等未验证表述。

