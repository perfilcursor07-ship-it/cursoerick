import Link from 'next/link';
import Logo from './Logo';
import LogoutButton from './LogoutButton';

export default function SiteHeader({ siteName, user }) {
  return (
    <header className="sticky top-0 z-40 border-b border-ink-700/70 bg-ink-950/70 backdrop-blur-xl">
      <div className="container-page flex h-16 items-center justify-between">
        <Logo name={siteName} />

        <nav className="hidden items-center gap-7 text-sm text-zinc-400 md:flex">
          <a href="#metodo" className="link-muted">
            O que aprende
          </a>
          <a href="#conteudo" className="link-muted">
            Aulas
          </a>
          <a href="#planos" className="link-muted">
            Planos
          </a>
          <a href="#duvidas" className="link-muted">
            Duvidas
          </a>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link
                href={user.role === 'admin' ? '/admin' : '/painel'}
                className="btn-primary btn-sm"
              >
                {user.role === 'admin' ? 'Painel admin' : 'Minhas aulas'}
              </Link>
              <LogoutButton compact />
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost btn-sm">
                Entrar
              </Link>
              <Link href="/cadastro" className="btn-primary btn-sm">
                Criar conta
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
