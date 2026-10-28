import { NextResponse } from 'next/server';
import { SESSION_COOKIE, readSession } from '@/lib/jwt';

/**
 * Protege as areas internas antes da pagina renderizar.
 * Roda no runtime edge, por isso usa apenas jose (sem banco de dados).
 */
export async function middleware(request) {
  const { pathname, search } = request.nextUrl;
  const session = await readSession(request.cookies.get(SESSION_COOKIE)?.value);

  const isAuthPage = pathname === '/login' || pathname === '/cadastro';
  const isPanel = pathname.startsWith('/painel');
  const isAdmin = pathname.startsWith('/admin');

  if (session && isAuthPage) {
    return NextResponse.redirect(
      new URL(session.role === 'admin' ? '/admin' : '/painel', request.url)
    );
  }

  if (!session && (isPanel || isAdmin)) {
    const url = new URL('/login', request.url);
    url.searchParams.set('next', pathname + search);
    return NextResponse.redirect(url);
  }

  if (isAdmin && session?.role !== 'admin') {
    return NextResponse.redirect(new URL('/painel', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/cadastro', '/painel/:path*', '/admin/:path*'],
};
