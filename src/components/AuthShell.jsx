import Link from 'next/link';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import Logo from './Logo';

const HIGHLIGHTS = [
  'Primeira aula liberada na hora do cadastro',
  'Novas aulas liberadas aos poucos, no seu ritmo',
  'Acompanhe seu progresso em cada modulo',
  'Assista pelo celular, tablet ou computador',
];

export default function AuthShell({ siteName, title, subtitle, children, showAside = true }) {
  const centered = !showAside;

  return (
    <div className="flex min-h-screen min-w-0 overflow-x-hidden bg-ink-950">
      <aside className={showAside ? 'relative hidden w-[46%] flex-col justify-between overflow-hidden border-r border-ink-700/70 bg-ink-900/60 p-10 lg:flex' : 'hidden'}>
        <div className="absolute -left-20 top-0 h-80 w-80 rounded-full bg-brand-600/20 blur-3xl" />
        <div className="absolute inset-0 bg-grid-dark bg-[size:44px_44px] opacity-60" />

        <div className="relative">
          <Logo name={siteName} />
        </div>

        <div className="relative max-w-sm">
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-white">
            Aprenda com um passo por vez.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-zinc-400">
            As aulas sao liberadas gradualmente para voce aplicar o conteudo antes de avancar.
          </p>

          <ul className="mt-8 space-y-3">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-zinc-300">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-brand-400" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-zinc-600">
          &copy; {new Date().getFullYear()} {siteName}
        </p>
      </aside>

      <main className={centered ? 'relative flex flex-1 flex-col min-w-0 overflow-hidden bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,.16),transparent_38%),#07070a]' : 'flex flex-1 flex-col'}>
        {centered && (
          <>
            <div className="pointer-events-none absolute inset-0 bg-grid-dark bg-[size:42px_42px] opacity-30 [mask-image:linear-gradient(to_bottom,black,transparent_70%)]" />
            <div className="pointer-events-none absolute -right-28 top-28 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" />
          </>
        )}

        <div className={centered ? 'relative flex items-center justify-center px-6 pb-2 pt-8 sm:pt-10' : 'flex items-center justify-between p-6'}>
          <div className={centered ? 'absolute left-1/2 -translate-x-1/2' : 'lg:hidden'}>
            <Logo name={siteName} />
          </div>
          <Link href="/" className={centered ? 'btn-ghost btn-sm absolute right-6' : 'btn-ghost btn-sm ml-auto'}>
            <ArrowLeft size={14} />
            Inicio
          </Link>
        </div>

        <div className="relative flex min-w-0 flex-1 items-center justify-center px-4 pb-12 pt-4 sm:px-6 sm:pb-16">
          <div className={centered ? 'w-[calc(100vw-2rem)] animate-fade-up sm:w-full sm:max-w-[440px]' : 'w-full max-w-sm animate-fade-up'}>
            <div className={centered ? 'rounded-[28px] border border-white/10 bg-ink-900/80 p-5 shadow-[0_24px_80px_-30px_rgba(16,185,129,.5)] backdrop-blur-xl sm:p-8' : ''}>
              <div className={centered ? 'text-center' : ''}>
                {centered && (
                  <div className="mx-auto mb-5 grid h-11 w-11 place-items-center rounded-2xl border border-brand-400/25 bg-brand-400/10 text-xl text-brand-300">
                    ✦
                  </div>
                )}
                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-[27px]">{title}</h1>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{subtitle}</p>
              </div>
              <div className="mt-7">{children}</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
