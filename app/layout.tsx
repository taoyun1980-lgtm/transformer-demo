import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Transformer 原理演示 - 逐步理解注意力机制",
  description: "用真实数据案例，逐步演示 Transformer 架构的每个核心组件",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
