import Image from "next/image";

const XHS_URL =
  "https://www.xiaohongshu.com/user/profile/5c8e6bd00000000010024796";

const workflowSteps = [
  ["01", "批量导入", "接收待核验的模型回答"],
  ["02", "多来源检索", "博查 · 百度 · 微软搜索"],
  ["03", "证据交叉核验", "对比多个来源的相关证据"],
  ["04", "真实性判断", "生成结论与判断理由"],
  ["05", "结构化输出", "证据来源 · 置信度 · 结果"],
];

function ExternalLink({
  href,
  children,
  className = "text-link",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a className={className} href={href} target="_blank" rel="noreferrer">
      {children} <span aria-hidden="true">↗</span>
    </a>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="section-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {description ? <p className="section-description">{description}</p> : null}
    </div>
  );
}

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="返回首页顶部">
          <span className="brand-mark" aria-hidden="true">
            张
          </span>
          <span>张景隆</span>
          <em>Personal Edition / 01</em>
        </a>
        <nav aria-label="网站导航">
          <a href="#about">关于我</a>
          <a href="#work">作品</a>
          <a href="#workflow">工作流</a>
          <a href="#contact">联系我</a>
        </nav>
      </header>

      <section className="hero page-section" id="top">
        <div className="hero-copy">
          <p className="eyebrow hero-kicker">Thinking First. AI Second.</p>
          <h1>
            你好，我是张景隆。
            <br />
            我用 AI 做一些
            <span>有用、也有趣</span>
            <br />
            的东西。
          </h1>
        </div>
        <div className="hero-note">
          <p>
            我关注 AI 应用、工作流与 Vibe Coding。
            <br />
            这里记录我做过的工具、游戏和内容。
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="#work">
              看看我做了什么 <span aria-hidden="true">↓</span>
            </a>
            <a className="quiet-link" href="#contact">
              联系我
            </a>
          </div>
        </div>
      </section>

      <section className="about page-section" id="about">
        <SectionHeading eyebrow="01 / About" title="先理解问题，再考虑 AI。" />
        <div className="about-grid">
          <p className="about-lead">
            我做的东西不一定很宏大，但都会从一个具体的问题或念头开始。
          </p>
          <div className="about-body">
            <p>
              有的是一个让财务数据更容易看懂的助手，有的是提醒人别一直坐着的小工具，也有一个可以直接在浏览器里玩的骰子游戏。
            </p>
            <p>
              它们被我一步步做成了可以使用的东西。我也会持续研究 AI
              应用、模型评测、自动化工作流和 Vibe Coding，并把其中有意思的发现分享出来。
            </p>
          </div>
        </div>
      </section>

      <section className="work page-section" id="work">
        <SectionHeading
          eyebrow="02 / Selected Work"
          title="我做的东西"
          description="一些从想法变成实际产品的小项目。"
        />

        <div className="work-grid">
          <article className="project-card finance-card">
            <div className="project-copy">
              <p className="project-type">AI Application / 财务效率工具</p>
              <h3>财务 AI 小助理</h3>
              <p>
                面向项目应收、应付管理设计的财务助手。上传 Excel
                后自动整理数据，计算未收未付金额、逾期天数和临近付款事项，并用看板呈现重点风险。
              </p>
              <p>
                常见查询由本地规则快速处理；复杂问题则结合财务数据上下文调用大模型完成分析。
              </p>
              <ul className="tag-list" aria-label="财务 AI 小助理功能">
                <li>Excel 数据解析</li>
                <li>应收应付看板</li>
                <li>逾期风险提示</li>
                <li>自然语言查询</li>
              </ul>
            </div>
            <div className="finance-preview" aria-label="财务助手界面示意">
              <span className="visual-caption">功能结构示意（非产品截图）</span>
              <div className="preview-bar">
                <span>FINANCE OVERVIEW</span>
                <i />
                <i />
              </div>
              <div className="finance-metrics">
                <div>
                  <small>未收款项</small>
                  <strong>待跟进</strong>
                </div>
                <div>
                  <small>逾期项目</small>
                  <strong className="accent-text">重点</strong>
                </div>
                <div>
                  <small>临近付款</small>
                  <strong>提醒</strong>
                </div>
              </div>
              <div className="finance-chart">
                <span style={{ width: "76%" }} />
                <span style={{ width: "55%" }} />
                <span style={{ width: "86%" }} />
                <span style={{ width: "64%" }} />
              </div>
              <div className="finance-query">
                <span>问：哪些项目需要优先跟进？</span>
                <b>→</b>
              </div>
            </div>
            <span className="issue-label">NO. 01</span>
          </article>

          <article className="project-card reminder-card">
            <p className="project-type">Vibe Coding / 桌面工具</p>
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

          <article className="project-card dice-card">
            <p className="project-type">Vibe Coding / 网页游戏</p>
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

          <article className="project-card xhs-card">
            <div className="xhs-copy">
              <p className="project-type">Content / AI 岗位观察</p>
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
            <div className="xhs-visual">
              <Image
                src="/media/xiaohongshu-posts.png"
                alt="深井牛肉饭小红书账号的两篇 AI 主题内容"
                width={675}
                height={514}
                sizes="(max-width: 760px) 100vw, 48vw"
              />
            </div>
          </article>
        </div>
      </section>

      <section className="workflow page-section" id="workflow">
        <SectionHeading
          eyebrow="03 / Dify Workflow"
          title="模型回答事实核验工作流"
          description="批量验证模型生成内容的真实性，同时保留可复查的判断依据。"
        />
        <div className="workflow-card">
          <div className="workflow-steps">
            {workflowSteps.map(([number, title, description], index) => (
              <div
                className={`workflow-step ${index === 2 ? "is-active" : ""}`}
                key={number}
              >
                <span>{number}</span>
                <strong>{title}</strong>
                <small>{description}</small>
              </div>
            ))}
          </div>
          <div className="workflow-summary">
            <p>
              工作流分别调用博查、百度和微软搜索获取外部证据，通过多来源结果交叉核验，最终批量输出结构化结果。
            </p>
            <ul>
              <li>真实性结论</li>
              <li>判断理由</li>
              <li>证据来源</li>
              <li>置信度</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="contact page-section" id="contact">
        <p className="eyebrow">04 / Contact</p>
        <div className="contact-grid">
          <div>
            <h2>保持联系</h2>
            <p>如果你也在研究 AI 应用、工作流或者 Vibe Coding，欢迎和我交流。</p>
          </div>
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
        </div>
        <footer>
          <span>张景隆 · Personal Edition</span>
          <span>Ideas into usable things.</span>
        </footer>
      </section>
    </main>
  );
}
