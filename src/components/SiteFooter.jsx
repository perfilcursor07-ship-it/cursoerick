import Link from 'next/link';
import Logo from './Logo';

export default function SiteFooter({ siteName }) {
  return (
    <footer className="border-t border-ink-700/70 bg-ink-950">
      <div className="container-page flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <Logo name={siteName} />
          <p className="max-w-sm text-sm text-zinc-500">
            Plataforma de video aulas com liberacao progressiva de conteudo.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-zinc-500">
          <Link href="/login" className="link-muted">
            Entrar
          </Link>
          <Link href="/cadastro" className="link-muted">
            Criar conta
          </Link>
          <span className="text-zinc-600">
            &copy; {new Date().getFullYear()} {siteName}
          </span>
        </div>
      </div>
    </footer>
  );
}
