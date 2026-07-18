# 张景隆个人网站清爽作品型重设计 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将现有单页个人网站重构为清爽、留白充足、真实作品主导的作品型网站，并接入财务 AI 小助理真实截图。

**Architecture:** 保留现有 Next.js/vinext 单页结构、锚点导航和静态资源方式，不增加路由、客户端状态或新依赖。按首屏与关于、作品展示、工作流与联系三个可独立验收的页面单元逐步替换 JSX 和 CSS，最后复用现有 Sites 项目完成私有发布。

**Tech Stack:** Next.js 16、React 19、TypeScript、CSS、`next/image`、Node.js 内置测试运行器、ESLint、vinext、Sites

## Global Constraints

- 页面背景使用 `#F7F5F0`，主文字使用 `#14202B`，强调色使用 `#D8613C`。
- 标题使用粗体无衬线字体，中文为主信息，英文为小号辅助信息。
- 不使用背景网格、渐变、发光、厚重卡片、硬阴影、统一编号贴纸或模拟产品界面。
- 使用用户提供的 1920 × 879 财务 AI 小助理真实截图，不裁切、不变形。
- 保留久坐提醒、大话骰子、小红书和事实核验工作流的真实内容与外链。
- 不增加人物插画、博客、AI 聊天分身、域名配置或新业绩指标。
- 手机端保持四个导航入口可访问，所有图片无横向溢出。
- 更新现有私有网站，不创建新的站点。

---

### Task 1: 重做首屏与关于区域

**Files:**
- Modify: `tests/site-content.test.mjs`
- Modify: `app/page.tsx:50-119`
- Modify: `app/globals.css:1-341`

**Interfaces:**
- Consumes: 现有 `#top`、`#about` 和 `#work` 锚点。
- Produces: `.hero-name`、`.hero-statement`、`.hero-focus`、`.about-summary` 结构，供后续页面保持同一视觉语言。

- [ ] **Step 1: 写入首屏失败测试**

在 `tests/site-content.test.mjs` 末尾加入：

```js
test("uses the approved clean hero copy", () => {
  for (const phrase of [
    "张景隆",
    "ZHANG JINGLONG",
    "我用 AI，把想法做成可以使用的东西。",
    "AI 应用 · 自动化工作流 · Vibe Coding · 内容创作",
  ]) {
    assert.match(page, new RegExp(phrase));
  }

  assert.doesNotMatch(page, /你好，我是张景隆/);
  assert.doesNotMatch(page, /Thinking First\. AI Second\./);
  assert.match(page, /className="hero-name"/);
  assert.match(page, /className="about-summary"/);
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `npm test`

Expected: FAIL，缺少 `ZHANG JINGLONG`、批准后的核心表达和新结构类名。

- [ ] **Step 3: 替换首屏 JSX**

将现有 `<section className="hero ...">` 完整替换为：

```tsx
<section className="hero page-section" id="top">
  <div className="hero-name-block">
    <p className="hero-index">PERSONAL WORKS / 2026</p>
    <h1 className="hero-name">
      张景隆
      <span>ZHANG JINGLONG</span>
    </h1>
  </div>
  <div className="hero-message">
    <p className="hero-statement">我用 AI，把想法做成可以使用的东西。</p>
    <p className="hero-focus">
      AI 应用 · 自动化工作流 · Vibe Coding · 内容创作
    </p>
    <a className="hero-link" href="#work">
      查看作品 <span aria-hidden="true">↓</span>
    </a>
  </div>
</section>
```

- [ ] **Step 4: 压缩关于区域 JSX**

将现有 About 内容替换为：

```tsx
<section className="about page-section" id="about">
  <p className="section-label">01 / ABOUT</p>
  <div className="about-summary">
    <h2>从一个具体的问题开始。</h2>
    <p>
      我关注 AI 应用、自动化工作流和 Vibe Coding，也会记录 AI
      岗位与实际应用中的观察。我喜欢把模糊的想法拆开，再一步步做成可以使用的助手、工具、游戏和内容。
    </p>
  </div>
</section>
```

- [ ] **Step 5: 写入首屏与全局视觉 CSS**

将 `:root`、`body`、头部、首屏和 About 相关规则替换为以下确定值；删除 `body` 的双线性渐变背景、所有 `--serif` 使用和旧 `.hero-copy`、`.hero-kicker`、`.hero-note`、`.hero-actions`、`.primary-button` 规则：

```css
:root {
  --paper: #f7f5f0;
  --ink: #14202b;
  --muted: #697078;
  --accent: #d8613c;
  --line: rgba(20, 32, 43, 0.16);
  --sans: "PingFang SC", "Microsoft YaHei", "Noto Sans SC", Arial, sans-serif;
}

body {
  margin: 0;
  overflow-x: hidden;
  background: var(--paper);
  color: var(--ink);
  font-family: var(--sans);
}

.site-header,
.page-section {
  width: min(100%, 1440px);
  margin: 0 auto;
  padding-inline: clamp(22px, 5vw, 76px);
}

.site-header {
  min-height: 84px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 28px;
  border-bottom: 1px solid var(--line);
}

.hero {
  min-height: min(780px, calc(100vh - 84px));
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(300px, 0.65fr);
  gap: clamp(48px, 8vw, 128px);
  align-items: end;
  padding-top: clamp(90px, 13vh, 150px);
  padding-bottom: clamp(64px, 10vh, 110px);
  border-bottom: 1px solid var(--line);
}

.hero-index,
.section-label,
.project-kicker {
  margin: 0;
  color: var(--accent);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
}

.hero-name {
  margin: 24px 0 0;
  font-size: clamp(82px, 12vw, 176px);
  font-weight: 800;
  letter-spacing: -0.075em;
  line-height: 0.86;
}

.hero-name span {
  display: block;
  margin-top: 28px;
  font-size: clamp(18px, 2.2vw, 30px);
  font-weight: 600;
  letter-spacing: 0.12em;
  line-height: 1;
}

.hero-message {
  padding-bottom: 10px;
}

.hero-statement {
  margin: 0;
  font-size: clamp(30px, 3.6vw, 54px);
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1.28;
}

.hero-focus {
  margin: 28px 0 0;
  color: var(--muted);
  font-size: 15px;
  line-height: 1.8;
}

.hero-link {
  display: inline-flex;
  gap: 16px;
  margin-top: 42px;
  padding-bottom: 7px;
  border-bottom: 1px solid currentColor;
  font-size: 14px;
  font-weight: 700;
}

.about {
  display: grid;
  grid-template-columns: minmax(120px, 0.35fr) minmax(0, 1.4fr);
  gap: clamp(40px, 7vw, 110px);
  padding-top: clamp(90px, 11vw, 150px);
  padding-bottom: clamp(90px, 11vw, 150px);
  border-bottom: 1px solid var(--line);
}

.about-summary {
  max-width: 980px;
}

.about-summary h2 {
  margin: 0;
  font-size: clamp(46px, 6.2vw, 88px);
  font-weight: 750;
  letter-spacing: -0.055em;
  line-height: 1.05;
}

.about-summary p {
  max-width: 760px;
  margin: 38px 0 0 auto;
  color: var(--muted);
  font-size: 18px;
  line-height: 1.95;
}
```

- [ ] **Step 6: 运行测试并提交**

Run: `npm test && npm run lint && git diff --check`

Expected: 新首屏测试 PASS；全部命令 exit code 0。

```bash
git add app/page.tsx app/globals.css tests/site-content.test.mjs
git commit -m "feat: redesign portfolio hero and about"
```

### Task 2: 用真实素材重做作品区

**Files:**
- Create: `public/media/finance-ai-assistant.png`
- Modify: `tests/site-content.test.mjs`
- Modify: `app/page.tsx:100-255`
- Modify: `app/globals.css:250-700`

**Interfaces:**
- Consumes: 用户提供的 1920 × 879 PNG、现有小红书截图、久坐提醒图标和外链常量。
- Produces: `.featured-project`、`.project-pair`、`.content-project` 三类作品布局。

- [ ] **Step 1: 写入作品结构失败测试**

在测试文件末尾加入：

```js
test("uses real imagery and the approved lightweight work layout", async () => {
  assert.match(page, /\/media\/finance-ai-assistant\.png/);
  assert.match(page, /className="featured-project"/);
  assert.match(page, /className="project-pair"/);
  assert.match(page, /className="content-project"/);
  assert.doesNotMatch(page, /finance-preview/);
  assert.doesNotMatch(page, /issue-label/);

  const png = await readFile(
    new URL("../public/media/finance-ai-assistant.png", import.meta.url),
  );
  assert.equal(png.readUInt32BE(16), 1920);
  assert.equal(png.readUInt32BE(20), 879);
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `npm test`

Expected: FAIL，缺少真实财务图片、新作品类名，且仍存在 `finance-preview`。

- [ ] **Step 3: 保存用户截图**

将 `C:\Users\12068\AppData\Local\Temp\codex-clipboard-2d3fa864-88f7-4a57-b0d3-e1601e6b6ca4.png` 原样复制为 `public/media/finance-ai-assistant.png`。读取 PNG IHDR 并确认宽度 `1920`、高度 `879`。

- [ ] **Step 4: 替换作品区 JSX**

使用以下结构替换现有 `#work` 整段；项目描述和链接沿用现有已验证文案：

```tsx
<section className="work page-section" id="work">
  <div className="section-intro">
    <p className="section-label">02 / SELECTED WORK</p>
    <h2>做出来，才算数。</h2>
  </div>

  <article className="featured-project">
    <div className="project-heading">
      <div>
        <p className="project-kicker">AI APPLICATION / 财务效率工具</p>
        <h3>财务 AI 小助理</h3>
      </div>
      <div className="project-description">
        <p>面向项目应收、应付管理设计的财务助手。上传 Excel 后自动整理数据，识别逾期与临近付款事项，并把重点风险呈现在看板中。</p>
        <p>常见查询由本地规则快速处理；复杂问题结合财务数据上下文调用大模型完成分析。</p>
        <ul className="tag-list"><li>Excel 数据解析</li><li>应收应付看板</li><li>逾期风险提示</li><li>自然语言查询</li></ul>
      </div>
    </div>
    <figure className="finance-screenshot">
      <Image src="/media/finance-ai-assistant.png" alt="财务 AI 小助理实际界面，包含应收应付看板、AI 助手和 Excel 数据问答入口" width={1920} height={879} sizes="(max-width: 760px) calc(100vw - 44px), 1288px" priority />
      <figcaption>财务 AI 小助理 · 实际界面</figcaption>
    </figure>
  </article>

  <div className="project-pair">
    <article className="simple-project reminder-project">
      <p className="project-kicker">VIBE CODING / 桌面工具</p>
      <h3>久坐提醒</h3>
      <p>
        一个常驻系统托盘的久坐提醒工具。支持自定义间隔、延后提醒、工作时间、定时暂停、开机自启和每日统计。
      </p>
      <div className="reminder-visual" aria-hidden="true">
        <Image
          className="reminder-icon"
          src="/media/stand-up-reminder.ico"
          alt=""
          width={48}
          height={48}
        />
        <div>
          <strong>该起来活动啦</strong>
          <small>休息 5 分钟，眼睛也松一口气。</small>
        </div>
      </div>
      <ExternalLink href="https://github.com/long32132/stand-up-reminder">
        查看源码
      </ExternalLink>
    </article>
    <article className="simple-project dice-project">
      <p className="project-kicker">VIBE CODING / 网页游戏</p>
      <h3>大话骰子 · 对饮版</h3>
      <p>
        玩家与电脑对战的大话骰子网页游戏，支持叫骰、斋与不斋、开盅、劈和反劈，还有饮酒计分与醉酒动画。
      </p>
      <div className="dice-visual" aria-hidden="true">
        <span className="die die-one"><i /></span>
        <span className="die die-five">
          <i /><i /><i /><i /><i />
        </span>
        <small>项目视觉标识</small>
      </div>
      <div className="project-links">
        <ExternalLink href="https://long32132.github.io/-2333/">
          在线体验
        </ExternalLink>
        <ExternalLink href="https://github.com/long32132/-2333">
          查看源码
        </ExternalLink>
      </div>
    </article>
  </div>

  <article className="content-project">
    <div className="content-copy">
      <p className="project-kicker">CONTENT / AI 岗位观察</p>
      <h3>深井牛肉饭</h3>
      <p>
        除了做工具，我也会记录自己对 AI 岗位、AI
        训练和实际应用的观察。
      </p>
      <ul className="post-list">
        <li>AI 岗位又有 3 个新机会</li>
        <li>AI训练师真的只是数据标注吗</li>
      </ul>
      <ExternalLink href={XHS_URL}>去小红书看看</ExternalLink>
    </div>
    <Image
      src="/media/xiaohongshu-posts.png"
      alt="深井牛肉饭小红书账号的两篇 AI 主题内容"
      width={675}
      height={514}
      sizes="(max-width: 760px) calc(100vw - 44px), 620px"
    />
  </article>
</section>
```

- [ ] **Step 5: 写入作品区 CSS**

删除 `.work-grid`、`.project-card`、`.finance-preview`、`.visual-caption`、`.preview-bar`、`.finance-metrics`、`.finance-chart`、`.finance-query`、`.issue-label`、`.xhs-card` 和旧卡片 hover 规则，加入：

```css
.work {
  padding-top: clamp(90px, 11vw, 150px);
  padding-bottom: clamp(90px, 11vw, 150px);
  border-bottom: 1px solid var(--line);
}

.section-intro {
  display: grid;
  grid-template-columns: minmax(120px, 0.35fr) minmax(0, 1.4fr);
  gap: clamp(40px, 7vw, 110px);
  align-items: end;
  margin-bottom: 70px;
}

.section-intro h2 {
  margin: 0;
  font-size: clamp(54px, 7vw, 102px);
  font-weight: 760;
  letter-spacing: -0.06em;
  line-height: 0.98;
}

.featured-project {
  padding-block: clamp(42px, 6vw, 82px);
  border-top: 1px solid var(--line);
}

.project-heading {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(340px, 0.65fr);
  gap: clamp(50px, 9vw, 150px);
  margin-bottom: 54px;
}

.project-heading h3,
.simple-project h3,
.content-project h3 {
  margin: 18px 0 0;
  font-size: clamp(40px, 5.6vw, 76px);
  font-weight: 740;
  letter-spacing: -0.055em;
  line-height: 1.03;
}

.project-description,
.simple-project > p,
.content-copy > p {
  color: var(--muted);
  font-size: 17px;
  line-height: 1.85;
}

.finance-screenshot {
  position: relative;
  margin: 0;
  overflow: hidden;
  border: 1px solid var(--line);
  background: #f1f3f5;
}

.finance-screenshot img,
.content-project img {
  display: block;
  width: 100%;
  height: auto;
}

.finance-screenshot figcaption {
  position: absolute;
  left: 18px;
  bottom: 18px;
  padding: 7px 11px;
  background: rgba(20, 32, 43, 0.88);
  color: #fff;
  font-size: 11px;
}

.project-pair {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
}

.simple-project {
  min-height: 520px;
  display: flex;
  flex-direction: column;
  padding: clamp(38px, 5vw, 68px);
}

.simple-project + .simple-project {
  border-left: 1px solid var(--line);
}

.content-project {
  display: grid;
  grid-template-columns: minmax(300px, 0.7fr) minmax(0, 1fr);
  gap: clamp(48px, 8vw, 120px);
  align-items: center;
  padding-block: clamp(72px, 9vw, 120px);
  border-bottom: 1px solid var(--line);
}
```

- [ ] **Step 6: 验证并提交作品区**

Run: `npm test && npm run lint && git diff --check`

Expected: 作品结构测试 PASS；全部命令 exit code 0。

```bash
git add app/page.tsx app/globals.css tests/site-content.test.mjs public/media/finance-ai-assistant.png
git commit -m "feat: rebuild portfolio work showcase"
```

### Task 3: 简化工作流、联系区与手机端

**Files:**
- Modify: `tests/site-content.test.mjs`
- Modify: `app/page.tsx:255-340`
- Modify: `app/globals.css:700-1050`

**Interfaces:**
- Consumes: 现有 `workflowSteps` 数据、联系链接、Task 1–2 的颜色和排版变量。
- Produces: `.workflow-line`、`.contact-statement` 和统一的 `760px` 手机端规则。

- [ ] **Step 1: 写入流程与移动端失败测试**

```js
test("uses the lightweight workflow and contact close", () => {
  assert.match(page, /className="workflow-line"/);
  assert.match(page, /有想法，欢迎和我聊聊。/);
  assert.match(styles, /@media \(max-width: 760px\)/);
  assert.match(styles, /\.project-pair[\s\S]*grid-template-columns: 1fr/);
  assert.doesNotMatch(page, /workflow-card/);
});
```

- [ ] **Step 2: 运行测试并确认失败**

Run: `npm test`

Expected: FAIL，缺少 `.workflow-line` 和新联系文案，仍存在 `workflow-card`。

- [ ] **Step 3: 替换工作流与联系 JSX**

```tsx
<section className="workflow page-section" id="workflow">
  <div className="section-intro">
    <p className="section-label">03 / WORKFLOW</p>
    <h2>让判断有据可查。</h2>
  </div>
  <div className="workflow-line">
    {workflowSteps.map(([number, title, description]) => (
      <div className="workflow-item" key={number}>
        <span>{number}</span><strong>{title}</strong><small>{description}</small>
      </div>
    ))}
  </div>
  <div className="workflow-note">
    <p>工作流调用博查、百度和微软搜索获取外部证据，通过多来源结果交叉核验，批量输出可复查的结构化结果。</p>
    <ul><li>真实性结论</li><li>判断理由</li><li>证据来源</li><li>置信度</li></ul>
  </div>
</section>

<section className="contact page-section" id="contact">
  <p className="section-label">04 / CONTACT</p>
  <h2 className="contact-statement">有想法，欢迎和我聊聊。</h2>
  <div className="contact-links">
    <a href="mailto:956348436@qq.com">Email ↗</a>
    <ExternalLink href="https://github.com/long2132" className="contact-link">
      GitHub
    </ExternalLink>
    <ExternalLink href={XHS_URL} className="contact-link">
      小红书
    </ExternalLink>
    <span>13059532132</span>
  </div>
  <footer><span>张景隆 · 2026</span><span>Ideas into usable things.</span></footer>
</section>
```

- [ ] **Step 4: 写入工作流、联系区和移动端 CSS**

```css
.workflow,
.contact {
  padding-top: clamp(90px, 11vw, 150px);
  padding-bottom: clamp(90px, 11vw, 150px);
  border-bottom: 1px solid var(--line);
}

.workflow-line {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
}

.workflow-item {
  min-height: 190px;
  display: flex;
  flex-direction: column;
  padding: 28px 22px;
}

.workflow-item + .workflow-item {
  border-left: 1px solid var(--line);
}

.workflow-item span { color: var(--accent); font-size: 12px; }
.workflow-item strong { margin-top: auto; font-size: 20px; }
.workflow-item small { margin-top: 10px; color: var(--muted); line-height: 1.55; }

.workflow-note {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 60px;
  margin-top: 42px;
  color: var(--muted);
}

.contact-statement {
  max-width: 980px;
  margin: 52px 0 82px;
  font-size: clamp(60px, 9vw, 132px);
  font-weight: 780;
  letter-spacing: -0.07em;
  line-height: 0.98;
}

@media (max-width: 760px) {
  .site-header { align-items: flex-start; flex-direction: column; padding-block: 18px; }
  nav { width: 100%; justify-content: space-between; gap: 12px; overflow-x: auto; }
  nav a { padding: 8px 0 12px; font-size: 12px; white-space: nowrap; }
  .hero { min-height: auto; grid-template-columns: 1fr; gap: 64px; padding-block: 78px 64px; }
  .hero-name { font-size: clamp(72px, 25vw, 112px); }
  .about, .section-intro { grid-template-columns: 1fr; gap: 32px; }
  .about-summary p { margin-left: 0; }
  .project-heading, .content-project, .workflow-note { grid-template-columns: 1fr; gap: 36px; }
  .project-pair { grid-template-columns: 1fr; }
  .simple-project + .simple-project { border-left: 0; border-top: 1px solid var(--line); }
  .workflow-line { grid-template-columns: 1fr; }
  .workflow-item { min-height: 132px; }
  .workflow-item + .workflow-item { border-left: 0; border-top: 1px solid var(--line); }
  .finance-screenshot figcaption { position: static; display: block; background: var(--ink); }
  .contact-statement { margin-bottom: 56px; }
}
```

- [ ] **Step 5: 删除所有旧样式和无用组件规则**

删除不再被 JSX 使用的 `.section-heading`、`.about-grid`、`.about-lead`、`.about-body`、`.workflow-card`、`.workflow-steps`、`.workflow-step`、`.workflow-summary`、旧 `.contact-grid` 和对应响应式规则。保留焦点样式、链接样式、久坐提醒图标、骰子标识和 `prefers-reduced-motion`。

- [ ] **Step 6: 验证并提交**

Run: `npm test && npm run lint && git diff --check`

Expected: 全部测试 PASS；lint 和 diff 检查 exit code 0。

```bash
git add app/page.tsx app/globals.css tests/site-content.test.mjs
git commit -m "feat: simplify workflow contact and mobile layout"
```

### Task 4: 生产验证、复核与现有站点发布

**Files:**
- Read: `.openai/hosting.json`
- Generated: `dist/**`

**Interfaces:**
- Consumes: Tasks 1–3 的干净已提交源码和现有 `project_id`。
- Produces: 通过构建与复核的现有私有站点新版本。

- [ ] **Step 1: 执行完整验证**

Run: `npm test`

Expected: 所有内容与结构测试 PASS。

Run: `npm run lint`

Expected: exit code 0。

Run: `npm run build`

Expected: 输出 `Build complete` 并生成 `dist/server/index.js`。

Run: `git diff --check && git status --short`

Expected: 无空白错误，工作树干净。

- [ ] **Step 2: 请求独立代码复核**

复核设计说明 `docs/superpowers/specs/2026-07-18-clean-portfolio-redesign-design.md` 与实施提交，重点检查真实素材、移动端导航、图片比例、外链、标题层级和遗留卡片样式。Critical 和 Important 问题必须在发布前修复并重新验证。

- [ ] **Step 3: 推送精确源码并打包**

将当前 HEAD 推送到现有 Sites 源码仓库；使用 Sites `package-site.sh` 打包当前 `dist`、`.openai/hosting.json` 和已有迁移。归档必须对应同一 HEAD。

- [ ] **Step 4: 保存并私有部署新版本**

复用 `.openai/hosting.json` 中的现有 `project_id` 保存版本，使用私有部署更新现有站点。不得调用 `create_site`。

- [ ] **Step 5: 轮询并确认网址**

轮询部署状态直至 `succeeded`，确认访问地址保持：

```text
https://zhangjinglong-ai-works.kariiii1.chatgpt.site
```
