import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { SiteMotion } from "./components/site-motion";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f5f0" },
    { media: "(prefers-color-scheme: dark)", color: "#12171c" },
  ],
};

export const metadata: Metadata = {
  title: "张景隆｜AI 应用、工作流与 Vibe Coding",
  description: "张景隆的个人网站：记录 AI 应用、工作流、Vibe Coding 作品与内容。",
  openGraph: {
    title: "张景隆｜把想法做成可以使用的东西",
    description: "AI 应用、工作流、Vibe Coding 作品与内容。",
    type: "website",
    locale: "zh_CN",
    images: [
      {
        url: "/og-portfolio-v2.png",
        width: 1200,
        height: 630,
        alt: "张景隆个人网站的暖色编辑风分享封面",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "张景隆｜把想法做成可以使用的东西",
    description: "AI 应用、工作流、Vibe Coding 作品与内容。",
    images: ["/og-portfolio-v2.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <Script id="motion-gate" strategy="beforeInteractive">
          {`(function(){try{var reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;if(reduce){document.documentElement.classList.add("reduced-motion");return;}document.documentElement.classList.add("js");setTimeout(function(){if(document.documentElement.classList.contains("motion-ready"))return;document.querySelectorAll("[data-reveal]").forEach(function(el){el.classList.add("is-revealed");});},2500);}catch(e){}})();`}
        </Script>
        {children}
        <SiteMotion />
      </body>
    </html>
  );
}
