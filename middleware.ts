import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {

  const acceptLanguage = request.headers.get('accept-language') || ''
  const country = request.geo?.country || ''
  const userAgent = request.headers.get('user-agent') || ''

  // 中文语言判断
  const isChineseLanguage =
    acceptLanguage.toLowerCase().includes('zh')

  // 中国 IP 判断
  const isChinaIP = country === 'CN'

  // 常见中国浏览器 UA
  const isChineseUA =
    userAgent.includes('MicroMessenger') ||  // 微信
    userAgent.includes('QQBrowser') ||
    userAgent.includes('Baidu') ||
    userAgent.includes('Sogou') ||
    userAgent.includes('360SE') ||
    userAgent.includes('360EE')

  if (isChineseLanguage || isChinaIP || isChineseUA) {
    return NextResponse.redirect('https://www.google.com', 302)
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/:path*',
}
