import type { Metadata } from 'next'
import { Noto_Sans_KR } from 'next/font/google'
import './globals.css'

const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700', '900'],
  variable: '--font-noto-sans-kr',
})

export const metadata: Metadata = {
  title: '길품국어 - 수능 국어 1등급으로 가는 마지막 점검',
  description: '고려대 국어국문학과 길품국어쌤과 함께하는 수능국어 능력치 UP! 선배들의 경험이 증명하는 우기분',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={`${notoSansKR.variable} font-sans`}>
        {children}
      </body>
    </html>
  )
}
