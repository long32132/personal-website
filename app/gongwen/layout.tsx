export const metadata = {
  title: "公文写作助手 · 演示",
  description:
    "基于 Dify RAG + 提示词工程的智能公文起草工具，覆盖通知 / 通报 / 报告 / 请示 / 函五类公文。",
};

export default function GongwenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
