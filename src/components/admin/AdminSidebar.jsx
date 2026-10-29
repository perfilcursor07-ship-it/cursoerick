'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  ExternalLink,
  Globe,
  LayoutDashboard,
  Menu,
  MonitorPlay,
  Users,
  X,
} from 'lucide-react';
import Logo from '../Logo';
import LogoutButton from '../LogoutButton';

const LINKS = [
  { href: '/admin', label: 'Visão geral', icon: LayoutDashboard, exact: true },
  { href: '/admin/cursos', label: 'Cursos e aulas', icon: BookOpen },
  { href: '/admin/alunos', label: 'Alunos', icon: Users },
  { href: '/admin/site', label: 'Página inicial', icon: Globe },
];

const SHORTCUTS = [
  { href: '/painel', label: 'Ver como aluno', icon: MonitorPlay },
  { href: '/', label: 'Abrir o site', icon: ExternalLink, external: true },
];

function isActive(pathname, link) {
  return link.exact ? pathname === link.href : pathname === link.href || pathname.startsWith(`${link.href}/`);
}

/** Menu lateral fixo do painel do admin (vira gaveta no celular). */
export default function AdminSidebar({ siteName, user }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // fecha a gaveta ao trocar de pagina
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const initials = user.name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return (
    <>
      {/* barra do topo no celular */}
      <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-ink-700/70 bg-ink-950/90 px-4 backdrop-blur-xl lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir menu"
          className="grid h-9 w-9 place-items-center rounded-lg border border-ink-600 bg-ink-800/60 text-zinc-200"
        >
          <Menu size={18} />
        </button>
        <Logo name={siteName} href="/admin" />
        <span className="ml-auto rounded-full border border-brand-500/30 bg-brand-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-300">
          Admin
        </span>
      </header>

      {/* fundo escuro da gaveta */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden="true"
        className={[
          'fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        ].join(' ')}
      />

      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-ink-700/70 bg-ink-900/95 backdrop-blur-xl',
          'transition-transform duration-300 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <div className="flex h-16 items-center justify-between gap-2 px-5">
          <Logo name={siteName} href="/admin" />
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Fechar menu"
            className="grid h-8 w-8 place-items-center rounded-lg text-zinc-400 hover:bg-ink-800 hover:text-white lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">Gerenciar</p>
          <ul className="space-y-1">
            {LINKS.map((link) => {
              const active = isActive(pathname, link);
              const Icon = link.icon;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? 'page' : undefined}
                    className={[
                      'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                      active
                        ? 'bg-brand-500/10 text-white'
                        : 'text-zinc-400 hover:bg-ink-800 hover:text-white',
                    ].join(' ')}
                  >
                    {active && (
                      <span className="absolute inset-y-2 left-0 w-[3px] rounded-r-full bg-brand-400" />
                    )}
                    <Icon
                      size={18}
                      className={active ? 'text-brand-300' : 'text-zinc-500 transition group-hover:text-zinc-300'}
                    />
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <p className="mt-8 px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">Atalhos</p>
          <ul className="space-y-1">
            {SHORTCUTS.map((link) => {
              const Icon = link.icon;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    target={link.external ? '_blank' : undefined}
                    className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-400 transition hover:bg-ink-800 hover:text-white"
                  >
                    <Icon size={18} className="text-zinc-500 transition group-hover:text-zinc-300" />
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-ink-700/70 p-3">
          <div className="flex items-center gap-3 rounded-xl bg-ink-800/50 p-2.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-xs font-bold text-white">
              {initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-zinc-100">{user.name}</p>
              <p className="truncate text-[11px] text-zinc-500">{user.email}</p>
            </div>
            <LogoutButton compact />
          </div>
        </div>
      </aside>
    </>
  );
}
