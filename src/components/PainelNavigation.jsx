'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, ChevronLeft, ChevronRight, Menu, UserRound, X } from 'lucide-react';
import LogoutButton from './LogoutButton';

const links = [
  { href: '/painel', label: 'Minhas aulas', icon: BookOpen },
  { href: '/painel/perfil', label: 'Meu perfil', icon: UserRound },
];

export default function PainelNavigation({ user, children }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const initials = user.name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  useEffect(() => {
    if (!mobileOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setMobileOpen(false);
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [mobileOpen]);

  function isActive(href) {
    return href === '/painel'
      ? pathname === '/painel' || pathname.startsWith('/painel/aula/')
      : pathname.startsWith(href);
  }

  function renderLinks(compact = false, onNavigate = () => {}) {
    return links.map(({ href, label, icon: Icon }) => {
      const active = isActive(href);
      return (
        <Link
          key={href}
          href={href}
          onClick={onNavigate}
          title={compact ? label : undefined}
          aria-label={compact ? label : undefined}
          aria-current={active ? 'page' : undefined}
          className={[
            'group flex items-center rounded-xl border-l-2 py-2.5 text-[13px] font-medium transition',
            compact ? 'justify-center px-0' : 'gap-2.5 px-3',
            active
              ? 'border-brand-400 bg-gradient-to-r from-brand-500/15 to-brand-500/[0.03] text-white'
              : 'border-transparent text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100',
          ].join(' ')}
        >
          <Icon
            size={18}
            className={active ? 'shrink-0 text-brand-300' : 'shrink-0 text-zinc-500 transition group-hover:text-zinc-300'}
          />
          <span className={compact ? 'sr-only' : 'truncate'}>{label}</span>
        </Link>
      );
    });
  }

  return (
    <div className="lg:flex lg:min-h-screen">
      <aside
        className={[
          'sticky top-0 hidden h-screen shrink-0 flex-col border-r border-white/[0.06] bg-gradient-to-b from-ink-900/70 to-ink-950 transition-[width] duration-300 lg:flex',
          collapsed ? 'w-[68px]' : 'w-56',
        ].join(' ')}
      >
        <div className={['flex min-h-[68px] items-center border-b border-white/[0.06]', collapsed ? 'justify-center px-2' : 'justify-between px-5'].join(' ')}>
          {!collapsed && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-300">Área do aluno</p>
              <p className="mt-1 text-xs text-zinc-500">Seu espaço de aprendizado</p>
            </div>
          )}
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            className="grid h-9 w-9 place-items-center rounded-xl border border-white/[0.07] bg-white/[0.03] text-zinc-400 transition hover:border-brand-500/30 hover:bg-brand-500/10 hover:text-brand-200"
            aria-label={collapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
            aria-expanded={!collapsed}
            title={collapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            {collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
          </button>
        </div>

        <nav className="flex-1 space-y-1.5 px-3 py-5" aria-label="Menu do painel">
          {renderLinks(collapsed)}
        </nav>

        <div className="border-t border-white/[0.06] p-3">
          <div
            className={[
              'flex min-w-0 items-center rounded-xl bg-white/[0.035]',
              collapsed ? 'justify-center p-2' : 'gap-3 p-3',
            ].join(' ')}
            title={collapsed ? `${user.name} · ${user.email}` : undefined}
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-emerald-700 text-xs font-bold text-ink-950 ring-2 ring-brand-400/15">
              {initials}
            </span>
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-zinc-200">{user.name}</p>
                <p className="truncate text-[11px] text-zinc-500">{user.email}</p>
              </div>
            )}
          </div>
          <div className={collapsed ? 'mt-2 flex justify-center' : 'mt-3'}>
            <LogoutButton compact={collapsed} />
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 text-sm font-medium text-zinc-200 transition hover:border-brand-500/30 hover:bg-brand-500/10"
            aria-label="Abrir menu do painel"
            aria-controls="painel-mobile-menu"
            aria-expanded={mobileOpen}
          >
            <Menu size={17} className="text-brand-300" />
            Menu
          </button>
        </div>
        {children}
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/65 backdrop-blur-[2px]"
            onClick={() => setMobileOpen(false)}
            aria-label="Fechar menu"
          />
          <aside
            id="painel-mobile-menu"
            className="absolute inset-y-0 left-0 flex w-[min(17rem,84vw)] flex-col border-r border-white/10 bg-ink-950 shadow-2xl shadow-black/60"
            aria-label="Menu do painel"
          >
            <div className="flex min-h-[68px] items-center justify-between border-b border-white/[0.06] px-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-300">Área do aluno</p>
                <p className="mt-1 text-xs text-zinc-500">Seu espaço de aprendizado</p>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-xl border border-white/[0.07] text-zinc-400 transition hover:bg-white/[0.06] hover:text-white"
                aria-label="Fechar menu"
              >
                <X size={18} />
              </button>
            </div>
            <nav className="space-y-1.5 px-3 py-5">
              {renderLinks(false, () => setMobileOpen(false))}
            </nav>
            <div className="mt-auto border-t border-white/[0.06] p-4">
              <div className="flex min-w-0 items-center gap-3 rounded-xl bg-white/[0.035] p-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-emerald-700 text-xs font-bold text-ink-950 ring-2 ring-brand-400/15">
                  {initials}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-zinc-200">{user.name}</p>
                  <p className="truncate text-[11px] text-zinc-500">{user.email}</p>
                </div>
              </div>
              <LogoutButton className="mt-3 w-full" />
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}





