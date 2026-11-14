import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '麥克在幹嘛 | Michael Action Center',
  description: 'Michael 個人戰情室、7 層 AI 產業鏈研究、學習報告與生活旅遊紀錄',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-Hant" className="dark" suppressHydrationWarning>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
