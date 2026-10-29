import Link from 'next/link';
import { ArrowUpRight, Menu } from 'lucide-react';
import Logo from './Logo';
import LogoutButton from './LogoutButton';

const NAV_LINKS = [
  { href: '#metodo', label: 'O método' },
  { href: '#conteudo', label: 'Aulas' },
  { href: '#planos', label: 'Planos' },
  { href: '#duvidas', label: 'Dúvidas' },
];

export default function SiteHeader({ siteName, user }) {
  return (
    <>
      <header className="sticky top-0 z-40 px-3 pt-3 sm:px-5 sm:pt-4">
        <div className="relative mx-auto flex min-h-[68px] max-w-6xl items-center justify-between gap-3 rounded-[20px] border border-white/10 bg-[#0c1211]/90 px-3.5 shadow-[0_18px_50px_-20px_rgba(0,0,0,.8),0_0_0_1px_rgba(16,185,129,.06)] backdrop-blur-2xl sm:px-5">
          <div className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-brand-300/60 to-transparent" />
          <Logo name={siteName} />

          <nav className="hidden items-center gap-0.5 rounded-full border border-white/[0.07] bg-white/[0.035] p-1 lg:flex" aria-label="Navegação principal">
            {NAV_LINKS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-full px-3.5 py-2 text-xs font-semibold text-zinc-400 transition hover:bg-brand-400/10 hover:text-brand-200"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            {user ? (
              <>
                <Link
                  href={user.role === 'admin' ? '/admin' : '/painel'}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full bg-brand-400 px-3 text-[11px] font-bold text-ink-950 shadow-[0_8px_22px_-8px_rgba(52,211,153,.65)] transition hover:bg-brand-300 sm:px-4 sm:text-xs"
                >
                  <span className="sm:hidden">Painel</span>
                  <span className="hidden sm:inline">{user.role === 'admin' ? 'Painel admin' : 'Minhas aulas'}</span>
                  <ArrowUpRight size={14} />
                </Link>
                <LogoutButton compact />
              </>
            ) : (
              <>
                <Link href="/login" className="hidden rounded-full px-3 py-2 text-xs font-semibold text-zinc-300 transition hover:bg-white/5 hover:text-white sm:inline-flex">
                  Entrar
                </Link>
                <Link
                  href="/cadastro"
                  className="inline-flex h-9 items-center gap-1.5 rounded-full bg-brand-400 px-3 text-[11px] font-bold text-ink-950 shadow-[0_8px_22px_-8px_rgba(52,211,153,.65)] transition hover:bg-brand-300 sm:px-4 sm:text-xs"
                >
                  <span className="sm:hidden">Começar</span>
                  <span className="hidden sm:inline">Criar conta</span>
                  <ArrowUpRight size={14} />
                </Link>
              </>
            )}

            <details className="group relative lg:hidden">
              <summary
                aria-label="Abrir menu"
                className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-200 transition hover:border-brand-400/40 hover:text-brand-200 [&::-webkit-details-marker]:hidden"
              >
                <Menu size={17} />
              </summary>
              <nav className="absolute right-0 top-full mt-3 grid w-48 gap-1 rounded-2xl border border-white/10 bg-[#101816] p-2 shadow-2xl" aria-label="Menu">
                {NAV_LINKS.map((item) => (
                  <a key={item.href} href={item.href} className="rounded-xl px-3 py-2 text-xs font-semibold text-zinc-300 transition hover:bg-brand-400/10 hover:text-brand-200">
                    {item.label}
                  </a>
                ))}
                {!user && (
                  <Link href="/login" className="rounded-xl border-t border-white/10 px-3 py-2 text-xs font-semibold text-zinc-300 sm:hidden">
                    Entrar
                  </Link>
                )}
              </nav>
            </details>
          </div>
        </div>
      </header>

    </>
  );
}
