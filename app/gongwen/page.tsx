import Link from "next/link";
import { GongwenFocus } from "../components/gongwen-focus";

export default function GongwenPage() {
  return (
    <main>
      <GongwenFocus />
      <header className="site-header">
        <Link className="brand" href="/" aria-label="返回首页">
          <span className="brand-mark" aria-hidden="true">
            公
          </span>
          <span>公文写作助手</span>
          <em>Dify 工作流 · RAG 知识库</em>
        </Link>
        <nav aria-label="页面导航">
          <Link href="/">← 返回首页</Link>
        </nav>
      </header>

      <section className="page-section work gongwen-demo">
        <div className="section-intro">
          <p className="section-label">AI APPLICATION / 办公效率工具</p>
          <div>
            <h2>公文写作助手</h2>
            <p className="gongwen-lead">
              本项目面向企业全员公文起草场景，基于 Dify 搭建 RAG 知识库 +
              提示词工程 + 标准化工作流，覆盖通知 / 通报 / 报告 / 请示 /
              函五类公文。下方为真实运行的助手，可直接对话生成规范公文。
            </p>
          </div>
        </div>
        <div className="gongwen-frame">
          <iframe
            src="https://udify.app/chat/5JPhPYndFlhfeVUc"
            title="公文写作助手"
          />
        </div>
      </section>
    </main>
  );
}
