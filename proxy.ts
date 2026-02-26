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

  // ===== 读取请求信息 =====

  const acceptLanguage =
    req.headers.get('accept-language') || ''

  const country =
    req.headers.get('x-vercel-ip-country') || ''

  // ===== 判断条件 =====

  const isChineseLanguage =
    acceptLanguage.toLowerCase().startsWith('zh')

  const isChinaIP =
    country === 'CN'

  // ===== 拦截逻辑 =====

  if (isChineseLanguage || isChinaIP) {
    return NextResponse.redirect('https://www.google.com')
  }

  // ===== 原有逻辑 =====

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
