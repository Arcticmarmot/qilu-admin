import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "歧路后台管理系统",
  description: "歧路后台管理系统",
  icons: {
    icon: "/qilu-mark-white.svg",
    shortcut: "/qilu-mark-white.svg",
    apple: "/qilu-mark-white.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
