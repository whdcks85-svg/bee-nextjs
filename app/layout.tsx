import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-noto",
});

export const metadata: Metadata = {
  title: "Bee — 배드민턴 장비 빅데이터",
  description: "급수별 실사용 체감 데이터 기반 배드민턴 장비 랭킹",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${notoSansKR.variable} font-[family-name:var(--font-noto)] antialiased`}>
        {children}
      </body>
    </html>
  );
}
