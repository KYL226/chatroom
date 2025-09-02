import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const PUBLIC_PATHS = [
  '/(auth)/login',
  '/(auth)/register',
  '/accueil',
  '/',
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }
  const token = req.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/(auth)/login', req.url));
  }
  try {
    jwt.verify(token, process.env.JWT_SECRET!);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/(auth)/login', req.url));
  }
}

export const config = {
  matcher: ['/admin/:path*', '/chatroom/:path*', '/profil/:path*'],
};
