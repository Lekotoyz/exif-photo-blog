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

  // ========= ① 读取 Header =========

  const country =
    req.headers.get('x-vercel-ip-country') || ''

  const acceptLanguage =
    req.headers.get('accept-language')?.toLowerCase() || ''

  const userAgent =
    req.headers.get('user-agent') || ''

  // ========= ② 拦截逻辑 =========

  const isChinaIP = country === 'CN'

  const isChineseLanguage =
    acceptLanguage.includes('zh')

  const isChineseBrowser =
    userAgent.includes('MicroMessenger') ||
    userAgent.includes('QQBrowser') ||
    userAgent.includes('UCBrowser')

  if (isChinaIP || isChineseLanguage || isChineseBrowser) {
    return NextResponse.redirect('https://www.google.com')
  }

  // ========= ③ 原项目逻辑 =========

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
  matcher: '/:path*', // ✅ 不再排除首页
}
