import Link from 'next/link';
import { LayoutDashboard, ShieldCheck } from 'lucide-react';
import Logo from './Logo';
import LogoutButton from './LogoutButton';

/** Cabecalho das areas internas (painel do aluno e painel do admin). */
export default function AppHeader({ siteName, user, links = [], homeHref = '/painel' }) {
  const initials = user.name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b border-ink-700/70 bg-ink-950/80 backdrop-blur-xl">
      <div className="container-page flex h-16 items-center gap-6">
        <Logo name={siteName} href={homeHref} />

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 transition hover:bg-ink-800 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {user.role === 'admin' && homeHref !== '/admin' && (
            <Link href="/admin" className="btn-ghost btn-sm">
              <ShieldCheck size={14} />
              Admin
            </Link>
          )}
          {user.role === 'admin' && homeHref === '/admin' && (
            <Link href="/painel" className="btn-ghost btn-sm">
              <LayoutDashboard size={14} />
              Ver como aluno
            </Link>
          )}

          <div className="hidden items-center gap-2.5 sm:flex">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-xs font-bold text-ink-950">
              {initials}
            </span>
            <span className="max-w-[140px] truncate text-sm font-medium text-zinc-300">
              {user.name.split(/\s+/)[0]}
            </span>
          </div>

          <LogoutButton compact />
        </div>
      </div>

      {/* navegacao mobile usada pelas areas que ainda passam links ao cabecalho */}
      {links.length > 0 && (
        <nav className="flex gap-1 overflow-x-auto border-t border-ink-700/70 px-5 py-2 md:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-400 transition hover:bg-ink-800 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
