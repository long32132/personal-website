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
              <p>
                面向项目应收、应付管理设计的财务助手。上传 Excel 后自动整理数据，识别逾期与临近付款事项，并把重点风险呈现在看板中。
              </p>
              <p>
                常见查询由本地规则快速处理；复杂问题结合财务数据上下文调用大模型完成分析。
              </p>
              <ul className="tag-list">
                <li>Excel 数据解析</li>
                <li>应收应付看板</li>
                <li>逾期风险提示</li>
                <li>自然语言查询</li>
              </ul>
            </div>
          </div>
          <figure className="finance-screenshot">
            <Image
              src="/media/finance-ai-assistant.png"
              alt="财务 AI 小助理实际界面，包含应收应付看板、AI 助手和 Excel 数据问答入口"
              width={1920}
              height={879}
              sizes="(max-width: 760px) calc(100vw - 44px), 1288px"
              priority
              unoptimized
            />
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
                unoptimized
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
            unoptimized
          />
        </article>
      </section>

      <section className="workflow page-section" id="workflow">
        <div className="section-intro">
          <p className="section-label">03 / WORKFLOW</p>
          <h2>让判断有据可查。</h2>
        </div>
        <div className="workflow-line">
          {workflowSteps.map(([number, title, description]) => (
            <div className="workflow-item" key={number}>
              <span>{number}</span>
              <strong>{title}</strong>
              <small>{description}</small>
            </div>
          ))}
        </div>
        <div className="workflow-note">
          <p>
            工作流调用博查、百度和微软搜索获取外部证据，通过多来源结果交叉核验，批量输出可复查的结构化结果。
          </p>
          <ul>
            <li>真实性结论</li>
            <li>判断理由</li>
            <li>证据来源</li>
            <li>置信度</li>
          </ul>
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
        <footer>
          <span>张景隆 · 2026</span>
          <span>Ideas into usable things.</span>
        </footer>
      </section>
    </main>
  );
}
