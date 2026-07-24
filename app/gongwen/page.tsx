export default function GongwenPage() {
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="/" aria-label="返回首页">
          <span className="brand-mark" aria-hidden="true">
            公
          </span>
          <span>公文写作助手</span>
          <em>Dify 工作流 · RAG 知识库</em>
        </a>
        <nav aria-label="页面导航">
          <a href="/">← 返回首页</a>
        </nav>
      </header>

      <section
        className="page-section"
        style={{ paddingTop: "20px", paddingBottom: "40px" }}
      >
        <div className="section-intro" style={{ marginBottom: "16px" }}>
          <p className="section-label">AI APPLICATION / 办公效率工具</p>
          <h2>公文写作助手</h2>
        </div>

        <p
          style={{
            maxWidth: "700px",
            fontSize: "14px",
            color: "var(--muted, #6b7280)",
            lineHeight: 1.7,
            marginBottom: "24px",
          }}
        >
          本项目面向企业全员公文起草场景，基于 Dify 搭建 RAG 知识库 +
          提示词工程 + 标准化工作流，覆盖通知 / 通报 / 报告 / 请示 / 函
          五类公文。下方为真实运行的助手，可直接对话生成规范公文。
        </p>

        <div
          style={{
            width: "100%",
            height: "72vh",
            minHeight: "560px",
            border: "1px solid var(--line, #e6e8ee)",
            borderRadius: "14px",
            overflow: "hidden",
            background: "#fff",
          }}
        >
          <iframe
            src="https://udify.app/chat/5JPhPYndFlhfeVUc"
            title="公文写作助手"
            style={{ width: "100%", height: "100%", border: 0 }}
          />
        </div>
      </section>
    </main>
  );
}
