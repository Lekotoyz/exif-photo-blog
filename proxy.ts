import { auth } from './src/auth/server'
import { NextRequest, NextResponse } from 'next/server'
import type { NextApiRequest, NextApiResponse } from 'next'
import {
  PATH_ADMIN,
  PATH_ADMIN_PHOTOS,
  PATH_OG,
  PATH_OG_SAMPLE,
  PREFIX_PHOTO,
  PREFIX_TAG,
} from './src/app/path'

export function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  // ✅ 读取国家（Vercel Header）
  const country =
    req.headers.get('x-vercel-ip-country') || ''

  const acceptLanguage =
    req.headers.get('accept-language') || ''

  const userAgent =
    req.headers.get('user-agent') || ''

  // 🇨🇳 判断中国 IP
  const isChinaIP = country === 'CN'

  // 🇨🇳 判断中文浏览器
  const isChineseLanguage =
    acceptLanguage.toLowerCase().includes('zh')

  // 🇨🇳 判断微信 / QQ 浏览器
  const isChineseBrowser =
    userAgent.includes('MicroMessenger') ||
    userAgent.includes('QQBrowser') ||
    userAgent.includes('UCBrowser')

  // 🚫 如果是中国 IP 或 中文浏览器 → 跳转 Google
  if (isChinaIP || isChineseLanguage || isChineseBrowser) {
    return NextResponse.redirect('https://www.google.com')
  }

  // ========= 原有逻辑 =========

  if (pathname === PATH_ADMIN) {
    return NextResponse.redirect(
      new URL(PATH_ADMIN_PHOTOS, req.url)
    )
  }

  if (pathname === PATH_OG) {
    return NextResponse.redirect(
      new URL(PATH_OG_SAMPLE, req.url)
    )
  }

  if (/^\/photos\/(.+)$/.test(pathname)) {
    const matches = pathname.match(/^\/photos\/(.+)$/)
    return NextResponse.rewrite(
      new URL(`${PREFIX_PHOTO}/${matches?.[1]}`, req.url)
    )
  }

  if (/^\/t\/(.+)$/.test(pathname)) {
    const matches = pathname.match(/^\/t\/(.+)$/)
    return NextResponse.rewrite(
      new URL(`${PREFIX_TAG}/${matches?.[1]}`, req.url)
    )
  }

  return auth(
    req as unknown as NextApiRequest,
    {} as NextApiResponse
  )
}

export const config = {
  matcher: [
    '/((?!api$|api/auth|_next/static|_next/image|favicon.ico$|favicons/|grid$|full$|home-image$|template-image$|template-image-tight$|template-url$|$).*)',
  ],
}
